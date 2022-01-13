import * as React from 'react';
import { RateTableGrpc, RateTableHttp } from '../../components/SummaryPanel/RateTable';
import { RequestChart, StreamChart } from '../../components/SummaryPanel/RpsChart';
import { ResponseTimeChart, ResponseTimeUnit } from '../../components/SummaryPanel/ResponseTimeChart';
import {
  GraphType,
  NodeType,
  Protocol,
  SummaryPanelPropType,
  DecoratedGraphNodeData,
  UNKNOWN,
  TrafficRate,
  prettyProtocol
} from '../../types/Graph';
import { renderBadgedLink } from './SummaryLink';
import {
  shouldRefreshData,
  getDatapoints,
  getNodeMetrics,
  getNodeMetricType,
  hr,
  renderNoTraffic,
  NodeMetricType,
  summaryHeader,
  summaryBodyTabs,
  summaryPanel,
  summaryFont,
  getTitle
} from './SummaryPanelCommon';
import { Metric, Datapoint, IstioMetricsMap, Labels } from '../../types/Metrics';
import { Response } from '../../services/Api';
import { CancelablePromise, makeCancelablePromise } from '../../utils/CancelablePromises';
import { decoratedEdgeData, decoratedNodeData } from '../../components/CytoscapeGraph/CytoscapeGraphUtils';
import { ResponseFlagsTable } from 'components/SummaryPanel/ResponseFlagsTable';
import { ResponseHostsTable } from 'components/SummaryPanel/ResponseHostsTable';
import { KialiIcon } from 'config/KialiIcon';
import { Tab, Tooltip } from '@patternfly/react-core';
import SimpleTabs from 'components/Tab/SimpleTabs';
import { Direction } from 'types/MetricsOptions';
import { style } from 'typestyle';

type SummaryPanelEdgeMetricsState = {
  rates: Datapoint[];
  errRates: Datapoint[];
  rtAvg: Datapoint[];
  rtMed: Datapoint[];
  rt95: Datapoint[];
  rt99: Datapoint[];
  sent: Datapoint[];
  received: Datapoint[];
  unit: ResponseTimeUnit;
};

type SummaryPanelEdgeState = SummaryPanelEdgeMetricsState & {
  edge: any;
  loading: boolean;
  metricsLoadError: string | null;
};

const defaultMetricsState: SummaryPanelEdgeMetricsState = {
  rates: [],
  errRates: [],
  rtAvg: [],
  rtMed: [],
  rt95: [],
  rt99: [],
  sent: [],
  received: [],
  unit: 'ms'
};

const defaultState: SummaryPanelEdgeState = {
  edge: null,
  loading: false,
  metricsLoadError: null,
  ...defaultMetricsState
};

const principalStyle = style({
  display: 'inline-block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%',
  whiteSpace: 'nowrap'
});

export default class SummaryPanelEdge extends React.Component<SummaryPanelPropType, SummaryPanelEdgeState> {
  private metricsPromise?: CancelablePromise<Response<IstioMetricsMap>>;
  private readonly mainDivRef: React.RefObject<HTMLDivElement>;

  constructor(props: SummaryPanelPropType) {
    super(props);

    this.state = { ...defaultState };
    this.mainDivRef = React.createRef<HTMLDivElement>();
  }

  static getDerivedStateFromProps(props: SummaryPanelPropType, state: SummaryPanelEdgeState) {
    // if the summaryTarget (i.e. selected edge) has changed, then init the state and set to loading. The loading
    // will actually be kicked off after the render (in componentDidMount/Update).
    return props.data.summaryTarget !== state.edge
      ? { edge: props.data.summaryTarget, loading: true, ...defaultMetricsState }
      : null;
  }

  componentDidMount() {
    this.updateCharts(this.props);
  }

  componentDidUpdate(prevProps: SummaryPanelPropType) {
    if (prevProps.data.summaryTarget !== this.props.data.summaryTarget) {
      if (this.mainDivRef.current) {
        this.mainDivRef.current.scrollTop = 0;
      }
    }
    if (shouldRefreshData(prevProps, this.props)) {
      this.updateCharts(this.props);
    }
  }

  componentWillUnmount() {
    if (this.metricsPromise) {
      this.metricsPromise.cancel();
    }
  }

  render() {
    const target = this.props.data.summaryTarget;
    const source = decoratedNodeData(target.source());
    const dest = decoratedNodeData(target.target());
    const edge = decoratedEdgeData(target);
    const mTLSPercentage = edge.isMTLS;
    const isMtls = mTLSPercentage && mTLSPercentage > 0;
    const hasPrincipals = !!edge.sourcePrincipal || !!edge.destPrincipal;
    const hasSecurity = isMtls || hasPrincipals;
    const protocol = edge.protocol;
    const isGrpc = protocol === Protocol.GRPC;
    const isHttp = protocol === Protocol.HTTP;
    const isTcp = protocol === Protocol.TCP;
    const isRequests = isHttp || (isGrpc && this.props.trafficRates.includes(TrafficRate.GRPC_REQUEST));

    const SecurityBlock = () => {
      return (
        <div className="panel-heading" style={summaryHeader}>
          {isMtls && this.renderMTLSSummary(mTLSPercentage)}
          {hasPrincipals && (
            <>
              <div style={{ padding: '5px 0 2px 0' }}>
                <strong>Principals:</strong>
              </div>
              <Tooltip key="tt_src_ppl" position="top" content={`Source principal: ${edge.sourcePrincipal}`}>
                <span className={principalStyle}>{edge.sourcePrincipal || 'unknown'}</span>
              </Tooltip>
              <Tooltip key="tt_src_ppl" position="top" content={`Destination principal: ${edge.destPrincipal}`}>
                <span className={principalStyle}>{edge.destPrincipal || 'unknown'}</span>
              </Tooltip>
            </>
          )}
        </div>
      );
    };

    return (
      <div ref={this.mainDivRef} className={`panel panel-default ${summaryPanel}`}>
        <div className="panel-heading" style={summaryHeader}>
          {getTitle(`Edge (${prettyProtocol(protocol)})`)}
          {renderBadgedLink(source, undefined, 'From:  ')}
          {renderBadgedLink(dest, undefined, 'To:        ')}
        </div>
        {hasSecurity && <SecurityBlock />}
        {(isHttp || isGrpc) && (
          <div className={summaryBodyTabs}>
            <SimpleTabs id="edge_summary_rate_tabs" defaultTab={0} style={{ paddingBottom: '10px' }}>
              <Tab style={summaryFont} title="Traffic" eventKey={0}>
                <div style={summaryFont}>
                  {isGrpc && (
                    <>
                      <RateTableGrpc
                        isRequests={isRequests}
                        rate={this.safeRate(edge.grpc)}
                        rateGrpcErr={this.safeRate(edge.grpcErr)}
                        rateNR={this.safeRate(edge.grpcNoResponse)}
                      />
                    </>
                  )}
                  {isHttp && (
                    <>
                      <RateTableHttp
                        title="HTTP requests per second:"
                        rate={this.safeRate(edge.http)}
                        rate3xx={this.safeRate(edge.http3xx)}
                        rate4xx={this.safeRate(edge.http4xx)}
                        rate5xx={this.safeRate(edge.http5xx)}
                        rateNR={this.safeRate(edge.httpNoResponse)}
                      />
                    </>
                  )}
                </div>
              </Tab>
              {isRequests && (
                <Tab style={summaryFont} title="Flags" eventKey={1}>
                  <div style={summaryFont}>
                    <ResponseFlagsTable
                      title={'Response flags by ' + (isGrpc ? 'GRPC code:' : 'HTTP code:')}
                      responses={edge.responses}
                    />
                  </div>
                </Tab>
              )}
              <Tab style={summaryFont} title="Hosts" eventKey={2}>
                <div style={summaryFont}>
                  <ResponseHostsTable
                    title={'Hosts by ' + (isGrpc ? 'GRPC code:' : 'HTTP code:')}
                    responses={edge.responses}
                  />
                </div>
              </Tab>
            </SimpleTabs>
            {hr()}
            {this.renderCharts(target, isGrpc, isHttp, isTcp, isRequests)}
          </div>
        )}
        {isTcp && (
          <div className={summaryBodyTabs}>
            <SimpleTabs id="edge_summary_flag_hosts_tabs" defaultTab={0} style={{ paddingBottom: '10px' }}>
              <Tab style={summaryFont} eventKey={0} title="Flags">
                <div style={summaryFont}>
                  <ResponseFlagsTable title="Response flags by code:" responses={edge.responses} />
                </div>
              </Tab>
              <Tab style={summaryFont} eventKey={1} title="Hosts">
                <div style={summaryFont}>
                  <ResponseHostsTable title="Hosts by code:" responses={edge.responses} />
                </div>
              </Tab>
            </SimpleTabs>
            {hr()}
            {this.renderCharts(target, isGrpc, isHttp, isTcp, isRequests)}
          </div>
        )}
        {!isGrpc && !isHttp && !isTcp && <div className="panel-body">{renderNoTraffic()}</div>}
      </div>
    );
  }

  private getByLabels = (sourceMetricType: NodeMetricType, destMetricType: NodeMetricType) => {
    let label: string;
    switch (sourceMetricType) {
      case NodeMetricType.AGGREGATE:
        switch (destMetricType) {
          case NodeMetricType.APP:
            label = 'destination_app';
            break;
          case NodeMetricType.SERVICE:
            label = 'destination_service_name';
            break;
          case NodeMetricType.WORKLOAD:
          // fall through, workload is default
          default:
            label = 'destination_workload';
            break;
        }
        break;
      case NodeMetricType.APP:
        label = 'source_app';
        break;
      case NodeMetricType.SERVICE:
        label = 'destination_service_name';
        break;
      case NodeMetricType.WORKLOAD:
      // fall through, workload is default
      default:
        label = 'source_workload';
        break;
    }
    // For special service dest nodes we want to narrow the data to only TS with 'unknown' workloads (see the related
    // comparator in getNodeDatapoints).
    return this.isSpecialServiceDest(destMetricType) ? [label, 'destination_workload'] : [label];
  };

  private getNodeDataPoints = (
    m: Metric[] | undefined,
    sourceMetricType: NodeMetricType,
    destMetricType: NodeMetricType,
    data: DecoratedGraphNodeData,
    isServiceEntry: boolean
  ) => {
    if (isServiceEntry) {
      // For service entries, metrics are grouped by destination_service_name and we need to match it per "data.destServices"
      return getDatapoints(m, (labels: Labels) => {
        return data.destServices
          ? data.destServices.some(svc => svc.name === labels['destination_service_name'])
          : false;
      });
    }
    let label: string;
    let value: string | undefined;
    switch (sourceMetricType) {
      case NodeMetricType.AGGREGATE:
        switch (destMetricType) {
          case NodeMetricType.APP:
            label = 'destination_app';
            value = data.app;
            break;
          case NodeMetricType.SERVICE:
            label = 'destination_service_name';
            value = data.service;
            break;
          case NodeMetricType.WORKLOAD:
          // fall through, workload is default
          default:
            label = 'destination_workload';
            value = data.workload;
            break;
        }
        break;
      case NodeMetricType.APP:
        label = 'source_app';
        value = data.app;
        break;
      case NodeMetricType.SERVICE:
        label = 'destination_service_name';
        value = data.service;
        break;
      case NodeMetricType.WORKLOAD:
      // fall through, use workload as the default
      default:
        label = 'source_workload';
        value = data.workload;
    }
    const comparator = this.isSpecialServiceDest(destMetricType)
      ? (labels: Labels) => labels[label] === value && labels.destination_workload === UNKNOWN
      : (labels: Labels) => labels[label] === value;
    return getDatapoints(m, comparator);
  };

  private updateCharts = (props: SummaryPanelPropType) => {
    const edge = props.data.summaryTarget;
    const edgeData = decoratedEdgeData(edge);
    const sourceData = decoratedNodeData(edge.source());
    const destData = decoratedNodeData(edge.target());
    const sourceMetricType = getNodeMetricType(sourceData);
    const destMetricType = getNodeMetricType(destData);
    const protocol = edgeData.protocol;
    const isGrpc = protocol === Protocol.GRPC;
    const isHttp = protocol === Protocol.HTTP;
    const isTcp = protocol === Protocol.TCP;
    const isRequests = isHttp || (isGrpc && this.props.trafficRates.includes(TrafficRate.GRPC_REQUEST));

    if (this.metricsPromise) {
      this.metricsPromise.cancel();
      this.metricsPromise = undefined;
    }

    // Just return if the metric types are unset, there is no data, destination node is "unknown" or charts are unsupported
    if (
      !destMetricType ||
      !sourceMetricType ||
      !this.hasSupportedCharts(edge) ||
      (!isGrpc && !isHttp && !isTcp) ||
      destData.isInaccessible
    ) {
      this.setState({
        loading: false
      });
      return;
    }

    // use dest node metrics unless dest is a serviceEntry or source is an aggregate
    const isSourceAggregate = sourceData.nodeType === NodeType.AGGREGATE;
    const isDestServiceEntry = !!destData.isServiceEntry;
    const useDestMetrics = isDestServiceEntry || isSourceAggregate ? false : true;
    const metricsNode = useDestMetrics ? edge.target() : edge.source();
    const metricsNodeData = useDestMetrics ? destData : sourceData;
    const direction: Direction = useDestMetrics || isSourceAggregate ? 'inbound' : 'outbound';
    const metricType = useDestMetrics ? destMetricType : sourceMetricType;
    const byLabels = isDestServiceEntry
      ? ['destination_service_name']
      : this.getByLabels(sourceMetricType, destMetricType);
    const otherEndData = useDestMetrics ? sourceData : destData;
    const quantiles = ['0.5', '0.95', '0.99'];

    let promiseRequests, promiseStream;
    if (isHttp || (isGrpc && isRequests)) {
      const reporterRps =
        [NodeType.SERVICE, NodeType.UNKNOWN].includes(sourceData.nodeType) ||
        NodeType.AGGREGATE === metricsNodeData.nodeType ||
        edge.source().isIstio ||
        edge.target().isIstio
          ? 'destination'
          : 'source';
      const filtersRps = ['request_count', 'request_duration_millis', 'request_error_count'];
      promiseRequests = getNodeMetrics(
        metricType,
        metricsNode,
        props,
        filtersRps,
        direction,
        reporterRps,
        protocol,
        quantiles,
        byLabels
      );
    } else if (isGrpc) {
      // gRPC messages uses slightly different reporting
      const reporter =
        [NodeType.AGGREGATE, NodeType.UNKNOWN].includes(sourceData.nodeType) || sourceData.isIstio
          ? 'destination'
          : 'source';
      const filters = ['grpc_sent', 'grpc_received'];
      promiseStream = getNodeMetrics(
        metricType,
        metricsNode,
        props,
        filters,
        direction,
        reporter,
        undefined, // streams (tcp, grpc-messages) use dedicated metrics (i.e. no request_protocol label)
        quantiles,
        byLabels
      );
    } else {
      // TCP uses slightly different reporting
      const reporterTCP =
        [NodeType.AGGREGATE, NodeType.UNKNOWN].includes(sourceData.nodeType) || sourceData.isIstio
          ? 'destination'
          : 'source';
      const filtersTCP = ['tcp_sent', 'tcp_received'];
      promiseStream = getNodeMetrics(
        metricType,
        metricsNode,
        props,
        filtersTCP,
        direction,
        reporterTCP,
        undefined, // streams (tcp, grpc-messages) use dedicated metrics (i.e. no request_protocol label)
        quantiles,
        byLabels
      );
    }
    this.metricsPromise = makeCancelablePromise(promiseRequests ? promiseRequests : promiseStream);
    this.metricsPromise.promise
      .then(response => {
        const metrics = response.data;
        let { rates: reqRates, errRates, rtAvg, rtMed, rt95, rt99, sent, received, unit } = defaultMetricsState;
        if (isHttp || (isGrpc && isRequests)) {
          reqRates = this.getNodeDataPoints(
            metrics.request_count,
            sourceMetricType,
            destMetricType,
            otherEndData,
            isDestServiceEntry
          );
          errRates = this.getNodeDataPoints(
            metrics.request_error_count,
            sourceMetricType,
            destMetricType,
            otherEndData,
            isDestServiceEntry
          );
          const duration = metrics.request_duration_millis || [];
          rtAvg = this.getNodeDataPoints(
            duration.filter(m => m.stat === 'avg'),
            sourceMetricType,
            destMetricType,
            otherEndData,
            isDestServiceEntry
          );
          rtMed = this.getNodeDataPoints(
            duration.filter(m => m.stat === '0.5'),
            sourceMetricType,
            destMetricType,
            otherEndData,
            isDestServiceEntry
          );
          rt95 = this.getNodeDataPoints(
            duration.filter(m => m.stat === '0.95'),
            sourceMetricType,
            destMetricType,
            otherEndData,
            isDestServiceEntry
          );
          rt99 = this.getNodeDataPoints(
            duration.filter(m => m.stat === '0.99'),
            sourceMetricType,
            destMetricType,
            otherEndData,
            isDestServiceEntry
          );
        } else {
          // TCP or gRPC stream
          sent = this.getNodeDataPoints(
            isTcp ? metrics.tcp_sent : metrics.grpc_sent,
            sourceMetricType,
            destMetricType,
            otherEndData,
            isDestServiceEntry
          );
          received = this.getNodeDataPoints(
            isTcp ? metrics.tcp_received : metrics.grpc_received,
            sourceMetricType,
            destMetricType,
            otherEndData,
            isDestServiceEntry
          );
        }

        this.setState({
          loading: false,
          rates: reqRates,
          errRates: errRates,
          rtAvg: rtAvg,
          rtMed: rtMed,
          rt95: rt95,
          rt99: rt99,
          sent: sent,
          received: received,
          unit: unit
        });
      })
      .catch(error => {
        if (error.isCanceled) {
          console.debug('SummaryPanelEdge: Ignore fetch error (canceled).');
          return;
        }
        const errorMsg = error.response && error.response.data.error ? error.response.data.error : error.message;
        this.setState({
          loading: false,
          metricsLoadError: errorMsg,
          ...defaultMetricsState
        });
      });

    this.setState({ loading: true, metricsLoadError: null });
  };

  private safeRate = (s: any) => {
    return isNaN(s) ? 0.0 : Number(s);
  };

  private renderCharts = (edge, isGrpc, isHttp, isTcp, isRequests) => {
    if (!this.hasSupportedCharts(edge)) {
      return isGrpc || isHttp ? (
        <>
          <KialiIcon.Info /> Service graphs do not support service-to-service aggregate sparklines. See the chart above
          for aggregate traffic or use the workload graph type to observe individual workload-to-service edge
          sparklines.
        </>
      ) : (
        <>
          <KialiIcon.Info /> Service graphs do not support service-to-service aggregate sparklines. Use the workload
          graph type to observe individual workload-to-service edge sparklines.
        </>
      );
    }

    const target = decoratedNodeData(edge.target());
    if (target.isInaccessible) {
      return (
        <>
          <KialiIcon.Info /> Sparkline charts cannot be shown because the destination is inaccessible.
        </>
      );
    }

    if (this.state.loading) {
      return <strong>Loading charts...</strong>;
    }

    if (this.state.metricsLoadError) {
      return (
        <div>
          <KialiIcon.Warning /> <strong>Error loading metrics: </strong>
          {this.state.metricsLoadError}
        </div>
      );
    }

    let requestChart, streamChart;
    if (isGrpc || isHttp) {
      if (isRequests) {
        const labelRps = isGrpc ? 'gRPC Request Traffic' : 'HTTP Request Traffic';
        const labelRt = isGrpc ? 'gRPC Request Response Time (ms)' : 'HTTP Request Response Time (ms)';
        requestChart = (
          <>
            <RequestChart label={labelRps} dataRps={this.state.rates!} dataErrors={this.state.errRates} />
            {hr()}
            <ResponseTimeChart
              label={labelRt}
              rtAvg={this.state.rtAvg}
              rtMed={this.state.rtMed}
              rt95={this.state.rt95}
              rt99={this.state.rt99}
              unit={this.state.unit}
            />
          </>
        );
      } else {
        // assume gRPC messages, it's the only option other than requests
        requestChart = (
          <>
            <StreamChart
              label="gRPC Message Traffic"
              sentRates={this.state.sent!}
              receivedRates={this.state.received}
              unit="messages"
            />
          </>
        );
      }
    } else if (isTcp) {
      streamChart = (
        <StreamChart label="TCP Traffic" sentRates={this.state.sent} receivedRates={this.state.received} unit="bytes" />
      );
    }

    return (
      <>
        {requestChart}
        {streamChart}
      </>
    );
  };

  private hasSupportedCharts = edge => {
    const sourceData = decoratedNodeData(edge.source());
    const destData = decoratedNodeData(edge.target());
    const sourceMetricType = getNodeMetricType(sourceData);
    const destMetricType = getNodeMetricType(destData);

    // service-to-service edges are unsupported because they represent aggregations (of multiple workload to service edges)
    const chartsSupported = sourceMetricType !== NodeMetricType.SERVICE || destMetricType !== NodeMetricType.SERVICE;
    return chartsSupported;
  };

  // We need to handle the special case of a dest service node showing client failures. These service nodes show up in
  // non-service graphs, even when not injecting service nodes.
  private isSpecialServiceDest(destMetricType: NodeMetricType) {
    return (
      destMetricType === NodeMetricType.SERVICE &&
      !this.props.injectServiceNodes &&
      this.props.graphType !== GraphType.SERVICE
    );
  }

  private renderMTLSSummary = (mTLSPercentage: number) => {
    let mtls = 'mTLS Enabled';
    const isMtls = mTLSPercentage > 0;
    if (isMtls && mTLSPercentage < 100.0) {
      mtls = `${mtls} [${mTLSPercentage}% of request traffic]`;
    }
    return (
      <>
        {isMtls && (
          <div>
            <KialiIcon.MtlsLock />
            <span style={{ paddingLeft: '6px' }}>{mtls}</span>
          </div>
        )}
      </>
    );
  };
}
