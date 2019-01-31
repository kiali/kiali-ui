import * as React from 'react';
import { Icon } from 'patternfly-react';
import { RateTableGrpc, RateTableHttp } from '../../components/SummaryPanel/RateTable';
import { RpsChart, TcpChart } from '../../components/SummaryPanel/RpsChart';
import ResponseTimeChart from '../../components/SummaryPanel/ResponseTimeChart';
import { GraphType, NodeType, Protocol, SummaryPanelPropType } from '../../types/Graph';
import { renderTitle } from './SummaryLink';
import {
  shouldRefreshData,
  nodeData,
  getDatapoints,
  getNodeMetrics,
  getNodeMetricType,
  renderNoTraffic,
  NodeData,
  NodeMetricType,
  renderLabels
} from './SummaryPanelCommon';
import { MetricGroup, Metric, Metrics } from '../../types/Metrics';
import { Response } from '../../services/Api';
import { CancelablePromise, makeCancelablePromise } from '../../utils/CancelablePromises';
import { serverConfig } from '../../config';
import { CyEdge } from '../../components/CytoscapeGraph/CytoscapeGraphUtils';

type SummaryPanelEdgeState = {
  loading: boolean;
  reqRates: [string | number][] | null;
  errRates: [string | number][];
  rtAvg: [string | number][];
  rtMed: [string | number][];
  rt95: [string | number][];
  rt99: [string | number][];
  tcpSent: [string | number][];
  tcpReceived: [string | number][];
  metricsLoadError: string | null;
};

export default class SummaryPanelEdge extends React.Component<SummaryPanelPropType, SummaryPanelEdgeState> {
  static readonly panelStyle = {
    width: '25em',
    minWidth: '25em',
    overflowY: 'auto' as 'auto'
  };

  private metricsPromise?: CancelablePromise<Response<Metrics>>;

  constructor(props: SummaryPanelPropType) {
    super(props);

    this.state = {
      loading: true,
      reqRates: null,
      errRates: [],
      rtAvg: [],
      rtMed: [],
      rt95: [],
      rt99: [],
      tcpSent: [],
      tcpReceived: [],
      metricsLoadError: null
    };
  }

  componentDidMount() {
    this.updateCharts(this.props);
  }

  componentDidUpdate(prevProps: SummaryPanelPropType) {
    if (prevProps.data.summaryTarget !== this.props.data.summaryTarget) {
      this.setState({
        loading: true,
        reqRates: null
      });
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
    const edge = this.props.data.summaryTarget;
    const source = edge.source();
    const dest = edge.target();
    const protocol = edge.data(CyEdge.protocol);
    const isGrpc = protocol === Protocol.GRPC;
    const isHttp = protocol === Protocol.HTTP;
    const isTcp = protocol === Protocol.TCP;

    const HeadingBlock = ({ prefix, node }) => {
      const data = nodeData(node);
      return (
        <div className="panel-heading label-collection">
          <strong>{prefix}</strong> {renderTitle(data)}
          <br />
          {renderLabels(data)}
        </div>
      );
    };

    return (
      <div className="panel panel-default" style={SummaryPanelEdge.panelStyle}>
        <HeadingBlock prefix="From" node={source} />
        <HeadingBlock prefix="To" node={dest} />
        <div className="panel-body">
          {isGrpc && (
            <>
              <RateTableGrpc
                title="GRPC Traffic (requests per second):"
                rate={this.safeRate(edge.data(CyEdge.grpc))}
                rateErr={this.safeRate(edge.data(CyEdge.grpcPercentErr))}
              />
              <hr />
            </>
          )}
          {isHttp && (
            <>
              <RateTableHttp
                title="HTTP Traffic (requests per second):"
                rate={this.safeRate(edge.data(CyEdge.http))}
                rate3xx={this.safeRate(edge.data(CyEdge.http3xx))}
                rate4xx={this.safeRate(edge.data(CyEdge.http4xx))}
                rate5xx={this.safeRate(edge.data(CyEdge.http5xx))}
              />
              <hr />
            </>
          )}
          {!isGrpc && !isHttp && !isTcp && renderNoTraffic()}
          {this.renderCharts(edge, isGrpc, isHttp, isTcp)}
        </div>
      </div>
    );
  }

  private getByLabels = (sourceMetricType: NodeMetricType, destMetricType: NodeMetricType) => {
    let sourceLabel: string;
    switch (sourceMetricType) {
      case NodeMetricType.APP:
        sourceLabel = 'source_app';
        break;
      case NodeMetricType.SERVICE:
        sourceLabel = 'destination_service_name';
        break;
      case NodeMetricType.WORKLOAD:
      // fall through, workload is default
      default:
        sourceLabel = 'source_workload';
        break;
    }
    // For special service dest nodes we want to narrow the data to only TS with 'unknown' workloads (see the related
    // comparator in getNodeDatapoints).
    return this.isSpecialServiceDest(destMetricType) ? [sourceLabel, 'destination_workload'] : [sourceLabel];
  };

  private getNodeDataPoints = (
    m: MetricGroup,
    title: string,
    sourceMetricType: NodeMetricType,
    destMetricType: NodeMetricType,
    data: NodeData
  ) => {
    let sourceLabel: string;
    let sourceValue: string;
    switch (sourceMetricType) {
      case NodeMetricType.APP:
        sourceLabel = 'source_app';
        sourceValue = data.app;
        break;
      case NodeMetricType.SERVICE:
        sourceLabel = 'destination_service_name';
        sourceValue = data.service;
        break;
      case NodeMetricType.WORKLOAD:
      // fall through, use workload as the default
      default:
        sourceLabel = 'source_workload';
        sourceValue = data.workload;
    }
    const comparator = (metric: Metric) => {
      if (this.isSpecialServiceDest(destMetricType)) {
        return metric[sourceLabel] === sourceValue && metric['destination_workload'] === 'unknown';
      }
      return metric[sourceLabel] === sourceValue;
    };
    return getDatapoints(m, title, comparator);
  };

  private updateCharts = (props: SummaryPanelPropType) => {
    const edge = props.data.summaryTarget;
    const sourceData = nodeData(edge.source());
    const destData = nodeData(edge.target());
    const sourceMetricType = getNodeMetricType(sourceData);
    const destMetricType = getNodeMetricType(destData);
    const protocol = edge.data(CyEdge.protocol);
    const isGrpc = protocol === Protocol.GRPC;
    const isHttp = protocol === Protocol.HTTP;
    const isTcp = protocol === Protocol.TCP;

    if (this.metricsPromise) {
      this.metricsPromise.cancel();
      this.metricsPromise = undefined;
    }

    // Just return if the metric types are unset, there is no data, or charts are unsupported
    if (!destMetricType || !sourceMetricType || !this.hasSupportedCharts(edge) || (!isGrpc && !isHttp && !isTcp)) {
      this.setState({
        loading: false
      });
      return;
    }

    const quantiles = ['0.5', '0.95', '0.99'];
    const byLabels = this.getByLabels(sourceMetricType, destMetricType);

    let promiseRps, promiseTcp;
    if (isGrpc || isHttp) {
      const reporterRps =
        sourceData.nodeType === NodeType.UNKNOWN ||
        sourceData.nodeType === NodeType.SERVICE ||
        sourceData.namespace === serverConfig().istioNamespace ||
        destData.namespace === serverConfig().istioNamespace
          ? 'destination'
          : 'source';
      const filtersRps = ['request_count', 'request_duration', 'request_error_count'];
      promiseRps = getNodeMetrics(
        destMetricType,
        edge.target(),
        props,
        filtersRps,
        'inbound',
        reporterRps,
        protocol,
        quantiles,
        byLabels
      );
    } else {
      // TCP uses slightly different reporting
      const reporterTCP =
        sourceData.nodeType === NodeType.UNKNOWN || sourceData.namespace === serverConfig().istioNamespace
          ? 'destination'
          : 'source';
      const filtersTCP = ['tcp_sent', 'tcp_received'];
      promiseTcp = getNodeMetrics(
        destMetricType,
        edge.target(),
        props,
        filtersTCP,
        'inbound',
        reporterTCP,
        'tcp',
        quantiles,
        byLabels
      );
    }
    this.metricsPromise = makeCancelablePromise(promiseRps ? promiseRps : promiseTcp);
    this.metricsPromise.promise
      .then(response => {
        const metrics = response.data.metrics;
        const histograms = response.data.histograms;
        let reqRates, errRates, rtAvg, rtMed, rt95, rt99, tcpSentRates, tcpReceivedRates;
        if (isGrpc || isHttp) {
          reqRates = this.getNodeDataPoints(
            metrics['request_count'],
            'RPS',
            sourceMetricType,
            destMetricType,
            sourceData
          );
          errRates = this.getNodeDataPoints(
            metrics['request_error_count'],
            'Error',
            sourceMetricType,
            destMetricType,
            sourceData
          );
          rtAvg = this.getNodeDataPoints(
            histograms['request_duration']['avg'],
            'Average',
            sourceMetricType,
            destMetricType,
            sourceData
          );
          rtMed = this.getNodeDataPoints(
            histograms['request_duration']['0.5'],
            'Median',
            sourceMetricType,
            destMetricType,
            sourceData
          );
          rt95 = this.getNodeDataPoints(
            histograms['request_duration']['0.95'],
            '95th',
            sourceMetricType,
            destMetricType,
            sourceData
          );
          rt99 = this.getNodeDataPoints(
            histograms['request_duration']['0.99'],
            '99th',
            sourceMetricType,
            destMetricType,
            sourceData
          );
        } else {
          // TCP
          tcpSentRates = this.getNodeDataPoints(
            metrics['tcp_sent'],
            'Sent',
            sourceMetricType,
            destMetricType,
            sourceData
          );
          tcpReceivedRates = this.getNodeDataPoints(
            metrics['tcp_received'],
            'Received',
            sourceMetricType,
            destMetricType,
            sourceData
          );
        }

        this.setState({
          loading: false,
          reqRates: reqRates,
          errRates: errRates,
          rtAvg: rtAvg,
          rtMed: rtMed,
          rt95: rt95,
          rt99: rt99,
          tcpSent: tcpSentRates,
          tcpReceived: tcpReceivedRates
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
          reqRates: null
        });
      });

    this.setState({ loading: true, metricsLoadError: null });
  };

  private safeRate = (s: any) => {
    return isNaN(s) ? 0.0 : Number(s);
  };

  private renderCharts = (edge, isGrpc, isHttp, isTcp) => {
    if (!this.hasSupportedCharts(edge)) {
      return isGrpc || isHttp ? (
        <>
          <Icon type="pf" name="info" /> Service graphs do not support service-to-service aggregate sparklines. See the
          chart above for aggregate traffic or use the workload graph type to observe individual workload-to-service
          edge sparklines.
        </>
      ) : (
        <>
          <Icon type="pf" name="info" /> Service graphs do not support service-to-service aggregate sparklines. Use the
          workload graph type to observe individual workload-to-service edge sparklines.
        </>
      );
    }

    if (this.state.loading && !this.state.reqRates) {
      return <strong>Loading charts...</strong>;
    }

    if (this.state.metricsLoadError) {
      return (
        <div>
          <Icon type="pf" name="warning-triangle-o" /> <strong>Error loading metrics: </strong>
          {this.state.metricsLoadError}
        </div>
      );
    }

    let rpsChart, tcpChart;
    if (isGrpc || isHttp) {
      const labelRps = isGrpc ? 'GRPC Request Traffic' : 'HTTP Request Traffic';
      const labelRt = isGrpc ? 'GRPC Request Response Time (ms)' : 'HTTP Request Response Time (ms)';
      rpsChart = (
        <>
          <RpsChart label={labelRps} dataRps={this.state.reqRates!} dataErrors={this.state.errRates} />
          <hr />
          <ResponseTimeChart
            label={labelRt}
            rtAvg={this.state.rtAvg}
            rtMed={this.state.rtMed}
            rt95={this.state.rt95}
            rt99={this.state.rt99}
          />
          <hr />
        </>
      );
    } else if (isTcp) {
      tcpChart = <TcpChart label="TCP Traffic" sentRates={this.state.tcpSent} receivedRates={this.state.tcpReceived} />;
    }

    return (
      <>
        {rpsChart}
        {tcpChart}
      </>
    );
  };

  private hasSupportedCharts = edge => {
    const sourceData = nodeData(edge.source());
    const destData = nodeData(edge.target());
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
}
