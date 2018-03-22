import * as React from 'react';
import ServiceInfoBadge from '../../pages/ServiceDetails/ServiceInfo/ServiceInfoBadge';
import { RateTable } from '../../components/SummaryPanel/RateTable';
import { RpsChart } from '../../components/SummaryPanel/RpsChart';
import { SummaryPanelPropType } from '../../types/Graph';
import * as API from '../../services/Api';
import * as M from '../../types/Metrics';
import graphUtils from '../../utils/graphing';

type SummaryPanelEdgeState = {
  loading: boolean;
  reqRates: [string, number][];
  errRates: [string, number][];
};

export default class SummaryPanelEdge extends React.Component<SummaryPanelPropType, SummaryPanelEdgeState> {
  static readonly panelStyle = {
    position: 'absolute' as 'absolute',
    width: '25em',
    top: 0,
    right: 0
  };

  constructor(props: SummaryPanelPropType) {
    super(props);

    this.state = {
      loading: true,
      reqRates: [],
      errRates: []
    };
  }

  componentDidMount() {
    this.updateRpsChart(this.props);
  }

  componentWillReceiveProps(nextProps: SummaryPanelPropType) {
    if (nextProps.data.summaryTarget !== this.props.data.summaryTarget) {
      this.updateRpsChart(nextProps);
    }
  }

  render() {
    const edge = this.props.data.summaryTarget;
    const source = edge.source();
    const sourceService = source.data('service');
    const sourceVersion = source.data('version');
    const sourceSplit = sourceService.split('.');
    const sourceServiceName = sourceSplit[0];
    const sourceNamespace = sourceSplit.length < 2 ? 'unknown' : sourceSplit[1];
    const dest = edge.target();
    const destService = dest.data('service');
    const destVersion = dest.data('version');
    const destSplit = dest.data('service').split('.');
    const destServiceName = destSplit[0];
    const destNamespace = destSplit[1];
    const rate = this.safeRate(edge.data('rate'));
    const rate3xx = this.safeRate(edge.data('rate3XX'));
    const rate4xx = this.safeRate(edge.data('rate4XX'));
    const rate5xx = this.safeRate(edge.data('rate5XX'));
    const sourceLink = <a href={`../namespaces/${sourceNamespace}/services/${sourceService}`}>{sourceServiceName}</a>;
    const destLink = <a href={`../namespaces/${destNamespace}/services/${destService}`}>{destServiceName}</a>;

    return (
      <div className="panel panel-default" style={SummaryPanelEdge.panelStyle}>
        <div hidden={sourceServiceName === 'unknown'} className="panel-heading">
          Edge Source: {sourceLink}
        </div>
        <div hidden={sourceServiceName !== 'unknown'} className="panel-heading">
          Edge Source: unknown
        </div>
        <div className="panel-body">
          <p>{this.renderLabels(sourceNamespace, sourceVersion)}</p>
        </div>
        <div className="panel-heading">Edge Dest: {destLink}</div>
        <div className="panel-body">
          <p>{this.renderLabels(destNamespace, destVersion)}</p>
          <hr />
          <RateTable
            title="Traffic (requests per second):"
            rate={rate}
            rate3xx={rate3xx}
            rate4xx={rate4xx}
            rate5xx={rate5xx}
          />
          <div>
            <hr />
            {this.renderRpsChart()}
          </div>
        </div>
      </div>
    );
  }

  private updateRpsChart = (props: SummaryPanelPropType) => {
    const edge = props.data.summaryTarget;
    const source = edge.source();
    const sourceService = source.data('service');
    const sourceVersion = source.data('version');
    const dest = edge.target();
    const destVersion = dest.data('version');
    const destSplit = dest.data('service').split('.');
    const destServiceName = destSplit[0];
    const destNamespace = destSplit[1];

    const options = {
      version: destVersion,
      'byLabelsIn[]': 'source_service,source_version',
      duration: this.props.duration
    };
    API.getServiceMetrics(destNamespace, destServiceName, options)
      .then(response => {
        const data: M.Metrics = response['data'];
        const metrics: Map<String, M.MetricGroup> = data.metrics;
        const reqRates = this.getRates(metrics['request_count_in'], 'RPS', sourceService, sourceVersion);
        const errRates = this.getRates(metrics['request_error_count_in'], 'Error', sourceService, sourceVersion);

        this.setState({
          loading: false,
          reqRates: reqRates,
          errRates: errRates
        });
      })
      .catch(error => {
        this.setState({ loading: false });
        console.error(error);
        // this.props.onError(error);
      });
  };

  private safeRate = (s: string) => {
    return s === undefined ? 0.0 : parseFloat(s);
  };

  private renderLabels = (ns: string, ver: string) => (
    // color="#2d7623" is pf-green-500
    <>
      <ServiceInfoBadge scale={0.8} style="plastic" leftText="namespace" rightText={ns} color="#2d7623" />
      <ServiceInfoBadge scale={0.8} style="plastic" leftText="version" rightText={ver} color="#2d7623" />
    </>
  );

  private renderRpsChart = () => {
    if (this.state.loading) {
      return <strong>loading chart...</strong>;
    }

    return <RpsChart label="Request Average" dataRps={this.state.reqRates} dataErrors={this.state.errRates} />;
  };

  private getRates = (
    mg: M.MetricGroup,
    title: string,
    sourceService: string,
    sourceVersion: string
  ): [string, number][] => {
    const tsa: M.TimeSeries[] = mg.matrix;
    let series: M.TimeSeries[] = [];

    for (let i = 0; i < tsa.length; ++i) {
      const ts = tsa[i];
      if (ts.metric['source_service'] === sourceService && ts.metric['source_version'] === sourceVersion) {
        series.push(ts);
      }
    }
    return graphUtils.toC3Columns(series, title);
  };
}
