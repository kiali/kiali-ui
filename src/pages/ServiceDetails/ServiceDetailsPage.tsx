import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Tab } from '@patternfly/react-core';

import ServiceId from '../../types/ServiceId';
import IstioMetricsContainer from '../../components/Metrics/IstioMetrics';
import { RenderHeader } from '../../components/Nav/Page';
import { MetricsObjectTypes } from '../../types/Metrics';
import { KialiAppState } from '../../store/Store';
import { DurationInSeconds } from '../../types/Common';
import { durationSelector } from '../../store/Selectors';
import ParameterizedTabs, { activeTab } from '../../components/Tab/Tabs';
import ServiceInfo from './ServiceInfo';
import TracesComponent from 'components/JaegerIntegration/TracesComponent';
import { JaegerInfo } from 'types/JaegerInfo';
import TrafficDetails from 'components/TrafficList/TrafficDetails';
import TimeControlsContainer from '../../components/Time/TimeControls';
import { retrieveTimeRange } from '../../components/Time/TimeRangeHelper';
import * as MetricsHelper from '../../components/Metrics/Helper';
import TimeRangeComponent from '../../components/Time/TimeRangeComponent';
import RefreshContainer from '../../components/Refresh/Refresh';
import * as API from '../../services/Api';
import Namespace from '../../types/Namespace';
import * as AlertUtils from '../../utils/AlertUtils';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';
import { PeerAuthentication, Validations } from '../../types/IstioObjects';
import ServiceWizardDropdown from '../../components/IstioWizards/ServiceWizardDropdown';

type ServiceDetailsState = {
  currentTab: string;
  gateways: string[];
  serviceDetails?: ServiceDetailsInfo;
  peerAuthentications: PeerAuthentication[];
  validations: Validations;
  lastRefresh: number;
};

interface ServiceDetailsProps extends RouteComponentProps<ServiceId> {
  duration: DurationInSeconds;
  jaegerInfo?: JaegerInfo;
}

const tabName = 'tab';
const defaultTab = 'info';
const trafficTabName = 'traffic';

const tabIndex: { [tab: string]: number } = {
  info: 0,
  traffic: 1,
  metrics: 2,
  traces: 3
};

class ServiceDetails extends React.Component<ServiceDetailsProps, ServiceDetailsState> {
  private promises = new PromisesRegistry();

  constructor(props: ServiceDetailsProps) {
    super(props);
    this.state = {
      currentTab: activeTab(tabName, defaultTab),
      gateways: [],
      validations: {},
      peerAuthentications: [],
      lastRefresh: new Date().getTime()
    };
  }

  componentDidMount(): void {
    this.fetchService();
  }

  componentDidUpdate(prevProps: ServiceDetailsProps, _prevState: ServiceDetailsState) {
    const active = activeTab(tabName, defaultTab);
    if (
      prevProps.match.params.namespace !== this.props.match.params.namespace ||
      prevProps.match.params.service !== this.props.match.params.service ||
      this.state.currentTab !== active ||
      prevProps.duration !== this.props.duration
    ) {
      this.setState({ currentTab: active, lastRefresh: new Date().getTime() });
    }
  }

  private fetchService = () => {
    this.promises.cancelAll();
    this.promises
      .register('namespaces', API.getNamespaces())
      .then(namespacesResponse => {
        const namespaces: Namespace[] = namespacesResponse.data;
        this.promises
          .registerAll(
            'gateways',
            namespaces.map(ns => API.getIstioConfig(ns.name, ['gateways'], false, '', ''))
          )
          .then(responses => {
            let gatewayList: string[] = [];
            responses.forEach(response => {
              const ns = response.data.namespace;
              response.data.gateways.forEach(gw => {
                gatewayList = gatewayList.concat(ns.name + '/' + gw.metadata.name);
              });
            });
            this.setState({ gateways: gatewayList });
          })
          .catch(gwError => {
            AlertUtils.addError('Could not fetch Gateways list.', gwError);
          });
      })
      .catch(error => {
        AlertUtils.addError('Could not fetch Namespaces list.', error);
      });

    API.getServiceDetail(this.props.match.params.namespace, this.props.match.params.service, true, this.props.duration)
      .then(results => {
        this.setState({
          serviceDetails: results,
          validations: results.validations,
          lastRefresh: new Date().getTime()
        });
      })
      .catch(error => {
        AlertUtils.addError('Could not fetch Service Details.', error);
      });

    API.getIstioConfig(this.props.match.params.namespace, ['peerauthentications'], false, '', '')
      .then(results => {
        this.setState({
          peerAuthentications: results.data.peerAuthentications
        });
      })
      .catch(error => {
        AlertUtils.addError('Could not fetch PeerAuthentications.', error);
      });
  };

  private renderTabs() {
    const overTab = (
      <Tab eventKey={0} title="Overview" key="Overview">
        <ServiceInfo
          namespace={this.props.match.params.namespace}
          service={this.props.match.params.service}
          duration={this.props.duration}
          lastRefresh={this.state.lastRefresh}
          serviceDetails={this.state.serviceDetails}
          gateways={this.state.gateways}
          peerAuthentications={this.state.peerAuthentications}
          validations={this.state.validations}
        />
      </Tab>
    );
    const trafficTab = (
      <Tab eventKey={1} title="Traffic" key={trafficTabName}>
        <TrafficDetails
          duration={this.props.duration}
          itemName={this.props.match.params.service}
          itemType={MetricsObjectTypes.SERVICE}
          namespace={this.props.match.params.namespace}
          lastRefresh={this.state.lastRefresh}
        />
      </Tab>
    );

    const inTab = (
      <Tab eventKey={2} title="Inbound Metrics" key="Inbound Metrics">
        <IstioMetricsContainer
          namespace={this.props.match.params.namespace}
          object={this.props.match.params.service}
          objectType={MetricsObjectTypes.SERVICE}
          direction={'inbound'}
          lastRefresh={this.state.lastRefresh}
        />
      </Tab>
    );

    const tabsArray: JSX.Element[] = [overTab, trafficTab, inTab];

    if (this.props.jaegerInfo && this.props.jaegerInfo.enabled && this.props.jaegerInfo.integration) {
      tabsArray.push(
        <Tab eventKey={3} title="Traces" key="Traces">
          <TracesComponent
            namespace={this.props.match.params.namespace}
            target={this.props.match.params.service}
            targetKind={'service'}
            showErrors={false}
            duration={this.props.duration}
          />
        </Tab>
      );
    }

    return tabsArray;
  }

  render() {
    const timeControlComponent = (
      <TimeControlsContainer
        key={'DurationDropdown'}
        id="service-info-duration-dropdown"
        handleRefresh={this.fetchService}
        disabled={false}
      />
    );
    const timeRange = retrieveTimeRange() || MetricsHelper.defaultMetricsDuration;
    const timeRangeComponent = (
      <>
        <TimeRangeComponent range={timeRange} onChanged={this.fetchService} tooltip={'Time range'} allowCustom={true} />
        <RefreshContainer id="metrics-refresh" handleRefresh={this.fetchService} hideLabel={true} manageURL={true} />
      </>
    );

    let timeComponent: JSX.Element;
    switch (this.state.currentTab) {
      case 'info':
      case 'traffic':
      case 'traces':
        timeComponent = timeControlComponent;
        break;
      default:
        timeComponent = timeRangeComponent;
        break;
    }

    const actionsToolbar = this.state.serviceDetails ? (
      <ServiceWizardDropdown
        namespace={this.props.match.params.namespace}
        serviceName={this.state.serviceDetails.service.name}
        show={false}
        workloads={this.state.serviceDetails.workloads || []}
        virtualServices={this.state.serviceDetails.virtualServices}
        destinationRules={this.state.serviceDetails.destinationRules}
        gateways={this.state.gateways}
        peerAuthentications={this.state.peerAuthentications}
        tlsStatus={this.state.serviceDetails.namespaceMTLS}
        onChange={() => {
          this.fetchService();
        }}
      />
    ) : undefined;

    return (
      <>
        <RenderHeader location={this.props.location} rightToolbar={timeComponent} actionsToolbar={actionsToolbar} />
        <ParameterizedTabs
          id="basic-tabs"
          onSelect={tabValue => {
            this.setState({ currentTab: tabValue });
          }}
          tabMap={tabIndex}
          tabName={tabName}
          defaultTab={defaultTab}
          activeTab={this.state.currentTab}
          mountOnEnter={true}
          unmountOnExit={true}
        >
          {this.renderTabs()}
        </ParameterizedTabs>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  jaegerInfo: state.jaegerState.info
});

const ServiceDetailsPageContainer = connect(mapStateToProps)(ServiceDetails);
export default ServiceDetailsPageContainer;
