import * as React from 'react';

import ServiceInfoBadge from '../../pages/ServiceDetails/ServiceInfo/ServiceInfoBadge';
import { RateTable } from '../../components/SummaryPanel/RateTable';
import { RpsChart } from '../../components/SummaryPanel/RpsChart';
import { SummaryPanelPropType } from '../../types/Graph';
import * as API from '../../services/Api';
import * as M from '../../types/Metrics';
import MetricsOptions from '../../types/MetricsOptions';

type SummaryPanelState = {
  loading: boolean;
  requestCountIn?: M.MetricGroup;
  requestCountOut?: M.MetricGroup;
  requestErrorCountIn?: M.MetricGroup;
  requestErrorCountOut?: M.MetricGroup;
};

export default class SummaryPanelGroup extends React.Component<SummaryPanelPropType, SummaryPanelState> {
  static readonly panelStyle = {
    position: 'absolute' as 'absolute',
    width: '25em',
    bottom: 0,
    top: 0,
    right: 0
  };

  constructor(props: SummaryPanelPropType) {
    super(props);
    this.state = {
      loading: false
    };
  }

  fetchMetrics(options: MetricsOptions) {
    const namespace = this.props.data.summaryTarget.data('service').split('.')[1];
    const service = this.props.data.summaryTarget.data('service').split('.')[0];

    this.setState({ loading: true });
    API.getServiceMetrics(namespace, service, options)
      .then(response => {
        const metrics: M.Metrics = response['data'];
        this.setState({
          loading: false,
          requestCountIn: metrics.metrics['request_count_in'],
          requestCountOut: metrics.metrics['request_count_out'],
          requestErrorCountIn: metrics.metrics['request_error_count_in'],
          requestErrorCountOut: metrics.metrics['request_error_count_out']
        });
      })
      .catch(error => {
        // TODO: show error alert
        this.setState({ loading: false });
        console.error(error);
      });
  }

  render() {
    const namespace = this.props.data.summaryTarget.data('service').split('.')[1];
    const service = this.props.data.summaryTarget.data('service').split('.')[0];
    const serviceHotLink = <a href={`../namespaces/${namespace}/services/${service}`}>{service}</a>;

    const RATE = 'rate';
    const RATE3XX = 'rate3XX';
    const RATE4XX = 'rate4xx';
    const RATE5XX = 'rate5xx';

    let incoming = { rate: 0, rate3xx: 0, rate4xx: 0, rate5xx: 0, rateErr: 0, percentErr: 0 };
    let outgoing = { rate: 0, rate3xx: 0, rate4xx: 0, rate5xx: 0, rateErr: 0, percentErr: 0 };

    // aggregate all incoming rates
    this.props.data.summaryTarget
      .children()
      .toArray()
      .forEach(c => {
        if (c.data(RATE) !== undefined) {
          incoming.rate += +c.data(RATE);
        }
        if (c.data(RATE3XX) !== undefined) {
          incoming.rate3xx += +c.data(RATE3XX);
          incoming.rateErr += +c.data(RATE3XX);
        }
        if (c.data(RATE4XX) !== undefined) {
          incoming.rate4xx += +c.data(RATE4XX);
          incoming.rateErr += +c.data(RATE4XX);
        }
        if (c.data(RATE5XX) !== undefined) {
          incoming.rate5xx += +c.data(RATE5XX);
          incoming.rateErr += +c.data(RATE5XX);
        }
      });
    if (incoming.rateErr !== 0) {
      incoming.percentErr = incoming.rateErr / incoming.rate * 100.0;
    }
    console.log('Aggregate incoming [' + namespace + '.' + service + ': ' + JSON.stringify(incoming));

    // aggregate all outgoing rates
    this.props.data.summaryTarget
      .children()
      .edgesTo('*')
      .forEach(c => {
        if (c.data(RATE) !== undefined) {
          outgoing.rate += +c.data(RATE);
        }
        if (c.data(RATE3XX) !== undefined) {
          outgoing.rate3xx += +c.data(RATE3XX);
          outgoing.rateErr += +c.data(RATE3XX);
        }
        if (c.data(RATE4XX) !== undefined) {
          outgoing.rate4xx += +c.data(RATE4XX);
          outgoing.rateErr += +c.data(RATE4XX);
        }
        if (c.data(RATE5XX) !== undefined) {
          outgoing.rate5xx += +c.data(RATE5XX);
          outgoing.rateErr += +c.data(RATE5XX);
        }
      });
    if (outgoing.rateErr !== 0) {
      outgoing.percentErr = outgoing.rateErr / outgoing.rate * 100.0;
    }
    console.log('Aggregate outgoing [' + namespace + '.' + service + ': ' + JSON.stringify(outgoing));

    return (
      <div className="panel panel-default" style={SummaryPanelGroup.panelStyle}>
        <div className="panel-heading">Versioned Group: {serviceHotLink}</div>
        <div className="panel-body">
          <p>
            <strong>Labels:</strong>
            <br />
            <ServiceInfoBadge
              scale={0.8}
              style="plastic"
              leftText="namespace"
              rightText={namespace}
              key={namespace}
              color="green"
            />
            {this.renderVersionBadges()}
          </p>
          <hr />
          <RateTable
            title="Incoming Traffic (requests per second):"
            rate={incoming.rate}
            rate3xx={incoming.rate3xx}
            rate4xx={incoming.rate4xx}
            rate5xx={incoming.rate5xx}
          />
          <RateTable
            title="Outgoing Traffic (requests per second):"
            rate={outgoing.rate}
            rate3xx={outgoing.rate3xx}
            rate4xx={outgoing.rate4xx}
            rate5xx={outgoing.rate5xx}
          />
          <div style={{ fontSize: '1.2em' }}>
            {this.renderIncomingRpsChart()}
            {this.renderOutgoingRpsChart()}
          </div>
        </div>
      </div>
    );
  }

  renderVersionBadges = () => {
    return this.props.data.summaryTarget
      .children()
      .toArray()
      .map((c, i) => (
        <ServiceInfoBadge
          scale={0.8}
          style="plastic"
          leftText="version"
          rightText={c.data('version')}
          key={c.data('version')}
          color="green"
        />
      ));
  };

  renderIncomingRpsChart = () => {
    if (this.state.requestCountIn != null && this.state.requestErrorCountIn != null) {
      let requestData: M.TimeSeries[] = this.state.requestCountIn.matrix;
      let errorData: M.TimeSeries[] = this.state.requestErrorCountIn.matrix;
      console.log('in-req=>' + JSON.stringify(requestData));
      console.log('in-err=>' + JSON.stringify(errorData));

      // TODO: how/what to populate these with?
      let requestDataArray: number[] = new Array();
      let requestDataErrorArray: number[] = new Array();
      return <RpsChart label="Incoming" dataRps={requestDataArray} dataErrors={requestDataErrorArray} />;
    } else {
      return;
    }
  };

  renderOutgoingRpsChart = () => {
    if (this.state.requestCountIn != null && this.state.requestErrorCountIn != null) {
      let requestData: M.TimeSeries[] = this.state.requestCountOut!.matrix;
      let errorData: M.TimeSeries[] = this.state.requestErrorCountOut!.matrix;
      console.log('out-req=>' + JSON.stringify(requestData));
      console.log('out-err=>' + JSON.stringify(errorData));

      // TODO: how/what to populate these with?
      let requestDataArray: number[] = new Array();
      let requestDataErrorArray: number[] = new Array();
      return <RpsChart label="Outgoing" dataRps={requestDataArray} dataErrors={requestDataErrorArray} />;
    } else {
      return;
    }
  };
}
