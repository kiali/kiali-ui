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
import TrafficDetails from '../../components/Metrics/TrafficDetails';

type ServiceDetailsState = {
  currentTab: string;
};

interface ServiceDetailsProps extends RouteComponentProps<ServiceId> {
  duration: DurationInSeconds;
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
  constructor(props: ServiceDetailsProps) {
    super(props);
    this.state = {
      currentTab: activeTab(tabName, defaultTab)
    };
  }

  componentDidUpdate(prevProps: ServiceDetailsProps, _prevState: ServiceDetailsState) {
    if (
      prevProps.match.params.namespace !== this.props.match.params.namespace ||
      prevProps.match.params.service !== this.props.match.params.service ||
      this.state.currentTab !== activeTab(tabName, defaultTab) ||
      prevProps.duration !== this.props.duration
    ) {
      this.setState({ currentTab: activeTab(tabName, defaultTab) });
    }
  }

  render() {
    const overviewTab = (
      <Tab eventKey={0} title="Overview" key="Overview">
        <ServiceInfo
          namespace={this.props.match.params.namespace}
          service={this.props.match.params.service}
          duration={this.props.duration}
        />
      </Tab>
    );
    const trafficTab = (
      <Tab eventKey={1} title="Traffic" key={trafficTabName}>
        <TrafficDetails
          itemType={MetricsObjectTypes.SERVICE}
          namespace={this.props.match.params.namespace}
          serviceName={this.props.match.params.service}
          duration={this.props.duration}
        />
      </Tab>
    );
    const inboundMetricsTab = (
      <Tab eventKey={2} title="Inbound Metrics" key="Inbound Metrics">
        <IstioMetricsContainer
          namespace={this.props.match.params.namespace}
          object={this.props.match.params.service}
          objectType={MetricsObjectTypes.SERVICE}
          direction={'inbound'}
        />
      </Tab>
    );

    // Default tabs
    const tabsArray: any[] = [overviewTab, trafficTab, inboundMetricsTab];

    return (
      <>
        <RenderHeader location={this.props.location}>
          {
            // This magic space will align details header width with Graph, List pages
          }
          <div style={{ paddingBottom: 14 }} />
        </RenderHeader>
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
          {tabsArray}
        </ParameterizedTabs>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state)
});

const ServiceDetailsPageContainer = connect(mapStateToProps)(ServiceDetails);
export default ServiceDetailsPageContainer;
