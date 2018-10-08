import * as React from 'react';
import * as API from '../../services/Api';
import { EmptyState, EmptyStateTitle, EmptyStateIcon } from 'patternfly-react';
import * as MessageCenter from '../../utils/MessageCenter';
import { ToolbarDropdown } from '../../components/ToolbarDropdown/ToolbarDropdown';
import ServiceTracesJaeger from '../ServiceDetails/ServiceTraces/ServiceTracesJaeger';
import { config } from '../../config';
import { HistoryManager, URLParams } from '../../app/History';
import { Toolbar, FormGroup, Checkbox } from 'patternfly-react';
import history from '../../app/History';
import { authentication } from '../../utils/Authentication';
import NamespaceDropdownContainer from '../../containers/NamespaceDropdownContainer';
import Namespace from '../../types/Namespace';

type ServiceJaegerProps = {};

type ServiceJaegerState = {
  namespace: Namespace;
  service: string;
  services: string[];
  jaegerURL: string;
  error: boolean;
  duration: number;
  onlyErrors: boolean;
};

const EmptyStatePage = () => (
  <>
    <h2>Distributed Tracing</h2>
    <EmptyState>
      <EmptyStateIcon name="info" />
      <EmptyStateTitle>
        Distributed Tracing is not available.
        <br />
        This could mean that we couldn't communicate to the service.
      </EmptyStateTitle>
    </EmptyState>
  </>
);

class ServiceJaegerPage extends React.Component<ServiceJaegerProps, ServiceJaegerState> {
  static Durations = config().toolbar.intervalDuration;
  static DefaultDuration = config().toolbar.defaultDuration;

  constructor(props: ServiceJaegerProps) {
    super(props);
    const urlParams = new URLSearchParams(history.location.search);
    this.state = {
      namespace: { name: 'istio-system' },
      service: 'Filter by Service',
      services: [],
      jaegerURL:
        'http://localhost:3000/search?embed&end=1538998038173000&limit=20&lookback=1h&maxDuration&minDuration&service=productpage&start=1538994438173000',
      error: false,
      duration: this.initialDuration(urlParams),
      onlyErrors: true
    };
    this.fetchServices(this.state.namespace.name);
  }

  fetchServices = (ns: String) => {
    API.getServices(authentication(), ns)
      .then(response => {
        let services: string[] = [];
        for (let serv of response.data.services) {
          services.push(serv.name);
        }
        this.setState({ services: services, service: 'Filter by Service' });
      })
      .catch(error => {
        MessageCenter.add('Error getting services');
      });
  };

  initialDuration = (urlParams: URLSearchParams): number => {
    let d = urlParams.get(URLParams.DURATION);
    if (d !== null) {
      sessionStorage.setItem(URLParams.DURATION, d);
      return Number(d);
    }
    d = sessionStorage.getItem(URLParams.DURATION);
    return d !== null ? Number(d) : ServiceJaegerPage.DefaultDuration;
  };

  onDurationChange = (key: number) => {
    sessionStorage.setItem(URLParams.DURATION, String(key));
    HistoryManager.setParam(URLParams.DURATION, String(key));
    this.setState({ duration: key });
  };

  onServiceChange = (key: string) => {
    this.setState({ service: this.state.services[key] });
  };
  onErrorsChange = evt => {
    this.setState({ onlyErrors: evt.target.checked });
  };

  /*componentDidMount() {
    API.getJaegerInfo(authentication())
      .then(response => {
        let data = response['data'];
        this.setState({
          jaegerURL: data.url
        });
      })
      .catch(error => {
        MessageCenter.add(API.getErrorMsg('Could not fetch Jaeger info', error));
        this.setState({ error: true });
        console.log(error);
      });
  }*/

  onNamespaceChange = (namespace: Namespace) => {
    this.setState({ namespace: namespace, service: 'Filter by Service', services: [] });
    this.fetchServices(namespace.name);
  };

  render() {
    const serviceLabel = this.state.service;
    return (
      <>
        {this.state.error ? <EmptyStatePage /> : null}
        <div className="container-fluid container-cards-pf" style={{ height: 'calc(100vh - 100px)' }}>
          <Toolbar>
            <FormGroup>
              <NamespaceDropdownContainer activeNamespace={this.state.namespace} onSelect={this.onNamespaceChange} />
            </FormGroup>
            <FormGroup>
              <ToolbarDropdown
                id={'traces_filter_by_service'}
                disabled={false}
                handleSelect={this.onServiceChange}
                nameDropdown={'Services'}
                initialValue={serviceLabel}
                initialLabel={serviceLabel}
                options={this.state.services}
              />
            </FormGroup>
            <FormGroup>
              <ToolbarDropdown
                id={'traces_filter_interval_duration'}
                disabled={false}
                handleSelect={this.onDurationChange}
                nameDropdown={'Displaying'}
                initialValue={this.state.duration}
                initialLabel={String(ServiceJaegerPage.Durations[this.state.duration])}
                options={ServiceJaegerPage.Durations}
              />
            </FormGroup>
            <FormGroup controlId="checkbox">
              <Checkbox inline={true} checked={this.state.onlyErrors} onChange={this.onErrorsChange}>
                Only Errors
              </Checkbox>
            </FormGroup>
          </Toolbar>
          <ServiceTracesJaeger
            service={this.state.service}
            duration={this.state.duration}
            onlyErrors={this.state.onlyErrors}
          />
        </div>
      </>
    );
  }
}

export default ServiceJaegerPage;
