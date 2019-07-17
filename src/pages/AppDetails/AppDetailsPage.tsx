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

type AppDetailsState = {
  app: App;
  health?: AppHealth;
  trafficData: GraphDefinition | null;
};

type ReduxProps = {
  duration: DurationInSeconds;
};

type AppDetailsProps = RouteComponentProps<AppId> & ReduxProps;

const emptyApp = {
  namespace: { name: '' },
  name: '',
  workloads: [],
  serviceNames: [],
  runtimes: []
};

// TODO: change to sync with @lponce proposal
const paramToTab: { [key: string]: number } = {
  info: 0,
  traffic: 1,
  in_metrics: 2,
  out_metrics: 3
};

const tabToParam: { [key: number]: string } = {
  0: 'info',
  1: 'traffic',
  2: 'in_metrics',
  3: 'out_metrics'
};

class AppDetails extends React.Component<AppDetailsProps, AppDetailsState> {
  constructor(props: AppDetailsProps) {
    super(props);
    this.state = {
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

  doRefresh = () => {
    const currentTab = this.activeTab('tab', 'info');

    if (this.state.app === emptyApp || currentTab === 'info') {
      this.setState({ trafficData: null });
      this.fetchApp();
    }

    if (currentTab === 'traffic') {
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
        <AppInfo
          app={this.state.app}
          namespace={this.props.match.params.namespace}
          onRefresh={this.doRefresh}
          activeTab={this.activeTab}
          onSelectTab={this.tabSelectHandler}
          health={this.state.health}
        />
      </Tab>
    );

    const trafficTab = (
      <Tab title="Traffic" eventKey={1}>
        <TrafficDetails
          trafficData={this.state.trafficData}
          itemType={MetricsObjectTypes.APP}
          namespace={this.state.app.namespace.name}
          appName={this.state.app.name}
          onDurationChanged={this.handleTrafficDurationChange}
          onRefresh={this.doRefresh}
        />
      </Tab>
    );

    const inTab = (
      <Tab title="Inbound metrics" eventKey={2}>
        <IstioMetricsContainer
          namespace={this.props.match.params.namespace}
          object={this.props.match.params.app}
          objectType={MetricsObjectTypes.APP}
          direction={'inbound'}
        />
      </Tab>
    );

    const outTab = (
      <Tab title="Outbound metrics" eventKey={3}>
        <IstioMetricsContainer
          namespace={this.props.match.params.namespace}
          object={this.props.match.params.app}
          objectType={MetricsObjectTypes.APP}
          direction={'outbound'}
        />
      </Tab>
    );

    return [overTab, trafficTab, inTab, outTab];
  }

  renderTabs() {
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
          isFilled={true}
          activeKey={paramToTab[this.activeTab('tab', 'info')]}
          onSelect={(_, ek) => {
            console.log(ek);
            const tabName = tabToParam[ek];
            this.tabSelectHandler('tab', this.tabChangeHandler)(tabName);
          }}
        >
          {this.renderTabs()}
        </Tabs>
      </>
    );
  }

  private activeTab = (tabName: string, whenEmpty: string) => {
    return new URLSearchParams(this.props.location.search).get(tabName) || whenEmpty;
  };

  private handleTrafficDurationChange = () => {
    this.fetchTrafficData();
  };

  private tabChangeHandler = (tabName: string) => {
    if (tabName === 'traffic' && this.state.trafficData === null) {
      this.fetchTrafficData();
    }
  };

  private tabSelectHandler = (tabName: string, postHandler?: (tabName: string) => void) => {
    return (tabKey?: string) => {
      if (!tabKey) {
        return;
      }

      const urlParams = new URLSearchParams('');
      urlParams.set(tabName, tabKey);

      this.props.history.push(this.props.location.pathname + '?' + urlParams.toString());

      if (postHandler) {
        postHandler(tabKey);
      }
    };
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state)
});

const AppDetailsContainer = connect(mapStateToProps)(AppDetails);

export default AppDetailsContainer;
