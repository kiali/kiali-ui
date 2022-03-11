import * as Cy from 'cytoscape';
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { RouteComponentProps } from 'react-router-dom';
import FlexView from 'react-flexview';
import { style } from 'typestyle';
import history from '../../app/History';
import { DurationInSeconds, IntervalInMilliseconds, TimeInMilliseconds, TimeInSeconds } from '../../types/Common';
import { MessageType } from '../../types/MessageCenter';
import Namespace from '../../types/Namespace';
import {
  CytoscapeEvent,
  DecoratedGraphElements,
  EdgeLabelMode,
  GraphDefinition,
  GraphType,
  Layout,
  NodeParamsType,
  NodeType,
  SummaryData,
  UNKNOWN,
  BoxByType,
  TrafficRate,
  RankMode,
  RankResult,
  EdgeMode
} from '../../types/Graph';
import { computePrometheusRateParams } from '../../services/Prometheus';
import * as AlertUtils from '../../utils/AlertUtils';
import CytoscapeGraph, { GraphNodeDoubleTapEvent } from '../../components/CytoscapeGraph/CytoscapeGraph';
import CytoscapeToolbarContainer from '../../components/CytoscapeGraph/CytoscapeToolbar';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import { GraphUrlParams, makeNodeGraphUrlFromParams } from '../../components/Nav/NavUtils';
import GraphToolbarContainer from './GraphToolbar/GraphToolbar';
import GraphLegend from './GraphLegend';
import EmptyGraphLayout from '../../components/CytoscapeGraph/EmptyGraphLayout';
import SummaryPanel from './SummaryPanel';
import {
  activeNamespacesSelector,
  durationSelector,
  edgeLabelsSelector,
  edgeModeSelector,
  findValueSelector,
  graphTypeSelector,
  hideValueSelector,
  lastRefreshAtSelector,
  meshWideMTLSEnabledSelector,
  refreshIntervalSelector,
  replayActiveSelector,
  replayQueryTimeSelector,
  trafficRatesSelector
} from '../../store/Selectors';
import { KialiAppState } from '../../store/Store';
import { KialiAppAction } from '../../actions/KialiAppAction';
import { GraphActions } from '../../actions/GraphActions';
import { GraphToolbarActions } from '../../actions/GraphToolbarActions';
import { NodeContextMenuContainer } from '../../components/CytoscapeGraph/ContextMenu/NodeContextMenu';
import { PFColors } from 'components/Pf/PfColors';
import { TourActions } from 'actions/TourActions';
import { arrayEquals } from 'utils/Common';
import { isKioskMode, getFocusSelector, unsetFocusSelector, getTraceId } from 'utils/SearchParamUtils';
import { Badge, Chip } from '@patternfly/react-core';
import { toRangeString } from 'components/Time/Utils';
import { replayBorder } from 'components/Time/Replay';
import GraphDataSource, { FetchParams, EMPTY_GRAPH_DATA } from '../../services/GraphDataSource';
import { NamespaceActions } from '../../actions/NamespaceAction';
import GraphThunkActions from '../../actions/GraphThunkActions';
import { JaegerTrace } from 'types/JaegerInfo';
import { JaegerThunkActions } from 'actions/JaegerThunkActions';
import GraphTour from 'pages/Graph/GraphHelpTour';
import { getNextTourStop, TourInfo } from 'components/Tour/TourStop';
import { EdgeContextMenu } from 'components/CytoscapeGraph/ContextMenu/EdgeContextMenu';
import * as CytoscapeGraphUtils from '../../components/CytoscapeGraph/CytoscapeGraphUtils';

// GraphURLPathProps holds path variable values.  Currently all path variables are relevant only to a node graph
type GraphURLPathProps = {
  aggregate: string;
  aggregateValue: string;
  app: string;
  namespace: string;
  service: string;
  version: string;
  workload: string;
};

type ReduxProps = {
  activeNamespaces: Namespace[];
  activeTour?: TourInfo;
  boxByCluster: boolean;
  boxByNamespace: boolean;
  compressOnHide: boolean;
  duration: DurationInSeconds; // current duration (dropdown) setting
  edgeLabels: EdgeLabelMode[];
  edgeMode: EdgeMode;
  endTour: () => void;
  findValue: string;
  graphType: GraphType;
  hideValue: string;
  isPageVisible: boolean;
  lastRefreshAt: TimeInMilliseconds;
  layout: Layout;
  namespaceLayout: Layout;
  mtlsEnabled: boolean;
  node?: NodeParamsType;
  onNamespaceChange: () => void;
  onReady: (cytoscapeRef: any) => void;
  rankBy: RankMode[];
  refreshInterval: IntervalInMilliseconds;
  replayActive: boolean;
  replayQueryTime: TimeInMilliseconds;
  setActiveNamespaces: (namespaces: Namespace[]) => void;
  setGraphDefinition: (graphDefinition: GraphDefinition) => void;
  setRankResult: (result: RankResult) => void;
  setNode: (node?: NodeParamsType) => void;
  setTraceId: (traceId?: string) => void;
  setUpdateTime: (val: TimeInMilliseconds) => void;
  showIdleEdges: boolean;
  showIdleNodes: boolean;
  showLegend: boolean;
  showMissingSidecars: boolean;
  showOperationNodes: boolean;
  showRank: boolean;
  showSecurity: boolean;
  showServiceNodes: boolean;
  showTrafficAnimation: boolean;
  showVirtualServices: boolean;
  startTour: ({ info: TourInfo, stop: number }) => void;
  summaryData: SummaryData | null;
  trace?: JaegerTrace;
  trafficRates: TrafficRate[];
  toggleIdleNodes: () => void;
  toggleLegend: () => void;
  updateSummary: (event: CytoscapeEvent) => void;
};

export type GraphPageProps = RouteComponentProps<Partial<GraphURLPathProps>> & ReduxProps;

export type GraphData = {
  elements: DecoratedGraphElements;
  elementsChanged: boolean; // true if current elements differ from previous fetch, can be used as an optimization.
  errorMessage?: string;
  fetchParams: FetchParams;
  isLoading: boolean;
  isError?: boolean;
  timestamp: TimeInMilliseconds;
};

type GraphPageState = {
  graphData: GraphData;
};

const NUMBER_OF_DATAPOINTS = 30;

const containerStyle = style({
  minHeight: '350px',
  // TODO: try flexbox to remove this calc
  height: 'calc(100vh - 113px)' // View height minus top bar height minus secondary masthead
});

const kioskContainerStyle = style({
  minHeight: '350px',
  height: 'calc(100vh - 10px)' // View height minus top bar height
});

const cytoscapeGraphContainerStyle = style({ flex: '1', minWidth: '350px', zIndex: 0, paddingRight: '5px' });
const cytoscapeGraphWrapperDivStyle = style({ position: 'relative', backgroundColor: PFColors.Black200 });
const cytoscapeToolbarWrapperDivStyle = style({
  position: 'absolute',
  bottom: '5px',
  zIndex: 2,
  borderStyle: 'hidden'
});

const graphTimeRangeDivStyle = style({
  position: 'absolute',
  top: '10px',
  left: '10px',
  width: 'auto',
  zIndex: 2,
  backgroundColor: PFColors.White
});

const whiteBackground = style({
  backgroundColor: PFColors.White
});

const replayBackground = style({
  backgroundColor: PFColors.Replay
});

const graphLegendStyle = style({
  right: '0',
  bottom: '10px',
  position: 'absolute',
  overflow: 'hidden'
});

const GraphErrorBoundaryFallback = () => {
  return (
    <div className={cytoscapeGraphContainerStyle}>
      <EmptyGraphLayout
        isError={true}
        isMiniGraph={false}
        namespaces={[]}
        showIdleNodes={false}
        toggleIdleNodes={() => undefined}
      />
    </div>
  );
};

export class GraphPage extends React.Component<GraphPageProps, GraphPageState> {
  private readonly errorBoundaryRef: any;
  private cytoscapeGraphRef: any;
  private focusSelector?: string;
  private graphDataSource: GraphDataSource;

  static getNodeParamsFromProps(props: RouteComponentProps<Partial<GraphURLPathProps>>): NodeParamsType | undefined {
    const aggregate = props.match.params.aggregate;
    const aggregateOk = aggregate && aggregate !== UNKNOWN;
    const aggregateValue = props.match.params.aggregateValue;
    const aggregateValueOk = aggregateValue && aggregateValue !== UNKNOWN;
    const app = props.match.params.app;
    const appOk = app && app !== UNKNOWN;
    const namespace = props.match.params.namespace;
    const namespaceOk = namespace && namespace !== UNKNOWN;
    const service = props.match.params.service;
    const serviceOk = service && service !== UNKNOWN;
    const workload = props.match.params.workload;
    const workloadOk = workload && workload !== UNKNOWN;
    if (!aggregateOk && !aggregateValueOk && !appOk && !namespaceOk && !serviceOk && !workloadOk) {
      // @ts-ignore
      return;
    }

    let nodeType: NodeType;
    let version: string | undefined;
    if (aggregateOk) {
      nodeType = NodeType.AGGREGATE;
      version = '';
    } else if (appOk || workloadOk) {
      nodeType = appOk ? NodeType.APP : NodeType.WORKLOAD;
      version = props.match.params.version;
    } else {
      nodeType = NodeType.SERVICE;
      version = '';
    }
    return {
      aggregate: aggregate!,
      aggregateValue: aggregateValue!,
      app: app!,
      namespace: { name: namespace! },
      nodeType: nodeType,
      service: service!,
      version: version,
      workload: workload!
    };
  }

  static isNodeChanged(prevNode?: NodeParamsType, node?: NodeParamsType): boolean {
    if (prevNode === node) {
      return false;
    }
    if ((prevNode && !node) || (!prevNode && node)) {
      return true;
    }
    if (prevNode && node) {
      const nodeAggregateHasChanged =
        prevNode.aggregate !== node.aggregate || prevNode.aggregateValue !== node.aggregateValue;
      const nodeAppHasChanged = prevNode.app !== node.app;
      const nodeServiceHasChanged = prevNode.service !== node.service;
      const nodeVersionHasChanged = prevNode.version !== node.version;
      const nodeTypeHasChanged = prevNode.nodeType !== node.nodeType;
      const nodeWorkloadHasChanged = prevNode.workload !== node.workload;
      return (
        nodeAggregateHasChanged ||
        nodeAppHasChanged ||
        nodeServiceHasChanged ||
        nodeVersionHasChanged ||
        nodeWorkloadHasChanged ||
        nodeTypeHasChanged
      );
    }
    return false;
  }

  constructor(props: GraphPageProps) {
    super(props);
    this.errorBoundaryRef = React.createRef();
    this.cytoscapeGraphRef = React.createRef();
    this.focusSelector = getFocusSelector();

    this.graphDataSource = new GraphDataSource();

    this.state = {
      graphData: {
        elements: { edges: [], nodes: [] },
        elementsChanged: false,
        fetchParams: this.graphDataSource.fetchParameters,
        isLoading: true,
        timestamp: 0
      }
    };
  }

  componentDidMount() {
    // Connect to graph data source updates
    this.graphDataSource.on('loadStart', this.handleGraphDataSourceStart);
    this.graphDataSource.on('fetchError', this.handleGraphDataSourceError);
    this.graphDataSource.on('fetchSuccess', this.handleGraphDataSourceSuccess);
    this.graphDataSource.on('emptyNamespaces', this.handleGraphDataSourceEmpty);

    // Let URL override current redux state at mount time.  We usually do this in
    // the constructor but it seems to work better here when the initial URL
    // is for a node graph.  When setting the node here it is available for the
    // loadGraphFromBackend() call.
    const urlNode = GraphPage.getNodeParamsFromProps(this.props);
    if (GraphPage.isNodeChanged(urlNode, this.props.node)) {
      // add the node namespace if necessary, but don't lose previously selected namespaces
      if (urlNode && !this.props.activeNamespaces.map(ns => ns.name).includes(urlNode.namespace.name)) {
        this.props.setActiveNamespaces([urlNode.namespace, ...this.props.activeNamespaces]);
      }
      this.props.setNode(urlNode);
    }

    const urlTrace = getTraceId();
    if (urlTrace !== this.props.trace?.traceID) {
      this.props.setTraceId(urlTrace);
    }
  }

  componentDidUpdate(prev: GraphPageProps) {
    const curr = this.props;

    // Ensure we initialize the graph. We wait for the first update so that
    // the toolbar can render and ensure all redux props are updated with URL
    // settings. That in turn ensures the initial fetchParams are correct.
    const isInitialLoad = !this.state.graphData.timestamp;

    const activeNamespacesChanged = !arrayEquals(
      prev.activeNamespaces,
      curr.activeNamespaces,
      (n1, n2) => n1.name === n2.name
    );

    // Ensure we initialize the graph when there is a change to activeNamespaces.
    if (activeNamespacesChanged) {
      this.props.onNamespaceChange();
    }
    if (
      isInitialLoad ||
      activeNamespacesChanged ||
      prev.boxByCluster !== curr.boxByCluster ||
      prev.boxByNamespace !== curr.boxByNamespace ||
      prev.duration !== curr.duration ||
      (prev.edgeLabels !== curr.edgeLabels && // test for edge labels that invoke graph gen appenders
        (curr.edgeLabels.includes(EdgeLabelMode.RESPONSE_TIME_GROUP) ||
          curr.edgeLabels.includes(EdgeLabelMode.THROUGHPUT_GROUP))) ||
      (prev.findValue !== curr.findValue && curr.findValue.includes('label:')) ||
      prev.graphType !== curr.graphType ||
      (prev.hideValue !== curr.hideValue && curr.hideValue.includes('label:')) ||
      (prev.lastRefreshAt !== curr.lastRefreshAt && curr.replayQueryTime === 0) ||
      (prev.replayActive !== curr.replayActive && !curr.replayActive) ||
      prev.replayQueryTime !== curr.replayQueryTime ||
      prev.showIdleEdges !== curr.showIdleEdges ||
      prev.showOperationNodes !== curr.showOperationNodes ||
      prev.showServiceNodes !== curr.showServiceNodes ||
      prev.showSecurity !== curr.showSecurity ||
      prev.showIdleNodes !== curr.showIdleNodes ||
      prev.trafficRates !== curr.trafficRates ||
      GraphPage.isNodeChanged(prev.node, curr.node)
    ) {
      this.loadGraphDataFromBackend();
    }

    if (!!this.focusSelector) {
      this.focusSelector = undefined;
      unsetFocusSelector();
    }

    if (
      prev.layout.name !== curr.layout.name ||
      prev.namespaceLayout.name !== curr.namespaceLayout.name ||
      activeNamespacesChanged
    ) {
      this.errorBoundaryRef.current.cleanError();
    }

    if (curr.showLegend && this.props.activeTour) {
      this.props.endTour();
    }
  }

  componentWillUnmount() {
    // Disconnect from graph data source updates
    this.graphDataSource.removeListener('loadStart', this.handleGraphDataSourceStart);
    this.graphDataSource.removeListener('fetchError', this.handleGraphDataSourceError);
    this.graphDataSource.removeListener('fetchSuccess', this.handleGraphDataSourceSuccess);
    this.graphDataSource.removeListener('emptyNamespaces', this.handleGraphDataSourceEmpty);
  }

  render() {
    let conStyle = containerStyle;
    if (isKioskMode()) {
      conStyle = kioskContainerStyle;
    }
    const isEmpty = !(
      this.state.graphData.elements.nodes && Object.keys(this.state.graphData.elements.nodes).length > 0
    );
    const isReady = !(isEmpty || this.state.graphData.isError);
    const isReplayReady = this.props.replayActive && !!this.props.replayQueryTime;
    const cy = this.cytoscapeGraphRef && this.cytoscapeGraphRef.current ? this.cytoscapeGraphRef.current.getCy() : null;
    return (
      <>
        <FlexView className={conStyle} column={true}>
          <div>
            <GraphToolbarContainer
              cy={cy}
              disabled={this.state.graphData.isLoading}
              elementsChanged={this.state.graphData.elementsChanged}
              onToggleHelp={this.toggleHelp}
            />
          </div>
          <FlexView
            grow={true}
            className={`${cytoscapeGraphWrapperDivStyle} ${this.props.replayActive && replayBorder}`}
          >
            <ErrorBoundary
              ref={this.errorBoundaryRef}
              onError={this.notifyError}
              fallBackComponent={<GraphErrorBoundaryFallback />}
            >
              {this.props.showLegend && (
                <GraphLegend
                  className={graphLegendStyle}
                  isMTLSEnabled={this.props.mtlsEnabled}
                  closeLegend={this.props.toggleLegend}
                />
              )}
              {isReady && (
                <Chip
                  className={`${graphTimeRangeDivStyle} ${
                    this.props.replayActive ? replayBackground : whiteBackground
                  }`}
                  isOverflowChip={true}
                  isReadOnly={true}
                >
                  {this.props.replayActive && <Badge style={{ marginRight: '4px' }} isRead={true}>{`Replay`}</Badge>}
                  {!isReplayReady && this.props.replayActive && `click Play to start`}
                  {!isReplayReady && !this.props.replayActive && `${this.displayTimeRange()}`}
                  {isReplayReady && `${this.displayTimeRange()}`}
                </Chip>
              )}
              {(!this.props.replayActive || isReplayReady) && (
                <CytoscapeGraph
                  containerClassName={cytoscapeGraphContainerStyle}
                  contextMenuEdgeComponent={EdgeContextMenu}
                  contextMenuNodeComponent={NodeContextMenuContainer}
                  focusSelector={this.focusSelector}
                  graphData={this.state.graphData}
                  isMTLSEnabled={this.props.mtlsEnabled}
                  onEmptyGraphAction={this.handleEmptyGraphAction}
                  onNodeDoubleTap={this.handleDoubleTap}
                  ref={refInstance => this.setCytoscapeGraph(refInstance)}
                  {...this.props}
                />
              )}
              {isReady && (
                <div className={cytoscapeToolbarWrapperDivStyle}>
                  <CytoscapeToolbarContainer
                    cytoscapeGraphRef={this.cytoscapeGraphRef}
                    disabled={this.state.graphData.isLoading}
                  />
                </div>
              )}
            </ErrorBoundary>
            {this.props.summaryData && (
              <SummaryPanel
                data={this.props.summaryData}
                duration={this.state.graphData.fetchParams.duration}
                graphType={this.props.graphType}
                injectServiceNodes={this.props.showServiceNodes}
                isPageVisible={this.props.isPageVisible}
                namespaces={this.props.activeNamespaces}
                queryTime={this.state.graphData.timestamp / 1000}
                trafficRates={this.props.trafficRates}
                {...computePrometheusRateParams(this.props.duration, NUMBER_OF_DATAPOINTS)}
              />
            )}
          </FlexView>
        </FlexView>
      </>
    );
  }

  private handleEmptyGraphAction = () => {
    this.loadGraphDataFromBackend();
  };

  private handleGraphDataSourceSuccess = (
    graphTimestamp: TimeInSeconds,
    _,
    elements: DecoratedGraphElements,
    fetchParams: FetchParams
  ) => {
    const prevElements = this.state.graphData.elements;
    this.setState({
      graphData: {
        elements: elements,
        elementsChanged: CytoscapeGraphUtils.elementsChanged(prevElements, elements),
        isLoading: false,
        fetchParams: fetchParams,
        timestamp: graphTimestamp * 1000
      }
    });
    this.props.setGraphDefinition(this.graphDataSource.graphDefinition);
  };

  private handleGraphDataSourceError = (errorMessage: string | null, fetchParams: FetchParams) => {
    const prevElements = this.state.graphData.elements;
    this.setState({
      graphData: {
        elements: EMPTY_GRAPH_DATA,
        elementsChanged: CytoscapeGraphUtils.elementsChanged(prevElements, EMPTY_GRAPH_DATA),
        errorMessage: !!errorMessage ? errorMessage : undefined,
        isError: true,
        isLoading: false,
        fetchParams: fetchParams,
        timestamp: Date.now()
      }
    });
  };

  private handleGraphDataSourceEmpty = (fetchParams: FetchParams) => {
    const prevElements = this.state.graphData.elements;
    this.setState({
      graphData: {
        elements: EMPTY_GRAPH_DATA,
        elementsChanged: CytoscapeGraphUtils.elementsChanged(prevElements, EMPTY_GRAPH_DATA),
        isLoading: false,
        fetchParams: fetchParams,
        timestamp: Date.now()
      }
    });
  };

  private handleGraphDataSourceStart = (isPreviousDataInvalid: boolean, fetchParams: FetchParams) => {
    this.setState({
      graphData: {
        elements: isPreviousDataInvalid ? EMPTY_GRAPH_DATA : this.state.graphData.elements,
        elementsChanged: false,
        fetchParams: fetchParams,
        isLoading: true,
        timestamp: isPreviousDataInvalid ? Date.now() : this.state.graphData.timestamp
      }
    });
  };

  private handleDoubleTap = (event: GraphNodeDoubleTapEvent) => {
    if (
      event.isInaccessible ||
      event.isServiceEntry ||
      (event.nodeType === NodeType.BOX && event.isBox !== BoxByType.APP)
    ) {
      return;
    }

    if (event.hasMissingSC) {
      AlertUtils.add(
        `A node with a missing sidecar provides no node-specific telemetry and can not provide a node detail graph.`,
        undefined,
        MessageType.WARNING
      );
      return;
    }
    if (event.isIdle) {
      AlertUtils.add(
        `An idle node has no node-specific traffic and can not provide a node detail graph.`,
        undefined,
        MessageType.WARNING
      );
      return;
    }
    if (event.isOutside && this.props.setActiveNamespaces) {
      this.props.setActiveNamespaces([{ name: event.namespace }]);
      return;
    }

    // If graph is in the drilled-down view, there is the chance that the user
    // double clicked the same node as in the full graph. Determine if this is
    // the case.
    let sameNode = false;
    const node = this.state.graphData.fetchParams.node;
    if (node) {
      sameNode = node && node.nodeType === event.nodeType;
      switch (event.nodeType) {
        case NodeType.AGGREGATE:
          sameNode = sameNode && node.aggregate === event.aggregate;
          sameNode = sameNode && node.aggregateValue === event.aggregateValue;
          break;
        case NodeType.APP:
          sameNode = sameNode && node.app === event.app;
          sameNode = sameNode && node.version === event.version;
          break;
        case NodeType.BOX:
          // we only support node graphs on app boxes, so assume app box
          sameNode = sameNode && node.app === event.app;
          break;
        case NodeType.SERVICE:
          sameNode = sameNode && node.service === event.service;
          break;
        case NodeType.WORKLOAD:
          sameNode = sameNode && node.workload === event.workload;
          break;
        default:
          sameNode = true; // don't navigate to unsupported node type
      }
    }

    const targetNode: NodeParamsType = { ...event, namespace: { name: event.namespace } };

    // If, while in the drilled-down graph, the user double clicked the same
    // node as in the main graph, it doesn't make sense to re-load the same view.
    // Instead, assume that the user wants more details for the node and do a
    // redirect to the details page.
    if (sameNode) {
      this.handleDoubleTapSameNode(targetNode);
      return;
    }

    // In case user didn't double-tap the same node, or if graph is in
    // full graph mode, redirect to the drilled-down graph of the chosen node.
    const urlParams: GraphUrlParams = {
      activeNamespaces: this.state.graphData.fetchParams.namespaces,
      duration: this.state.graphData.fetchParams.duration,
      edgeLabels: this.state.graphData.fetchParams.edgeLabels,
      edgeMode: this.props.edgeMode,
      graphLayout: this.props.layout,
      graphType: this.state.graphData.fetchParams.graphType,
      namespaceLayout: this.props.namespaceLayout,
      node: targetNode,
      refreshInterval: this.props.refreshInterval,
      showIdleEdges: this.props.showIdleEdges,
      showIdleNodes: this.props.showIdleNodes,
      showOperationNodes: this.props.showOperationNodes,
      showServiceNodes: this.props.showServiceNodes,
      trafficRates: this.state.graphData.fetchParams.trafficRates
    };

    // To ensure updated components get the updated URL, update the URL first and then the state
    history.push(makeNodeGraphUrlFromParams(urlParams));
  };

  // This allows us to navigate to the service details page when zoomed in on nodes
  private handleDoubleTapSameNode = (targetNode: NodeParamsType) => {
    const makeAppDetailsPageUrl = (namespace: string, nodeType: string, name?: string): string => {
      return `/namespaces/${namespace}/${nodeType}/${name}`;
    };
    const nodeType = targetNode.nodeType;
    let urlNodeType = targetNode.nodeType + 's';
    let name = targetNode.app;
    if (nodeType === 'service') {
      name = targetNode.service;
    } else if (nodeType === 'workload') {
      name = targetNode.workload;
    } else {
      urlNodeType = 'applications';
    }
    const detailsPageUrl = makeAppDetailsPageUrl(targetNode.namespace.name, urlNodeType, name);
    history.push(detailsPageUrl);
    return;
  };

  private toggleHelp = () => {
    if (this.props.showLegend) {
      this.props.toggleLegend();
    }
    if (this.props.activeTour) {
      this.props.endTour();
    } else {
      const firstStop = getNextTourStop(GraphTour, -1, 'forward');
      this.props.startTour({ info: GraphTour, stop: firstStop });
    }
  };

  private setCytoscapeGraph(cytoscapeGraph: any) {
    this.cytoscapeGraphRef.current = cytoscapeGraph;
  }

  private loadGraphDataFromBackend = () => {
    const queryTime: TimeInMilliseconds | undefined = !!this.props.replayQueryTime
      ? this.props.replayQueryTime
      : undefined;

    this.graphDataSource.fetchGraphData({
      boxByCluster: this.props.boxByCluster,
      boxByNamespace: this.props.boxByNamespace,
      duration: this.props.duration,
      edgeLabels: this.props.edgeLabels,
      graphType: this.props.graphType,
      includeHealth: true,
      includeLabels: this.props.findValue.includes('label:') || this.props.hideValue.includes('label:'),
      injectServiceNodes: this.props.showServiceNodes,
      namespaces: this.props.node ? [this.props.node.namespace] : this.props.activeNamespaces,
      node: this.props.node,
      queryTime: queryTime,
      showIdleEdges: this.props.showIdleEdges,
      showIdleNodes: this.props.showIdleNodes,
      showOperationNodes: this.props.showOperationNodes,
      showSecurity: this.props.showSecurity,
      trafficRates: this.props.trafficRates
    });
  };

  private notifyError = (error: Error, _componentStack: string) => {
    AlertUtils.add(`There was an error when rendering the graph: ${error.message}, please try a different layout`);
  };

  private displayTimeRange = () => {
    const rangeEnd: TimeInMilliseconds = this.state.graphData.timestamp;
    const rangeStart: TimeInMilliseconds = rangeEnd - this.props.duration * 1000;

    return toRangeString(rangeStart, rangeEnd, { second: '2-digit' }, { second: '2-digit' });
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  activeNamespaces: activeNamespacesSelector(state),
  activeTour: state.tourState.activeTour,
  boxByCluster: state.graph.toolbarState.boxByCluster,
  boxByNamespace: state.graph.toolbarState.boxByNamespace,
  compressOnHide: state.graph.toolbarState.compressOnHide,
  duration: durationSelector(state),
  edgeLabels: edgeLabelsSelector(state),
  edgeMode: edgeModeSelector(state),
  findValue: findValueSelector(state),
  graphType: graphTypeSelector(state),
  hideValue: hideValueSelector(state),
  isPageVisible: state.globalState.isPageVisible,
  lastRefreshAt: lastRefreshAtSelector(state),
  layout: state.graph.layout,
  mtlsEnabled: meshWideMTLSEnabledSelector(state),
  namespaceLayout: state.graph.namespaceLayout,
  node: state.graph.node,
  rankBy: state.graph.toolbarState.rankBy,
  refreshInterval: refreshIntervalSelector(state),
  replayActive: replayActiveSelector(state),
  replayQueryTime: replayQueryTimeSelector(state),
  showIdleEdges: state.graph.toolbarState.showIdleEdges,
  showIdleNodes: state.graph.toolbarState.showIdleNodes,
  showLegend: state.graph.toolbarState.showLegend,
  showMissingSidecars: state.graph.toolbarState.showMissingSidecars,
  showOperationNodes: state.graph.toolbarState.showOperationNodes,
  showRank: state.graph.toolbarState.showRank,
  showSecurity: state.graph.toolbarState.showSecurity,
  showServiceNodes: state.graph.toolbarState.showServiceNodes,
  showTrafficAnimation: state.graph.toolbarState.showTrafficAnimation,
  showVirtualServices: state.graph.toolbarState.showVirtualServices,
  summaryData: state.graph.summaryData,
  trace: state.jaegerState?.selectedTrace,
  trafficRates: trafficRatesSelector(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  endTour: bindActionCreators(TourActions.endTour, dispatch),
  onNamespaceChange: bindActionCreators(GraphActions.onNamespaceChange, dispatch),
  onReady: (cy: Cy.Core) => dispatch(GraphThunkActions.graphReady(cy)),
  setActiveNamespaces: (namespaces: Namespace[]) => dispatch(NamespaceActions.setActiveNamespaces(namespaces)),
  setGraphDefinition: bindActionCreators(GraphActions.setGraphDefinition, dispatch),
  setNode: bindActionCreators(GraphActions.setNode, dispatch),
  setRankResult: bindActionCreators(GraphActions.setRankResult, dispatch),
  setTraceId: (traceId?: string) => dispatch(JaegerThunkActions.setTraceId(traceId)),
  setUpdateTime: (val: TimeInMilliseconds) => dispatch(GraphActions.setUpdateTime(val)),
  startTour: bindActionCreators(TourActions.startTour, dispatch),
  toggleIdleNodes: bindActionCreators(GraphToolbarActions.toggleIdleNodes, dispatch),
  toggleLegend: bindActionCreators(GraphToolbarActions.toggleLegend, dispatch),
  updateSummary: (event: CytoscapeEvent) => dispatch(GraphActions.updateSummary(event))
});

const GraphPageContainer = connect(mapStateToProps, mapDispatchToProps)(GraphPage);
export default GraphPageContainer;
