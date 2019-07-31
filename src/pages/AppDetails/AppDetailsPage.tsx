import * as React from 'react';
import * as API from '../../services/Api';
import { RouteComponentProps } from 'react-router-dom';
import { App, AppId } from '../../types/App';
import { Tab, Tabs } from '@patternfly/react-core';
import AppInfo from './AppInfo';
import * as MessageCenter from '../../utils/MessageCenter';
import IstioMetricsContainer from '../../components/Metrics/IstioMetrics';
import { AppHealth } from '../../types/Health';
import { MetricsObjectTypes } from '../../types/Metrics';
import CustomMetricsContainer from '../../components/Metrics/CustomMetrics';
import BreadcrumbView from '../../components/BreadcrumbView/BreadcrumbView';
import { GraphDefinition, GraphType, NodeParamsType, NodeType } from '../../types/Graph';
import { fetchTrafficDetails } from '../../helpers/TrafficDetailsHelper';
import TrafficDetails from '../../components/Metrics/TrafficDetails';
import MetricsDuration from '../../components/MetricsOptions/MetricsDuration';
import PfTitle from '../../components/Pf/PfTitle';
import { DurationInSeconds } from '../../types/Common';
import { KialiAppState } from '../../store/Store';
import { durationSelector } from '../../store/Selectors';
import { connect } from 'react-redux';
import { TabManager } from '../../app/TabManager';

type AppDetailsState = {
  app: App;
  health?: AppHealth;
  trafficData: GraphDefinition | null;
  // currentTab is needed to (un)mount tab components
  // when the tab is not rendered.
  currentTab: string;
};

type ReduxProps = {
  duration: DurationInSeconds;
};

type AppDetailsProps = RouteComponentProps<AppId> & ReduxProps;

const tabName = 'tab';
const defaultTab = 'info';
const trafficTabName = 'traffic';

const emptyApp = {
  namespace: { name: '' },
  name: '',
  workloads: [],
  serviceNames: [],
  runtimes: []
};

const paramToTab: { [key: string]: number } = {
  info: 0,
  traffic: 1,
  in_metrics: 2,
  out_metrics: 3
};

const tabToParam: { [index: number]: string } = Object.keys(paramToTab).reduce(
  (result: { [i: number]: string }, name: string) => {
    result[paramToTab[name]] = name;
    return result;
  },
  {}
);

class AppDetails extends React.Component<AppDetailsProps, AppDetailsState> {
  tabManager: TabManager;

  constructor(props: AppDetailsProps) {
    super(props);
    this.tabManager = new TabManager(tabName, defaultTab, trafficTabName, this.fetchTrafficData);
    this.state = {
      currentTab: this.tabManager.activeTab(),
      app: emptyApp,
      trafficData: null
    };
  }

  componentDidMount(): void {
    this.doRefresh();
  }

  componentDidUpdate(prevProps: AppDetailsProps) {
    if (
      this.props.match.params.namespace !== prevProps.match.params.namespace ||
      this.props.match.params.app !== prevProps.match.params.app ||
      this.props.duration !== prevProps.duration
    ) {
      this.setState(
        {
          app: emptyApp,
          health: undefined
        },
        () => this.doRefresh()
      );
    }
  }

  hasTrafficData = (): boolean => {
    return this.state.trafficData != null;
  };

  doRefresh = () => {
    const currentTab = this.tabManager.activeTab();

    if (this.state.app === emptyApp || this.tabManager.isDefaultTab(currentTab)) {
      this.setState({ trafficData: null });
      this.fetchApp();
    }

    if (this.tabManager.isTrafficTab(currentTab)) {
      this.fetchTrafficData();
    }
  };

  fetchApp = () => {
    API.getApp(this.props.match.params.namespace, this.props.match.params.app)
      .then(details => {
        this.setState({ app: details.data });
        const hasSidecar = details.data.workloads.some(w => w.istioSidecar);
        return API.getAppHealth(
          this.props.match.params.namespace,
          this.props.match.params.app,
          this.props.duration,
          hasSidecar
        );
      })
      .then(health => this.setState({ health: health }))
      .catch(error => {
        MessageCenter.addError('Could not fetch App Details.', error);
      });
  };

  fetchTrafficData = () => {
    const node: NodeParamsType = {
      app: this.props.match.params.app,
      namespace: { name: this.props.match.params.namespace },
      nodeType: NodeType.APP,

      // unneeded
      workload: '',
      service: '',
      version: ''
    };
    const restParams = {
      duration: `${MetricsDuration.initialDuration()}s`,
      graphType: GraphType.APP,
      injectServiceNodes: true,
      appenders: 'deadNode'
    };

    fetchTrafficDetails(node, restParams).then(trafficData => {
      if (trafficData !== undefined) {
        this.setState({ trafficData: trafficData });
      }
    });
  };

  istioSidecar() {
    let istioSidecar = true; // assume true until proven otherwise
    this.state.app.workloads.forEach(wkd => {
      istioSidecar = istioSidecar && wkd.istioSidecar;
    });
    return istioSidecar;
  }

  runtimeTabs() {
    const tabs: JSX.Element[] = [];
    this.state.app.runtimes.forEach(runtime => {
      runtime.dashboardRefs.forEach((dashboard, i) => {
        const tab = (
          <Tab title={dashboard.template} key={dashboard.template} eventKey={i + 4}>
            <CustomMetricsContainer
              namespace={this.props.match.params.namespace}
              app={this.props.match.params.app}
              template={dashboard.template}
            />
          </Tab>
        );
        tabs.push(tab);
      });
    });

    return tabs;
  }

  staticTabs() {
    const overTab = (
      <Tab title="Overview" eventKey={0}>
        {this.state.currentTab === 'info' ? (
          <AppInfo
            app={this.state.app}
            namespace={this.props.match.params.namespace}
            onRefresh={this.doRefresh}
            health={this.state.health}
          />
        ) : (
          undefined
        )}
      </Tab>
    );

    const trafficTab = (
      <Tab title="Traffic" eventKey={1}>
        {this.state.currentTab === 'traffic' ? (
          <TrafficDetails
            trafficData={this.state.trafficData}
            itemType={MetricsObjectTypes.APP}
            namespace={this.state.app.namespace.name}
            appName={this.state.app.name}
            onDurationChanged={this.tabManager.handleTrafficDurationChange()}
            onRefresh={this.doRefresh}
          />
        ) : (
          undefined
        )}
      </Tab>
    );

    const inTab = (
      <Tab title="Inbound metrics" eventKey={2}>
        {this.state.currentTab === 'in_metrics' ? (
          <IstioMetricsContainer
            namespace={this.props.match.params.namespace}
            object={this.props.match.params.app}
            objectType={MetricsObjectTypes.APP}
            direction={'inbound'}
          />
        ) : (
          undefined
        )}
      </Tab>
    );

    const outTab = (
      <Tab title="Outbound metrics" eventKey={3}>
        {this.state.currentTab === 'out_metrics' ? (
          <IstioMetricsContainer
            namespace={this.props.match.params.namespace}
            object={this.props.match.params.app}
            objectType={MetricsObjectTypes.APP}
            direction={'outbound'}
          />
        ) : (
          undefined
        )}
      </Tab>
    );

    return [overTab, trafficTab, inTab, outTab];
  }

  renderTabs() {
    // PF4 Tabs doesn't support static tabs followed of an array of tabs created dynamically.
    return this.staticTabs().concat(this.runtimeTabs());
  }

  render() {
    const istioSidecar = this.istioSidecar();

    return (
      <>
        <BreadcrumbView location={this.props.location} />
        <PfTitle location={this.props.location} istio={istioSidecar} />
        <Tabs
          id="basic-tabs"
          activeKey={paramToTab[this.tabManager.activeTab()]}
          onSelect={(_, ek) => {
            const currentTabName = tabToParam[ek];
            this.setState({
              currentTab: currentTabName
            });
            this.tabManager.tabSelectHandler(this.tabManager.tabChangeHandler)(currentTabName, this.hasTrafficData());
          }}
        >
          {this.renderTabs()}
        </Tabs>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state)
});

const AppDetailsContainer = connect(mapStateToProps)(AppDetails);

export default AppDetailsContainer;
