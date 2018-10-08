import * as React from 'react';
import { ToolbarDropdown } from '../../components/ToolbarDropdown/ToolbarDropdown';
import { Toolbar, FormGroup, Checkbox } from 'patternfly-react';
import ServiceId from '../../types/ServiceId';
import { HistoryManager, URLParams } from '../../app/History';
import { config } from '../../config';
import history from '../../app/History';
import ServiceTracesJaeger from './ServiceTraces/ServiceTracesJaeger';

type ServiceTraceState = {
  duration: number;
  onlyErrors: boolean;
};

class ServiceTraces extends React.Component<ServiceId, ServiceTraceState> {
  static Durations = config().toolbar.intervalDuration;
  static DefaultDuration = config().toolbar.defaultDuration;

  constructor(props: ServiceId) {
    super(props);
    const urlParams = new URLSearchParams(history.location.search);
    this.state = {
      duration: this.initialDuration(urlParams),
      onlyErrors: true
    };
  }

  initialDuration = (urlParams: URLSearchParams): number => {
    let d = urlParams.get(URLParams.DURATION);
    if (d !== null) {
      sessionStorage.setItem(URLParams.DURATION, d);
      return Number(d);
    }
    d = sessionStorage.getItem(URLParams.DURATION);
    return d !== null ? Number(d) : ServiceTraces.DefaultDuration;
  };

  onDurationChange = (key: number) => {
    sessionStorage.setItem(URLParams.DURATION, String(key));
    HistoryManager.setParam(URLParams.DURATION, String(key));
    this.setState({ duration: key });
  };

  onErrorsChange = evt => {
    this.setState({ onlyErrors: evt.target.checked });
  };

  render() {
    return (
      <div>
        <Toolbar>
          <FormGroup>
            <ToolbarDropdown
              id={'traces_filter_interval_duration'}
              disabled={false}
              handleSelect={this.onDurationChange}
              nameDropdown={'Displaying'}
              initialValue={this.state.duration}
              initialLabel={String(ServiceTraces.Durations[this.state.duration])}
              options={ServiceTraces.Durations}
            />
          </FormGroup>
          <FormGroup controlId="checkbox">
            <Checkbox inline={true} checked={this.state.onlyErrors} onChange={this.onErrorsChange}>
              Only Errors
            </Checkbox>
          </FormGroup>
        </Toolbar>
        <ServiceTracesJaeger
          service={this.props.service}
          duration={this.state.duration}
          onlyErrors={this.state.onlyErrors}
        />
      </div>
    );
  }

  /*private navigateToJaeger = () => {
  API.getJaegerInfo(authentication())
    .then(response => {
      let data = response['data'];
      window.open(data.url + `/search?service=${this.props.match.params.service}`, '_blank');
    })
    .catch(error => {
      MessageCenter.add(API.getErrorMsg('Could not fetch Jaeger info', error));
      console.log(error);
    });
  };*/
}

export default ServiceTraces;
