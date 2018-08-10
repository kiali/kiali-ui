import * as React from 'react';
import InOutRateTable from '../../components/SummaryPanel/InOutRateTable';
import RpsChart from '../../components/SummaryPanel/RpsChart';
import { SummaryPanelPropType } from '../../types/Graph';
import * as M from '../../types/Metrics';
import graphUtils from '../../utils/Graphing';
import { getAccumulatedTrafficRate } from '../../utils/TrafficRate';
import { Icon } from 'patternfly-react';
import { shouldRefreshData, updateHealth, nodeData, getNodeMetrics, getNodeMetricType } from './SummaryPanelCommon';
import { DisplayMode, HealthIndicator } from '../../components/Health/HealthIndicator';
import Label from '../../components/Label/Label';
import { Health } from '../../types/Health';

type SummaryPanelGroupState = {
  loading: boolean;
  requestCountIn: [string, number][];
  requestCountOut: [string, number][];
  errorCountIn: [string, number][];
  errorCountOut: [string, number][];
  healthLoading: boolean;
  health?: Health;
};

export default class SummaryPanelGroup extends React.Component<SummaryPanelPropType, SummaryPanelGroupState> {
  static readonly panelStyle = {
    width: '25em',
    minWidth: '25em',
    overflowY: 'auto' as 'auto'
  };

  // avoid state changes after component is unmounted
  _isMounted: boolean = false;

  constructor(props: SummaryPanelPropType) {
    super(props);
    this.state = {
      loading: true,
      requestCountIn: [],
      requestCountOut: [],
      errorCountIn: [],
      errorCountOut: [],
      healthLoading: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.updateRpsCharts(this.props);
    updateHealth(this.props.data.summaryTarget, this.setState.bind(this));
  }

  componentDidUpdate(prevProps: SummaryPanelPropType) {
    if (shouldRefreshData(prevProps, this.props)) {
      this.updateRpsCharts(this.props);
      updateHealth(this.props.data.summaryTarget, this.setState.bind(this));
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const group = this.props.data.summaryTarget;
    const { namespace, app } = nodeData(group);

    const incoming = getAccumulatedTrafficRate(group.children());
    const outgoing = getAccumulatedTrafficRate(group.children().edgesTo('*'));
    const workloadList = this.renderWorkloadList(group);

    return (
      <div className="panel panel-default" style={SummaryPanelGroup.panelStyle}>
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
          <span> app: {app}</span>
          <div className="label-collection" style={{ paddingTop: '3px' }}>
            <Label name="namespace" value={namespace} key={namespace} />
            {this.renderVersionBadges()}
          </div>
          {this.renderBadgeSummary(group.data('hasVS'))}
        </div>
        <div className="panel-body">
          {workloadList.length > 0 && (
            <div>
              <strong>Workloads: </strong>
              {workloadList}
              <hr />
            </div>
          )}
          {/* TODO: link to App Details charts when available
           <p style={{ textAlign: 'right' }}>
            <Link to={`/namespaces/${namespace}/services/${app}?tab=metrics&groupings=local+version%2Cresponse+code`}>
              View detailed charts <Icon name="angle-double-right" />
            </Link>
          </p> */}
          <InOutRateTable
            title="Request Traffic (requests per second):"
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
          <div>{this.renderRpsCharts()}</div>
        </div>
      </div>
    );
  }

  private updateRpsCharts = (props: SummaryPanelPropType) => {
    const target = props.data.summaryTarget;
    const nodeMetricType = getNodeMetricType(target);

    if (!nodeMetricType) {
      return;
    }

    const filters = ['request_count', 'request_error_count'];
    const includeIstio = props.namespace === 'istio-system';

    getNodeMetrics(nodeMetricType, target, props, filters, includeIstio)
      .then(response => {
        if (!this._isMounted) {
          console.log('SummaryPanelGroup: Ignore fetch, component not mounted.');
          return;
        }
        const metrics = response.data.metrics;
        const reqCountIn: M.MetricGroup = metrics['request_count_in'];
        const reqCountOut: M.MetricGroup = metrics['request_count_out'];
        const errCountIn: M.MetricGroup = metrics['request_error_count_in'];
        const errCountOut: M.MetricGroup = metrics['request_error_count_out'];

        this.setState({
          loading: false,
          requestCountIn: graphUtils.toC3Columns(reqCountIn.matrix, 'RPS'),
          requestCountOut: graphUtils.toC3Columns(reqCountOut.matrix, 'RPS'),
          errorCountIn: graphUtils.toC3Columns(errCountIn.matrix, 'Error'),
          errorCountOut: graphUtils.toC3Columns(errCountOut.matrix, 'Error')
        });
      })
      .catch(error => {
        if (!this._isMounted) {
          console.log('SummaryPanelGroup: Ignore fetch error, component not mounted.');
          return;
        }
        // TODO: show error alert
        this.setState({ loading: false });
        console.error(error);
      });
  };

  private renderVersionBadges = () => {
    return this.props.data.summaryTarget
      .children()
      .toArray()
      .map((c, i) => <Label key={c.data('version')} name="version" value={c.data('version')} />);
  };

  private renderBadgeSummary = (hasVS: boolean) => {
    return (
      <>
        {hasVS && (
          <div>
            <Icon name="code-fork" type="fa" style={{ width: '10px' }} />
            Has Virtual Service
          </div>
        )}
      </>
    );
  };

  private renderRpsCharts = () => {
    if (this.state.loading) {
      return <strong>loading charts...</strong>;
    }
    return (
      <>
        <RpsChart
          label="Incoming Request Traffic"
          dataRps={this.state.requestCountIn}
          dataErrors={this.state.errorCountIn}
        />
        <RpsChart
          label="Outgoing Request Traffic"
          dataRps={this.state.requestCountOut}
          dataErrors={this.state.errorCountOut}
        />
      </>
    );
  };

  private renderWorkloadList = (group): any[] => {
    let workloadList: any[] = [];

    group.children().forEach(node => {
      let workload = node.data('workload');

      if (workload) {
        workloadList.push(workload);
        workloadList.push(', ');
      }
    });

    if (workloadList.length > 0) {
      workloadList.pop();
    }

    return workloadList;
  };
}
