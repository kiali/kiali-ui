import { AppenderString, DurationInSeconds, TimeInMilliseconds, TimeInSeconds } from '../types/Common';
import {
  DecoratedGraphElements,
  DecoratedGraphNodeWrapper,
  EdgeLabelMode,
  GraphDefinition,
  GraphElements,
  GraphType,
  GroupByType,
  NodeParamsType,
  NodeType,
  UNKNOWN
} from '../types/Graph';
import Namespace from '../types/Namespace';
import * as AlertUtils from '../utils/AlertUtils';
import { PromisesRegistry } from '../utils/CancelablePromises';
import * as API from './Api';
import { decorateGraphData } from '../store/Selectors/GraphData';
import EventEmitter from 'eventemitter3';
import { createSelector } from 'reselect';
import {
  AppHealth,
  NamespaceAppHealth,
  NamespaceServiceHealth,
  NamespaceWorkloadHealth,
  NA,
  ServiceHealth,
  WorkloadHealth
} from 'types/Health';

export const EMPTY_GRAPH_DATA = { nodes: [], edges: [] };
const PROMISE_KEY = 'CURRENT_REQUEST';

// GraphDataSource allows us to have multiple graphs in play, which functionally allows us to maintain
// the master graph page as well as to offer mini-graphs in the detail pages.
//
// GraphDataSource (GDS) emits events asynchronously and has the potential to disrupt the expected
// react+redux workflow typical of our components.  To avoid unexpected results here are some
// [anti-]patterns for using GraphDataSource:
//   - Do not set up GDS callbacks in nested components.  It is better to process the callbacks in the
//     top-level component and then update props (via react or redux) and let the lower components update normally.
//       - if A embeds B, do not have callbacks for the same GDS in A and B, just A
//   - Avoid accessing GDS fields to access fetch information (elements, timestamps, fetchParameters, etc).  In
//     short, the fields are volatile and can change at unexpected times.
//       - Instead, in the callbacks save what you need to local variables or properties.  Then use them to
//         trigger react/redux state changes normally.
//   - Avoid passing a GDS as a property.
//       - The only reason to do this is for an embedded component to access the GDS fields directly, which is
//         an anti-pattern explained above.  Having said that, if you are SURE the GDS is stable, it will work
//         (at this writing we still do this for mini-graphs).

type EmitEvents = {
  (eventName: 'loadStart', isPreviousDataInvalid: boolean, fetchParams: FetchParams): void;
  (eventName: 'emptyNamespaces', fetchParams: FetchParams): void;
  (eventName: 'fetchError', errorMessage: string | null, fetchParams: FetchParams): void;
  (
    eventName: 'fetchSuccess',
    graphTimestamp: TimeInSeconds,
    graphDuration: DurationInSeconds,
    graphData: DecoratedGraphElements,
    fetchParams: FetchParams
  ): void;
};

type NamespaceHealth = NamespaceAppHealth | NamespaceServiceHealth | NamespaceWorkloadHealth;
type NodeHealth = AppHealth | ServiceHealth | WorkloadHealth;

/*
type NodeHealth = {
  key: string;
  node: DecoratedGraphNodeWrapper;
};
*/

type HealthPromises = {
  appNamespacePromises: Map<string, Promise<NamespaceAppHealth>>;
  serviceNamespacePromises: Map<string, Promise<NamespaceServiceHealth>>;
  workloadNamespacePromises: Map<string, Promise<NamespaceWorkloadHealth>>;
};

export interface FetchParams {
  duration: DurationInSeconds;
  edgeLabelMode: EdgeLabelMode;
  graphType: GraphType;
  includeHealth: boolean;
  injectServiceNodes: boolean;
  namespaces: Namespace[];
  node?: NodeParamsType;
  queryTime?: TimeInMilliseconds; // default now
  showOperationNodes: boolean;
  showSecurity: boolean;
  showUnusedNodes: boolean;
}

type OnEvents = {
  (eventName: 'loadStart', callback: (isPreviousDataInvalid: boolean, fetchParams: FetchParams) => void): void;
  (eventName: 'emptyNamespaces', callback: (fetchParams: FetchParams) => void): void;
  (eventName: 'fetchError', callback: (errorMessage: string | null, fetchParams: FetchParams) => void): void;
  (
    eventName: 'fetchSuccess',
    callback: (
      graphTimestamp: TimeInSeconds,
      graphDuration: DurationInSeconds,
      graphData: DecoratedGraphElements,
      fetchParams: FetchParams
    ) => void
  ): void;
};

export default class GraphDataSource {
  public graphDuration: DurationInSeconds;
  public graphTimestamp: TimeInSeconds;

  private _errorMessage: string | null;
  private _fetchParams: FetchParams;
  private _isError: boolean;
  private _isLoading: boolean;

  private eventEmitter: EventEmitter;
  private graphElements: GraphElements;
  private promiseRegistry: PromisesRegistry;
  private decoratedData = createSelector(
    (graphData: GraphElements) => graphData,
    graphData => decorateGraphData(graphData)
  );

  private fetchStart: TimeInMilliseconds = 0;
  private fetchGraphEnd: TimeInMilliseconds = 0;
  private fetchOutsiderHealthStart: TimeInMilliseconds = 0;
  private fetchHealthStart: TimeInMilliseconds = 0;

  // Public methods

  constructor() {
    this.graphElements = EMPTY_GRAPH_DATA;
    this.graphDuration = 0;
    this.graphTimestamp = 0;

    this.eventEmitter = new EventEmitter();
    this.promiseRegistry = new PromisesRegistry();

    this._errorMessage = null;
    this._fetchParams = {
      duration: 0,
      edgeLabelMode: EdgeLabelMode.NONE,
      graphType: GraphType.VERSIONED_APP,
      includeHealth: true,
      injectServiceNodes: true,
      namespaces: [],
      showOperationNodes: false,
      showSecurity: false,
      showUnusedNodes: false
    };
    this._isError = this._isLoading = false;
  }

  public fetchGraphData = (fetchParams: FetchParams) => {
    this.fetchStart = Date.now();

    const previousFetchParams = this.fetchParameters;

    // Copy fetch parameters to a local attribute
    this._fetchParams = { ...fetchParams };

    if (fetchParams.namespaces.length === 0) {
      this._isLoading = this._isError = false;
      this.graphElements = EMPTY_GRAPH_DATA;
      this.graphDuration = 0;
      this.graphTimestamp = 0;
      this.emit('emptyNamespaces', fetchParams);
      return;
    }

    const restParams: any = {
      duration: fetchParams.duration + 's',
      graphType: fetchParams.graphType,
      injectServiceNodes: fetchParams.injectServiceNodes
    };

    if (fetchParams.graphType === GraphType.APP || fetchParams.graphType === GraphType.VERSIONED_APP) {
      restParams.groupBy = GroupByType.APP;
    }

    if (fetchParams.queryTime) {
      restParams.queryTime = String(Math.floor(fetchParams.queryTime / 1000));
    }

    // Some appenders are expensive so only specify an appender if needed.
    let appenders: AppenderString = 'deadNode,sidecarsCheck,serviceEntry,istio';

    if (fetchParams.showOperationNodes) {
      appenders += ',aggregateNode';
    }

    if (!fetchParams.node && fetchParams.showUnusedNodes) {
      // note we only use the unusedNode appender if this is NOT a drilled-in node graph and
      // the user specifically requests to see unused nodes.
      appenders += ',unusedNode';
    }

    if (fetchParams.showSecurity) {
      appenders += ',securityPolicy';
    }

    switch (fetchParams.edgeLabelMode) {
      case EdgeLabelMode.RESPONSE_TIME_95TH_PERCENTILE:
        appenders += ',responseTime';
        break;

      case EdgeLabelMode.REQUESTS_PER_SECOND:
      case EdgeLabelMode.REQUESTS_PERCENTAGE:
      case EdgeLabelMode.NONE:
      default:
        break;
    }
    restParams.appenders = appenders;

    this._isLoading = true;
    this._isError = false;

    const isPreviousDataInvalid =
      previousFetchParams.namespaces.map(ns => ns.name).join() !==
        this.fetchParameters.namespaces.map(ns => ns.name).join() ||
      previousFetchParams.node !== this.fetchParameters.node ||
      previousFetchParams.graphType !== this.fetchParameters.graphType ||
      previousFetchParams.includeHealth !== this.fetchParameters.includeHealth ||
      previousFetchParams.injectServiceNodes !== this.fetchParameters.injectServiceNodes ||
      previousFetchParams.showOperationNodes !== this.fetchParameters.showOperationNodes ||
      previousFetchParams.showUnusedNodes !== this.fetchParameters.showUnusedNodes;

    if (isPreviousDataInvalid) {
      // Reset the graph data
      this.graphElements = EMPTY_GRAPH_DATA;
      this.graphDuration = 0;
      this.graphTimestamp = 0;
    }

    this.emit('loadStart', isPreviousDataInvalid, fetchParams);
    if (fetchParams.node) {
      this.fetchDataForNode(restParams);
    } else {
      this.fetchDataForNamespaces(restParams);
    }
  };

  public on: OnEvents = (eventName: any, callback: any) => {
    this.eventEmitter.on(eventName, callback);
  };

  public removeListener: OnEvents = (eventName: any, callback: any) => {
    this.eventEmitter.removeListener(eventName, callback);
  };

  // Some helpers

  public fetchForApp = (
    duration: DurationInSeconds,
    namespace: string,
    app: string,
    includeHealth?: boolean,
    injectServiceNodes?: boolean
  ) => {
    const params = GraphDataSource.defaultFetchParams(duration, namespace);
    params.graphType = GraphType.APP;
    if (includeHealth !== undefined) {
      params.includeHealth = includeHealth;
    }
    if (injectServiceNodes !== undefined) {
      params.injectServiceNodes = injectServiceNodes;
    }
    params.node!.nodeType = NodeType.APP;
    params.node!.app = app;
    this.fetchGraphData(params);
  };

  public fetchForWorkload = (
    duration: DurationInSeconds,
    namespace: string,
    workload: string,
    includeHealth?: boolean,
    injectServiceNodes?: boolean
  ) => {
    const params = GraphDataSource.defaultFetchParams(duration, namespace);
    params.graphType = GraphType.WORKLOAD;
    if (includeHealth !== undefined) {
      params.includeHealth = includeHealth;
    }
    if (injectServiceNodes !== undefined) {
      params.injectServiceNodes = injectServiceNodes;
    }
    params.node!.nodeType = NodeType.WORKLOAD;
    params.node!.workload = workload;
    this.fetchGraphData(params);
  };

  public fetchForService = (
    duration: DurationInSeconds,
    namespace: string,
    service: string,
    includeHealth?: boolean,
    injectServiceNodes?: boolean
  ) => {
    const params = GraphDataSource.defaultFetchParams(duration, namespace);
    params.graphType = GraphType.WORKLOAD;
    if (includeHealth !== undefined) {
      params.includeHealth = includeHealth;
    }
    if (injectServiceNodes !== undefined) {
      params.injectServiceNodes = injectServiceNodes;
    }
    params.node!.nodeType = NodeType.SERVICE;
    params.node!.service = service;
    this.fetchGraphData(params);
  };

  public fetchForNamespace = (
    duration: DurationInSeconds,
    namespace: string,
    includeHealth?: boolean,
    injectServiceNodes?: boolean
  ) => {
    const params = GraphDataSource.defaultFetchParams(duration, namespace);
    params.graphType = GraphType.WORKLOAD;
    if (includeHealth !== undefined) {
      params.includeHealth = includeHealth;
    }
    if (injectServiceNodes !== undefined) {
      params.injectServiceNodes = injectServiceNodes;
    }
    params.showSecurity = true;
    if (includeHealth !== undefined) {
      params.includeHealth = includeHealth;
    }
  };

  // Private methods

  private static defaultFetchParams(duration: DurationInSeconds, namespace: string): FetchParams {
    return {
      namespaces: [{ name: namespace }],
      duration: duration,
      graphType: GraphType.WORKLOAD,
      includeHealth: true,
      injectServiceNodes: true,
      edgeLabelMode: EdgeLabelMode.NONE,
      showOperationNodes: false,
      showSecurity: false,
      showUnusedNodes: false,
      node: {
        app: '',
        namespace: { name: namespace },
        nodeType: NodeType.UNKNOWN,
        service: '',
        version: '',
        workload: ''
      }
    };
  }

  private emit: EmitEvents = (eventName: any, ...args) => {
    this.eventEmitter.emit(eventName, ...args);
  };

  private fetchDataForNamespaces = (restParams: any) => {
    const namespaces = this.fetchParameters.namespaces.map(namespace => namespace.name);
    const hasApps =
      this.fetchParameters.graphType === GraphType.APP || this.fetchParameters.graphType === GraphType.VERSIONED_APP;
    const healthPromises = this.fetchParameters.includeHealth ? this.fetchHealth(namespaces, hasApps) : undefined;

    restParams.namespaces = namespaces.join(',');
    this.promiseRegistry.register(PROMISE_KEY, API.getGraphElements(restParams)).then(
      response => {
        const responseData: any = response.data;
        this.graphElements = responseData && responseData.elements ? responseData.elements : EMPTY_GRAPH_DATA;
        this.graphTimestamp = responseData && responseData.timestamp ? responseData.timestamp : 0;
        this.graphDuration = responseData && responseData.duration ? responseData.duration : 0;
        const decoratedGraphElements = this.graphData;
        this.fetchGraphEnd = Date.now();
        if (this.fetchParameters.includeHealth) {
          this.applyHealth(namespaces, hasApps, decoratedGraphElements, healthPromises!);
        } else {
          this._isLoading = this._isError = false;
          this.emit(
            'fetchSuccess',
            this.graphTimestamp,
            this.graphDuration,
            decoratedGraphElements,
            this.fetchParameters
          );
        }
      },
      error => {
        this._isLoading = false;
        if (error.isCanceled) {
          return;
        }

        this._isError = true;
        this._errorMessage = API.getErrorString(error);
        AlertUtils.addError('Cannot load the graph', error);
        this.emit('fetchError', `Cannot load the graph: ${this.errorMessage}`, this.fetchParameters);
      }
    );
  };

  private fetchDataForNode = (restParams: any) => {
    const namespaces = [this.fetchParameters.node!.namespace.name];
    const hasApps =
      this.fetchParameters.graphType === GraphType.APP || this.fetchParameters.graphType === GraphType.VERSIONED_APP;
    const healthPromises = this.fetchParameters.includeHealth ? this.fetchHealth(namespaces, hasApps) : undefined;

    this.promiseRegistry.register(PROMISE_KEY, API.getNodeGraphElements(this.fetchParameters.node!, restParams)).then(
      response => {
        const responseData: any = response.data;
        this.graphElements = responseData && responseData.elements ? responseData.elements : EMPTY_GRAPH_DATA;
        this.graphTimestamp = responseData && responseData.timestamp ? responseData.timestamp : 0;
        this.graphDuration = responseData && responseData.duration ? responseData.duration : 0;
        const decoratedGraphElements = this.graphData;
        if (this.fetchParameters.includeHealth) {
          this.applyHealth(namespaces, hasApps, decoratedGraphElements, healthPromises!);
        } else {
          this._isLoading = this._isError = false;
          this.emit(
            'fetchSuccess',
            this.graphTimestamp,
            this.graphDuration,
            decoratedGraphElements,
            this.fetchParameters
          );
        }
      },
      error => {
        this._isLoading = false;
        if (error.isCanceled) {
          return;
        }

        this._isError = true;
        this._errorMessage = API.getErrorString(error);
        AlertUtils.addError('Cannot load the graph', error);
        this.emit('fetchError', this.errorMessage, this.fetchParameters);
      }
    );
  };

  private fetchHealth = (namespaces: string[], hasApps: boolean): HealthPromises => {
    this.fetchHealthStart = Date.now();
    console.log('fetchHealth');

    const duration = this.fetchParameters.duration;
    const appNamespacePromises = new Map<string, Promise<NamespaceAppHealth>>();
    const serviceNamespacePromises = new Map<string, Promise<NamespaceServiceHealth>>();
    const workloadNamespacePromises = new Map<string, Promise<NamespaceWorkloadHealth>>();

    // Asynchronously fetch health
    for (const namespace of namespaces) {
      if (hasApps) {
        appNamespacePromises.set(namespace, API.getNamespaceAppHealth(namespace, duration));
      }
      serviceNamespacePromises.set(namespace, API.getNamespaceServiceHealth(namespace, duration));
      workloadNamespacePromises.set(namespace, API.getNamespaceWorkloadHealth(namespace, duration));
    }

    return {
      appNamespacePromises: appNamespacePromises,
      serviceNamespacePromises: serviceNamespacePromises,
      workloadNamespacePromises: workloadNamespacePromises
    };
  };

  private applyHealth = (
    namespaces: string[],
    hasApps: boolean,
    decoratedGraphElements: DecoratedGraphElements,
    healthPromises: HealthPromises
  ) => {
    console.log('applyHealth');
    if (!decoratedGraphElements.nodes || decoratedGraphElements.nodes.length === 0) {
      this._isLoading = false;
      this.emit('fetchSuccess', this.graphTimestamp, this.graphDuration, decoratedGraphElements, this.fetchParameters);

      return;
    }

    const appNamespaceHealth = new Map<string, NamespaceAppHealth>();
    const serviceNamespaceHealth = new Map<string, NamespaceServiceHealth>();
    const workloadNamespaceHealth = new Map<string, NamespaceWorkloadHealth>();

    let allPromises: Promise<NamespaceHealth>[] = Array.from(healthPromises.appNamespacePromises.values());
    allPromises = allPromises.concat(Array.from(healthPromises.serviceNamespacePromises.values()));
    allPromises = allPromises.concat(Array.from(healthPromises.workloadNamespacePromises.values()));

    new PromisesRegistry().registerAll('HEALTH_PROMISES', allPromises).then(
      nsHealths => {
        let i = 0;
        if (hasApps) {
          namespaces.forEach(ns => appNamespaceHealth.set(ns, nsHealths[i++]));
        }
        namespaces.forEach(ns => serviceNamespaceHealth.set(ns, nsHealths[i++]));
        namespaces.forEach(ns => workloadNamespaceHealth.set(ns, nsHealths[i++]));

        for (const node of decoratedGraphElements.nodes!) {
          if (node.data.isInaccessible || node.data.isOutside) {
            continue;
          }

          const namespace = node.data.namespace;
          const nodeType = node.data.nodeType;
          const workload = node.data.workload;
          const workloadOk = workload && workload !== '' && workload !== UNKNOWN;
          // use workload health when workload is set and valid (workload nodes or versionApp nodes)
          const useWorkloadHealth = nodeType === NodeType.WORKLOAD || (nodeType === NodeType.APP && workloadOk);

          let nsHealth: NamespaceHealth | undefined;
          let key: string | undefined;
          if (useWorkloadHealth) {
            nsHealth = workloadNamespaceHealth.get(namespace);
            key = node.data.workload!;
          } else if (nodeType === NodeType.APP) {
            nsHealth = appNamespaceHealth.get(namespace);
            key = node.data.app!;
          } else if (nodeType === NodeType.SERVICE) {
            nsHealth = serviceNamespaceHealth.get(namespace);
            key = node.data.service!;
          }

          if (nsHealth) {
            const health = nsHealth[key!];
            if (health) {
              node.data.health = health;
              node.data.healthStatus = health.getGlobalStatus().name;
              console.log(`health for [${nodeType}] [${key}] = ${node.data.healthStatus}`);
            } else {
              node.data.healthStatus = NA.name;
              console.debug(`No health found for [${nodeType}] [${key}]`);
            }
          } else {
            node.data.healthStatus = NA.name;
            console.debug(`No health applicable for [${nodeType}]`);
          }
        }

        this.fetchOutsiderHealthStart = Date.now();
        this.outsiderHealth(decoratedGraphElements);
      },
      error => {
        this._isLoading = false;
        if (error.isCanceled) {
          return;
        }

        this._isError = true;
        this._errorMessage = API.getErrorString(error);
        AlertUtils.addError('Cannot load the graph [health]', error);
        this.emit('fetchError', this.errorMessage, this.fetchParameters);
      }
    );
  };

  private outsiderHealth = (decoratedGraphElements: DecoratedGraphElements) => {
    const outsiderNodes: DecoratedGraphNodeWrapper[] = [];
    const outsiderPromises: Promise<NodeHealth>[] = [];

    console.log('outsiderHealth');

    decoratedGraphElements
      .nodes!.filter(n => n.data.isOutside && !n.data.isInaccessible)
      .forEach(o => {
        let promise: Promise<NodeHealth>;
        const namespace = o.data.namespace;
        const nodeType = o.data.nodeType;
        const workload = o.data.workload;
        const workloadOk = workload && workload !== '' && workload !== UNKNOWN;
        // use workload health when workload is set and valid (workload nodes or versionApp nodes)
        const useWorkloadHealth = nodeType === NodeType.WORKLOAD || (nodeType === NodeType.APP && workloadOk);

        if (useWorkloadHealth) {
          console.log(`Getting health for outsider ${nodeType} ${workload}`);
          promise = API.getWorkloadHealth(namespace, workload!, '', this.graphDuration, true);
        } else if (nodeType === NodeType.APP) {
          console.log(`Getting health for outsider ${nodeType} ${o.data.app}`);
          promise = API.getAppHealth(namespace, o.data.app!, this.graphDuration, true);
        } else if (nodeType === NodeType.SERVICE) {
          console.log(`Getting health for outsider ${nodeType} ${o.data.service}`);
          promise = API.getAppHealth(namespace, o.data.service!, this.graphDuration, true);
        }
        outsiderNodes.push(o);
        outsiderPromises.push(promise!);
      });

    new PromisesRegistry().registerAll('OUTSIDER_HEALTH_PROMISES', outsiderPromises).then(
      nodeHealths => {
        nodeHealths.forEach((nh, i) => {
          const o = outsiderNodes[i];
          const nodeType = o.data.nodeType;
          const workload = o.data.workload;
          const workloadOk = workload && workload !== '' && workload !== UNKNOWN;
          // use workload health when workload is set and valid (workload nodes or versionApp nodes)
          const useWorkloadHealth = nodeType === NodeType.WORKLOAD || (nodeType === NodeType.APP && workloadOk);
          let health: NodeHealth;

          if (useWorkloadHealth) {
            health = nh as WorkloadHealth;
            console.log(`health for outsider ${nodeType} ${workload} = ${health!.getGlobalStatus()}`);
          } else if (nodeType === NodeType.APP) {
            health = nh as AppHealth;
            console.log(`health for outsider ${nodeType} ${o.data.app} = ${health!.getGlobalStatus()}`);
          } else if (nodeType === NodeType.SERVICE) {
            health = nh as ServiceHealth;
            console.log(`health for outsider ${nodeType} ${o.data.service} = ${health!.getGlobalStatus()}`);
          }

          o.data.health = health!;
          o.data.healthStatus = health!.getGlobalStatus().name;
        });

        console.log('Emitting...');
        const now = Date.now();
        const total = now - this.fetchStart;
        const graphTotal = this.fetchGraphEnd - this.fetchStart;
        const graphPercent = Number((graphTotal / total) * 100).toFixed(2);
        const healthTotal = this.fetchOutsiderHealthStart - this.fetchHealthStart;
        const healthPercent = Number((healthTotal / total) * 100).toFixed(2);
        const outsiderHealthTotal = now - this.fetchOutsiderHealthStart;
        const outsiderHealthPercent = Number((outsiderHealthTotal / total) * 100).toFixed(2);
        console.log(`Total  fetch time=${total}ms`);
        console.log(`Graph  fetch time=${graphTotal}ms (${graphPercent})%`);
        console.log(`Health fetch time=${healthTotal}ms (${healthPercent})%`);
        console.log(`Outsdr fetch time=${outsiderHealthTotal}ms (${outsiderHealthPercent})%`);
        this._isLoading = false;
        this.emit(
          'fetchSuccess',
          this.graphTimestamp,
          this.graphDuration,
          decoratedGraphElements,
          this.fetchParameters
        );
      },
      error => {
        this._isLoading = false;
        if (error.isCanceled) {
          return;
        }

        this._isError = true;
        this._errorMessage = API.getErrorString(error);
        AlertUtils.addError('Cannot load the graph [health]', error);
        this.emit('fetchError', this.errorMessage, this.fetchParameters);
      }
    );
  };

  // Getters and setters
  public get graphData(): DecoratedGraphElements {
    return this.decoratedData(this.graphElements);
  }

  public get graphDefinition(): GraphDefinition {
    return {
      duration: this.graphDuration,
      elements: this.graphElements,
      timestamp: this.graphTimestamp,
      graphType: this.fetchParameters.graphType
    };
  }

  public get errorMessage(): string | null {
    return this._errorMessage;
  }

  public get fetchParameters(): FetchParams {
    return this._fetchParams;
  }

  public get isError(): boolean {
    return this._isError;
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }
}
