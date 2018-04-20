import * as React from 'react';
import * as API from '../../services/Api';
import * as pf from 'patternfly-react';

import graphUtils from '../../utils/graphing';
import { getTrafficRate, getAccumulatedTrafficRate } from '../../utils/TrafficRate';
import Badge from '../../components/Badge/Badge';
import InOutRateTable from '../../components/SummaryPanel/InOutRateTable';
import RpsChart from '../../components/SummaryPanel/RpsChart';
import { SummaryPanelPropType } from '../../types/Graph';
import MetricsOptions from '../../types/MetricsOptions';
import LocalTime from '../../components/Time/LocalTime';
import RouteRuleIstioService from '../ServiceDetails/ServiceInfo/ServiceInfoRouteRules/RouteRuleIstioService';

type SummaryPanelStateType = {
  loading: boolean;
  requestCountIn: [string, number][];
  requestCountOut: [string, number][];
  errorCountIn: [string, number][];
  errorCountOut: [string, number][];
};

export default class SummaryPanelNode extends React.Component<SummaryPanelPropType, SummaryPanelStateType> {
  static readonly panelStyle = {
    position: 'absolute' as 'absolute',
    width: '25em',
    top: 0,
    right: 0
  };

  // avoid state changes after component is unmounted
  _isMounted: boolean = false;

  constructor(props: SummaryPanelPropType) {
    super(props);
    this.showRequestCountMetrics = this.showRequestCountMetrics.bind(this);

    this.state = {
      loading: true,
      requestCountIn: [],
      requestCountOut: [],
      errorCountIn: [],
      errorCountOut: []
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchRequestCountMetrics(this.props);
  }

  componentWillReceiveProps(nextProps: SummaryPanelPropType) {
    if (nextProps.data.summaryTarget && nextProps.data.summaryTarget !== this.props.data.summaryTarget) {
      this.fetchRequestCountMetrics(nextProps);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetchRequestCountMetrics(props: SummaryPanelPropType) {
    const namespace = props.data.summaryTarget.data('service').split('.')[1];
    const service = props.data.summaryTarget.data('service').split('.')[0];
    const version = props.data.summaryTarget.data('version');
    const options: MetricsOptions = {
      version: version,
      queryTime: props.queryTime,
      duration: +props.duration,
      step: props.step,
      rateInterval: props.rateInterval,
      filters: ['request_count', 'request_error_count']
    };
    // console.log('loadServiceMetrics SummaryNode');
    API.getServiceMetrics(namespace, service, options)
      .then(response => {
        if (!this._isMounted) {
          console.log('SummaryPanelNode: Ignore fetch, component not mounted.');
          return;
        }
        this.showRequestCountMetrics(response);
      })
      .catch(error => {
        if (!this._isMounted) {
          console.log('SummaryPanelNode: Ignore fetch error, component not mounted.');
          return;
        }
        this.setState({ loading: false });
        console.error(error);
      });

    this.setState({ loading: true });
  }

  showRequestCountMetrics(xhrRequest: any) {
    const metrics = xhrRequest.data.metrics;

    this.setState({
      loading: false,
      requestCountOut: graphUtils.toC3Columns(metrics.request_count_out.matrix, 'RPS'),
      requestCountIn: graphUtils.toC3Columns(metrics.request_count_in.matrix, 'RPS'),
      errorCountIn: graphUtils.toC3Columns(metrics.request_error_count_in.matrix, 'Error'),
      errorCountOut: graphUtils.toC3Columns(metrics.request_error_count_out.matrix, 'Error')
    });
  }

  render() {
    const node = this.props.data.summaryTarget;

    const serviceSplit = node.data('service').split('.');
    const namespace = serviceSplit.length < 2 ? 'unknown' : serviceSplit[1];
    const service = serviceSplit[0];
    const serviceHotLink = <a href={`../namespaces/${namespace}/services/${service}`}>{service}</a>;

    const incoming = getTrafficRate(node);
    const outgoing = getAccumulatedTrafficRate(this.props.data.summaryTarget.edgesTo('*'));

    const isUnknown = service === 'unknown';
    return (
      <div className="panel panel-default" style={SummaryPanelNode.panelStyle}>
        <div className="panel-heading">
          Service: {isUnknown ? 'unknown' : serviceHotLink}
          <div style={{ paddingTop: '3px' }}>
            <Badge
              scale={0.9}
              style="plastic"
              leftText="namespace"
              rightText={namespace}
              color="#2d7623" // pf-green-500
            />
            <Badge
              scale={0.9}
              style="plastic"
              leftText="version"
              rightText={this.props.data.summaryTarget.data('version')}
              color="#2d7623" // pf-green-500
            />
          </div>
        </div>
        <div className="panel-body">
          <pf.TabContainer defaultActiveKey="traffic">
            <div>
              <pf.Nav bsClass="nav nav-tabs">
                <pf.NavItem eventKey="traffic">Traffic</pf.NavItem>
                <pf.NavItem eventKey="ci">Circuit Breakers</pf.NavItem>
              </pf.Nav>
              <pf.TabContent>
                <pf.TabPane eventKey="traffic">
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
                  <div>{this.renderRpsCharts()}</div>
                </pf.TabPane>
                <pf.TabPane eventKey="ci">{this.renderCircuitBreakers()}</pf.TabPane>
              </pf.TabContent>
            </div>
          </pf.TabContainer>
        </div>
      </div>
    );
  }

  renderRpsCharts = () => {
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

  private renderCircuitBreakers = () => {
    const dps = this.props.data.summaryTarget.data('destinationPolicies');
    if (!dps) {
      return null;
    }

    return dps.map((dPolicy, i) => {
      let circuitBreaker;
      if (dPolicy.circuitBreaker) {
        circuitBreaker = (
          <div>
            <strong>CircuitBreaker</strong>
            <ul style={{ listStyleType: 'none' }}>
              {dPolicy.circuitBreaker.simpleCb ? (
                <li>
                  <strong>simpleCb</strong>
                  <ul style={{ listStyleType: 'none' }}>
                    {dPolicy.circuitBreaker.simpleCb.maxConnections ? (
                      <li>[maxConnections] {dPolicy.circuitBreaker.simpleCb.maxConnections}</li>
                    ) : null}
                    {dPolicy.circuitBreaker.simpleCb.httpMaxPendingRequests ? (
                      <li>[httpMaxPendingRequests] {dPolicy.circuitBreaker.simpleCb.httpMaxPendingRequests}</li>
                    ) : null}
                    {dPolicy.circuitBreaker.simpleCb.httpMaxRequests ? (
                      <li>[httpMaxRequests] {dPolicy.circuitBreaker.simpleCb.httpMaxRequests}</li>
                    ) : null}
                    {dPolicy.circuitBreaker.simpleCb.sleepWindow ? (
                      <li>[sleepWindow] {dPolicy.circuitBreaker.simpleCb.sleepWindow}</li>
                    ) : null}
                    {dPolicy.circuitBreaker.simpleCb.httpConsecutiveErrors ? (
                      <li>[httpConsecutiveErrors] {dPolicy.circuitBreaker.simpleCb.httpConsecutiveErrors}</li>
                    ) : null}
                    {dPolicy.circuitBreaker.simpleCb.httpDetectionInterval ? (
                      <li>[httpDetectionInterval] {dPolicy.circuitBreaker.simpleCb.httpDetectionInterval}</li>
                    ) : null}
                    {dPolicy.circuitBreaker.simpleCb.httpMaxRequestsPerConnection ? (
                      <li>
                        [httpMaxRequestsPerConnection] {dPolicy.circuitBreaker.simpleCb.httpMaxRequestsPerConnection}
                      </li>
                    ) : null}
                    {dPolicy.circuitBreaker.simpleCb.httpMaxEjectionPercent ? (
                      <li>[httpMaxEjectionPercent] {dPolicy.circuitBreaker.simpleCb.httpMaxEjectionPercent}</li>
                    ) : null}
                    {dPolicy.circuitBreaker.simpleCb.httpMaxRetries ? (
                      <li>[httpMaxRetries] {dPolicy.circuitBreaker.simpleCb.httpMaxRetries}</li>
                    ) : null}
                  </ul>
                </li>
              ) : null}
              {dPolicy.circuitBreaker.custom ? <li>[custom] {dPolicy.circuitBreaker.custom}</li> : null}
            </ul>
          </div>
        );
      }
      return (
        <div key={'rule' + i}>
          <div>
            <strong>Name</strong>
            {': '}
            {dPolicy.name}
          </div>
          <div>
            <strong>Created at</strong>
            {': '}
            <LocalTime time={dPolicy.created_at} />
          </div>
          {dPolicy.destination ? <RouteRuleIstioService name="Destination" service={dPolicy.destination} /> : null}
          {dPolicy.source ? <RouteRuleIstioService name="Source" service={dPolicy.source} /> : null}

          {circuitBreaker}
          <hr />
        </div>
      );
    });
  };
}
