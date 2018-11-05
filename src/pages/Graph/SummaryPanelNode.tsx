import * as React from 'react';
import { renderDestServicesLinks, renderLink, renderTitle } from './SummaryLink';
import { Icon } from 'patternfly-react';

import { getTrafficRate, getAccumulatedTrafficRate } from '../../utils/TrafficRate';
import InOutRateTable from '../../components/SummaryPanel/InOutRateTable';
import { RpsChart, TcpChart } from '../../components/SummaryPanel/RpsChart';
import { GraphType, NodeType, SummaryPanelPropType } from '../../types/Graph';
import { Metrics, Metric } from '../../types/Metrics';
import {
  shouldRefreshData,
  updateHealth,
  nodeData,
  NodeData,
  NodeMetricType,
  getDatapoints,
  getNodeMetrics,
  getNodeMetricType,
  renderNoTraffic
} from './SummaryPanelCommon';
import { HealthIndicator, DisplayMode } from '../../components/Health/HealthIndicator';
import Label from '../../components/Label/Label';
import { Health } from '../../types/Health';
import { CancelablePromise, makeCancelablePromise } from '../../utils/CancelablePromises';
import { Response } from '../../services/Api';
import { serverConfig } from '../../config';

type SummaryPanelStateType = {
  loading: boolean;
  requestCountIn: [string, number][] | null;
  requestCountOut: [string, number][];
  errorCountIn: [string, number][];
  errorCountOut: [string, number][];
  tcpSentIn: [string, number][];
  tcpSentOut: [string, number][];
  tcpReceivedIn: [string, number][];
  tcpReceivedOut: [string, number][];
  healthLoading: boolean;
  health?: Health;
  metricsLoadError: string | null;
};

export default class SummaryPanelNode extends React.Component<SummaryPanelPropType, SummaryPanelStateType> {
  static readonly panelStyle = {
    width: '25em',
    minWidth: '25em',
    overflowY: 'auto' as 'auto'
  };

  private metricsPromise?: CancelablePromise<Response<Metrics>>;

  constructor(props: SummaryPanelPropType) {
    super(props);
    this.showRequestCountMetrics = this.showRequestCountMetrics.bind(this);

    this.state = {
      loading: true,
      requestCountIn: null,
      requestCountOut: [],
      errorCountIn: [],
      errorCountOut: [],
      tcpSentIn: [],
      tcpSentOut: [],
      tcpReceivedIn: [],
      tcpReceivedOut: [],
      healthLoading: false,
      metricsLoadError: null
    };
  }

  componentDidMount() {
    this.fetchRequestCountMetrics(this.props);
    updateHealth(this.props.data.summaryTarget, this.setState.bind(this));
  }

  componentDidUpdate(prevProps: SummaryPanelPropType) {
    if (prevProps.data.summaryTarget !== this.props.data.summaryTarget) {
      this.setState({
        requestCountIn: null,
        loading: true
      });
    }
    if (shouldRefreshData(prevProps, this.props)) {
      this.fetchRequestCountMetrics(this.props);
      updateHealth(this.props.data.summaryTarget, this.setState.bind(this));
    }
  }

  componentWillUnmount() {
    if (this.metricsPromise) {
      this.metricsPromise.cancel();
    }
  }

  fetchRequestCountMetrics(props: SummaryPanelPropType) {
    const target = props.data.summaryTarget;
    const data = nodeData(target);
    const nodeMetricType = getNodeMetricType(data);

    if (this.metricsPromise) {
      this.metricsPromise.cancel();
      this.metricsPromise = undefined;
    }

    if (!nodeMetricType || (!this.hasHttpTraffic(target) && !this.hasTcpTraffic(target))) {
      this.setState({ loading: false });
      return;
    }

    const filters = ['request_count', 'request_error_count', 'tcp_sent', 'tcp_received'];
    // For special service dest nodes we want to narrow the data to only TS with 'unknown' workloads (see the related
    // comparator in getNodeDatapoints).
    let byLabelsIn = this.isSpecialServiceDest(nodeMetricType) ? ['destination_workload'] : undefined;
    let byLabelsOut = data.isRoot ? ['destination_service_namespace'] : undefined;

    const promise = getNodeMetrics(nodeMetricType, target, props, filters, undefined, byLabelsIn, byLabelsOut);
    this.metricsPromise = makeCancelablePromise(promise);
    this.metricsPromise.promise
      .then(response => {
        this.showRequestCountMetrics(response.data, data, nodeMetricType);
      })
      .catch(error => {
        if (error.isCanceled) {
          console.debug('SummaryPanelNode: Ignore fetch error (canceled).');
          return;
        }
        const errorMsg = error.response && error.response.data.error ? error.response.data.error : error.message;
        this.setState({
          loading: false,
          metricsLoadError: errorMsg,
          requestCountIn: null
        });
      });

    this.setState({ loading: true, metricsLoadError: null });
  }

  showRequestCountMetrics(all: Metrics, data: NodeData, nodeMetricType: NodeMetricType) {
    let comparator;
    if (this.isSpecialServiceDest(nodeMetricType)) {
      comparator = (metric: Metric) => {
        return metric['destination_workload'] === 'unknown';
      };
    } else if (data.isRoot) {
      comparator = (metric: Metric) => {
        return metric['destination_service_namespace'] === this.props.namespace;
      };
    }
    let metrics;
    let rcOut;
    let ecOut;
    let tcpSentOut;
    let tcpReceivedOut;
    let rcIn;
    let ecIn;
    let tcpSentIn;
    let tcpReceivedIn;
    // set outgoing unless it is a non-root outsider (because they have no outgoing edges) or a
    // service node (because they don't have "real" outgoing edges).
    if (data.nodeType !== NodeType.SERVICE && (data.isRoot || !data.isOutsider)) {
      // use source metrics for outgoing, except for:
      // - unknown nodes (no source telemetry)
      // - istio namespace nodes (no source telemetry)
      let useDest = data.nodeType === NodeType.UNKNOWN;
      useDest = useDest || this.props.namespace === serverConfig().istioNamespace;
      metrics = useDest ? all.dest.metrics : all.source.metrics;
      rcOut = metrics['request_count_out'];
      ecOut = metrics['request_error_count_out'];

      // These will be empty if destination metrics are being used. That's fine
      // it's not possible to report TCP metrics, because there is no TCP telemetry (either
      // in source nor destination) in the cases where dest. metrics are used.
      tcpSentOut = metrics['tcp_sent_out'];
      tcpReceivedOut = metrics['tcp_received_out'];
    }
    // set incoming unless it is a root (because they have no incoming edges)
    if (!data.isRoot) {
      // use dest metrics for incoming, except for service nodes which need source metrics to capture source errors
      const useSource = data.nodeType === NodeType.SERVICE && data.namespace !== serverConfig().istioNamespace;
      metrics = useSource ? all.source.metrics : all.dest.metrics;
      rcIn = metrics['request_count_in'];
      ecIn = metrics['request_error_count_in'];

      // For TCP, always use source side metrics. There is not enough data in
      // destination reporter to correctly resolve the source of the traffic.
      tcpSentIn = all.source.metrics['tcp_sent_in'];
      tcpReceivedIn = all.source.metrics['tcp_received_in'];
    }
    this.setState({
      loading: false,
      requestCountOut: getDatapoints(rcOut, 'RPS', comparator),
      errorCountOut: getDatapoints(ecOut, 'Error', comparator),
      requestCountIn: getDatapoints(rcIn, 'RPS', comparator),
      errorCountIn: getDatapoints(ecIn, 'Error', comparator),
      tcpSentOut: getDatapoints(tcpSentOut, 'Sent', comparator),
      tcpReceivedOut: getDatapoints(tcpReceivedOut, 'Received', comparator),
      tcpSentIn: getDatapoints(tcpSentIn, 'Sent', comparator),
      tcpReceivedIn: getDatapoints(tcpReceivedIn, 'Received', comparator)
    });
  }

  render() {
    const node = this.props.data.summaryTarget;
    const data: NodeData = nodeData(node);
    const { namespace, nodeType, workload } = data;
    const servicesList = nodeType !== NodeType.SERVICE && renderDestServicesLinks(node);

    const shouldRenderSvcList = servicesList && servicesList.length > 0;
    const shouldRenderWorkload = nodeType !== NodeType.WORKLOAD && nodeType !== NodeType.UNKNOWN && workload;

    return (
      <div className="panel panel-default" style={SummaryPanelNode.panelStyle}>
        <div className="panel-heading">
          {this.state.healthLoading ? (
            // Remove glitch while health is being reloaded
            <span style={{ width: 18, height: 17, display: 'inline-block' }} />
          ) : (
            this.state.health && (
              <HealthIndicator
                id="graph-health-indicator"
                mode={DisplayMode.SMALL}
                health={this.state.health}
                tooltipPlacement="left"
              />
            )
          )}
          <span> {renderTitle(data)}</span>
          <div className="label-collection" style={{ paddingTop: '3px' }}>
            <Label name="namespace" value={namespace} />
            {node.data('version') && <Label name="version" value={node.data('version')} />}
          </div>
          {this.renderBadgeSummary(node.data('hasCB'), node.data('hasVS'), node.data('hasMissingSC'))}
        </div>
        <div className="panel-body">
          {shouldRenderSvcList && (
            <div>
              <strong>Services: </strong>
              {servicesList}
            </div>
          )}
          {shouldRenderWorkload && (
            <div>
              <strong>Workload: </strong>
              {renderLink(data, NodeType.WORKLOAD)}
            </div>
          )}
          {(shouldRenderSvcList || shouldRenderWorkload) && <hr />}
          {/* TODO: link to App or Workload Details charts when available
          {nodeType !== NodeType.UNKNOWN && (
            <p style={{ textAlign: 'right' }}>
              <Link to={`/namespaces/${namespace}/services/${app}?tab=metrics&groupings=local+version%2Cresponse+code`}>
                View detailed charts <Icon name="angle-double-right" />
              </Link>
            </p>
          )} */}
          {this.hasHttpTraffic(node) ? this.renderHttpRates(node) : renderNoTraffic('HTTP')}
          <div>{this.renderSparklines(node)}</div>
        </div>
      </div>
    );
  }

  private renderHttpRates = node => {
    const incoming = getTrafficRate(node);
    const outgoing = getAccumulatedTrafficRate(this.props.data.summaryTarget.edgesTo('*'));

    return (
      <>
        <InOutRateTable
          title="HTTP Traffic (requests per second):"
          inRate={incoming.rate}
          inRate3xx={incoming.rate3xx}
          inRate4xx={incoming.rate4xx}
          inRate5xx={incoming.rate5xx}
          outRate={outgoing.rate}
          outRate3xx={outgoing.rate3xx}
          outRate4xx={outgoing.rate4xx}
          outRate5xx={outgoing.rate5xx}
        />
        <hr />
      </>
    );
  };

  private renderSparklines = node => {
    if (this.state.loading && !this.state.requestCountIn) {
      return <strong>Loading charts...</strong>;
    } else if (this.state.metricsLoadError) {
      return (
        <div>
          <Icon type="pf" name="warning-triangle-o" /> <strong>Error loading metrics: </strong>
          {this.state.metricsLoadError}
        </div>
      );
    }

    const isServiceNode = node.data('nodeType') === NodeType.SERVICE;
    let serviceWithUnknownSource: boolean = false;
    if (isServiceNode) {
      for (const n of node.incomers()) {
        if (NodeType.UNKNOWN === n.data('nodeType')) {
          serviceWithUnknownSource = true;
          break;
        }
      }
    }
    let httpCharts, tcpCharts;

    if (this.hasHttpTraffic(node)) {
      httpCharts = (
        <>
          <RpsChart
            label={isServiceNode ? 'HTTP - Request Traffic' : 'HTTP - Inbound Request Traffic'}
            dataRps={this.state.requestCountIn!}
            dataErrors={this.state.errorCountIn}
          />
          {serviceWithUnknownSource && (
            <>
              <div>
                <Icon type="pf" name="info" /> Traffic from unknown not included. Use edge for details.
              </div>
            </>
          )}
          <RpsChart
            label="HTTP - Outbound Request Traffic"
            dataRps={this.state.requestCountOut}
            dataErrors={this.state.errorCountOut}
            hide={isServiceNode}
          />
          <hr />
        </>
      );
    }

    if (this.hasTcpTraffic(node)) {
      tcpCharts = (
        <>
          <TcpChart
            label={isServiceNode ? 'TCP - Traffic' : 'TCP - Inbound Traffic'}
            receivedRates={this.state.tcpReceivedIn}
            sentRates={this.state.tcpSentIn}
          />
          <TcpChart
            label="TCP - Outbound Traffic"
            receivedRates={this.state.tcpReceivedOut}
            sentRates={this.state.tcpSentOut}
            hide={isServiceNode}
          />
          <hr />
        </>
      );
    }

    return (
      <>
        {httpCharts}
        {tcpCharts}
      </>
    );
  };

  private renderBadgeSummary = (hasCB: boolean, hasVS: boolean, hasMissingSC: boolean) => {
    return (
      <>
        {hasCB && (
          <div>
            <Icon name="bolt" type="fa" style={{ width: '10px' }} />
            Has Circuit Breaker
          </div>
        )}
        {hasVS && (
          <div>
            <Icon name="code-fork" type="fa" style={{ width: '10px' }} />
            Has Virtual Service
          </div>
        )}
        {hasMissingSC && (
          <div>
            <Icon name="exclamation" type="fa" style={{ width: '10px' }} />
            Has Missing Sidecar
          </div>
        )}
      </>
    );
  };

  // We need to handle the special case of a dest service node showing client failures. These service nodes show up in
  // non-service graphs, even when not injecting service nodes.
  private isSpecialServiceDest(nodeMetricType: NodeMetricType) {
    return (
      nodeMetricType === NodeMetricType.SERVICE &&
      !this.props.injectServiceNodes &&
      this.props.graphType !== GraphType.SERVICE
    );
  }

  private hasHttpTraffic = (node): boolean => {
    if (node.data('rate') || node.data('rateOut')) {
      return true;
    }
    return false;
  };

  private hasTcpTraffic = (node): boolean => {
    if (node.data('rateTcpSent') || node.data('rateTcpSentOut')) {
      return true;
    }
    return false;
  };
}
