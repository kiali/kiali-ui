import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Tab } from '@patternfly/react-core';

import * as API from '../../services/Api';
import { App, AppId } from '../../types/App';
import AppInfo from './AppInfo';
import * as AlertUtils from '../../utils/AlertUtils';
import IstioMetricsContainer from '../../components/Metrics/IstioMetrics';
import { MetricsObjectTypes } from '../../types/Metrics';
import CustomMetricsContainer from '../../components/Metrics/CustomMetrics';
import { RenderHeader } from '../../components/Nav/Page';
import { DurationInSeconds, TimeInMilliseconds } from '../../types/Common';
import { KialiAppState } from '../../store/Store';
import { durationSelector } from '../../store/Selectors';
import ParameterizedTabs, { activeTab } from '../../components/Tab/Tabs';
import { JaegerInfo } from '../../types/JaegerInfo';
import TracesComponent from '../../components/JaegerIntegration/TracesComponent';
import TrafficDetails from 'components/TrafficList/TrafficDetails';
import TimeControlsContainer from '../../components/Time/TimeControls';
import TimeRangeComponent from '../../components/Time/TimeRangeComponent';
import { retrieveTimeRange } from '../../components/Time/TimeRangeHelper';
import * as MetricsHelper from '../../components/Metrics/Helper';
import RefreshContainer from '../../components/Refresh/Refresh';

type AppDetailsState = {
  app?: App;
  // currentTab is needed to (un)mount tab components
  // when the tab is not rendered.
  currentTab: string;
};

type ReduxProps = {
  duration: DurationInSeconds;
  jaegerInfo?: JaegerInfo;
  lastRefreshAt: TimeInMilliseconds;
};

type AppDetailsProps = RouteComponentProps<AppId> & ReduxProps;

const tabName = 'tab';
const defaultTab = 'info';
const tracesTabName = 'traces';
const paramToTab: { [key: string]: number } = {
  info: 0,
  traffic: 1,
  in_metrics: 2,
  out_metrics: 3,
  traces: 4
};
const nextTabIndex = 5;

class AppDetails extends React.Component<AppDetailsProps, AppDetailsState> {
  constructor(props: AppDetailsProps) {
    super(props);
    this.state = { currentTab: activeTab(tabName, defaultTab) };
  }

  componentDidMount(): void {
    console.log('TODELETE AppDetails componentDidMount');
    this.fetchApp();
  }

  componentDidUpdate(prevProps: AppDetailsProps) {
    console.log('TODELETE AppDetails componentDidUpdate');
    if (
      this.props.match.params.namespace !== prevProps.match.params.namespace ||
      this.props.match.params.app !== prevProps.match.params.app ||
      this.props.lastRefreshAt !== prevProps.lastRefreshAt
    ) {
      this.fetchApp();
    }
  }

  private fetchApp = () => {
    console.log('TODELETE AppDetails fetchApp');
    API.getApp(this.props.match.params.namespace, this.props.match.params.app)
      .then(details => this.setState({ app: details.data }))
      .catch(error => AlertUtils.addError('Could not fetch App Details.', error));
  };

  private runtimeTabs() {
    let tabOffset = 0;

    const tabs: JSX.Element[] = [];
    if (this.state.app) {
      this.state.app.runtimes.forEach(runtime => {
        runtime.dashboardRefs.forEach(dashboard => {
          const tabKey = tabOffset + nextTabIndex;
          paramToTab['cd-' + dashboard.template] = tabKey;

          const tab = (
            <Tab title={dashboard.title} key={'cd-' + dashboard.template} eventKey={tabKey}>
              <CustomMetricsContainer
                namespace={this.props.match.params.namespace}
                app={this.props.match.params.app}
                template={dashboard.template}
              />
            </Tab>
          );
          tabs.push(tab);
          tabOffset++;
        });
      });
    }

    return tabs;
  }

  private staticTabs() {
    const overTab = (
      <Tab title="Overview" eventKey={0} key={'Overview'}>
        <AppInfo app={this.state.app} duration={this.props.duration} />
      </Tab>
    );

    const trafficTab = (
      <Tab title="Traffic" eventKey={1} key={'Traffic'}>
        <TrafficDetails
          duration={this.props.duration}
          itemName={this.props.match.params.app}
          itemType={MetricsObjectTypes.APP}
          namespace={this.props.match.params.namespace}
        />
      </Tab>
    );

    const inTab = (
      <Tab title="Inbound Metrics" eventKey={2} key={'Inbound Metrics'}>
        <IstioMetricsContainer
          namespace={this.props.match.params.namespace}
          object={this.props.match.params.app}
          objectType={MetricsObjectTypes.APP}
          direction={'inbound'}
        />
      </Tab>
    );

    const outTab = (
      <Tab title="Outbound Metrics" eventKey={3} key={'Outbound Metrics'}>
        <IstioMetricsContainer
          namespace={this.props.match.params.namespace}
          object={this.props.match.params.app}
          objectType={MetricsObjectTypes.APP}
          direction={'outbound'}
        />
      </Tab>
    );

    // Default tabs
    const tabsArray: JSX.Element[] = [overTab, trafficTab, inTab, outTab];

    // Conditional Traces tab
    if (this.props.jaegerInfo && this.props.jaegerInfo.enabled) {
      if (this.props.jaegerInfo.integration) {
        tabsArray.push(
          <Tab eventKey={4} style={{ textAlign: 'center' }} title={'Traces'} key={tracesTabName}>
            <TracesComponent
              namespace={this.props.match.params.namespace}
              target={this.props.match.params.app}
              targetKind={'app'}
              showErrors={false}
              duration={this.props.duration}
            />
          </Tab>
        );
      } else {
        const service = this.props.jaegerInfo.namespaceSelector
          ? this.props.match.params.app + '.' + this.props.match.params.namespace
          : this.props.match.params.app;
        tabsArray.push(
          <Tab
            eventKey={4}
            href={this.props.jaegerInfo.url + `/search?service=${service}`}
            target="_blank"
            title={
              <>
                Traces <ExternalLinkAltIcon />
              </>
            }
          />
        );
      }
    }

    return tabsArray;
  }

  private renderTabs() {
    // PF4 Tabs doesn't support static tabs followed of an array of tabs created dynamically.
    return this.staticTabs().concat(this.runtimeTabs());
  }

  render() {
    console.log('TODELETE AppDetails render');
    const timeControlComponent = (
      <TimeControlsContainer key={'DurationDropdown'} id="app-info-duration-dropdown" disabled={false} />
    );
    const timeRange = retrieveTimeRange() || MetricsHelper.defaultMetricsDuration;
    const timeRangeComponent = (
      <>
        <TimeRangeComponent range={timeRange} tooltip={'Time range'} allowCustom={true} />
        <RefreshContainer id="metrics-refresh" hideLabel={true} manageURL={true} />
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
    return (
      <>
        <RenderHeader location={this.props.location} rightToolbar={timeComponent} />
        {this.state.app && (
          <ParameterizedTabs
            id="basic-tabs"
            onSelect={tabValue => {
              this.setState({ currentTab: tabValue });
            }}
            tabMap={paramToTab}
            tabName={tabName}
            defaultTab={defaultTab}
            activeTab={this.state.currentTab}
            mountOnEnter={true}
            unmountOnExit={true}
          >
            {this.renderTabs()}
          </ParameterizedTabs>
        )}
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  jaegerInfo: state.jaegerState.info,
  lastRefreshAt: state.globalState.lastRefreshAt
});

const AppDetailsContainer = connect(mapStateToProps)(AppDetails);

export default AppDetailsContainer;
