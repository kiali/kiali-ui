import * as React from 'react';
import * as API from '../../services/Api';
import { RouteComponentProps } from 'react-router-dom';
import { AppId, App } from '../../types/App';
import { authentication } from '../../utils/Authentication';
import { TabContainer, Nav, NavItem, TabContent, TabPane } from 'patternfly-react';
import AppInfo from './AppInfo';
import * as MessageCenter from '../../utils/MessageCenter';
import AppMetricsContainer from '../../containers/AppMetricsContainer';
import { AppHealth } from '../../types/Health';
import { MetricsObjectTypes } from '../../types/Metrics';
import CustomMetricsContainer from '../../components/Metrics/CustomMetrics';
import BreadcrumbView from '../../components/BreadcrumbView/BreadcrumbView';

type AppDetailsState = {
  app: App;
  health?: AppHealth;
};

class AppDetails extends React.Component<RouteComponentProps<AppId>, AppDetailsState> {
  constructor(props: RouteComponentProps<AppId>) {
    super(props);
    this.state = {
      app: {
        namespace: { name: '' },
        name: '',
        workloads: [],
        serviceNames: [],
        runtimes: []
      }
    };
    this.fetchApp();
  }

  fetchApp = () => {
    const promiseDetails = API.getApp(authentication(), this.props.match.params.namespace, this.props.match.params.app);

    const promiseHealth = API.getAppHealth(
      authentication(),
      this.props.match.params.namespace,
      this.props.match.params.app,
      600
    );

    Promise.all([promiseDetails, promiseHealth])
      .then(([resultDetails, resultHealth]) => {
        this.setState({
          app: resultDetails.data,
          health: resultHealth
        });
      })
      .catch(error => {
        MessageCenter.add(API.getErrorMsg('Could not fetch App Details', error));
      });
  };

  render() {
    return (
      <>
        <BreadcrumbView location={this.props.location} />
        <TabContainer id="basic-tabs" activeKey={this.activeTab('tab', 'info')} onSelect={this.tabSelectHandler('tab')}>
          <div>
            <Nav bsClass="nav nav-tabs nav-tabs-pf">
              <NavItem eventKey="info">
                <div>Info</div>
              </NavItem>
              <NavItem eventKey="in_metrics">
                <div>Inbound Metrics</div>
              </NavItem>
              <NavItem eventKey="out_metrics">
                <div>Outbound Metrics</div>
              </NavItem>
              {this.state.app.runtimes.map(runtime => {
                return runtime.dashboardRefs.map(dashboard => {
                  return (
                    <NavItem key={dashboard.template} eventKey={dashboard.template}>
                      <div>{dashboard.title}</div>
                    </NavItem>
                  );
                });
              })}
            </Nav>
            <TabContent>
              <TabPane eventKey="info">
                <AppInfo
                  app={this.state.app}
                  namespace={this.props.match.params.namespace}
                  onRefresh={this.fetchApp}
                  activeTab={this.activeTab}
                  onSelectTab={this.tabSelectHandler}
                  health={this.state.health}
                />
              </TabPane>
              <TabPane eventKey="in_metrics" mountOnEnter={true} unmountOnExit={true}>
                <AppMetricsContainer
                  namespace={this.props.match.params.namespace}
                  object={this.props.match.params.app}
                  objectType={MetricsObjectTypes.APP}
                  direction={'inbound'}
                />
              </TabPane>
              <TabPane eventKey="out_metrics" mountOnEnter={true} unmountOnExit={true}>
                <AppMetricsContainer
                  namespace={this.props.match.params.namespace}
                  object={this.props.match.params.app}
                  objectType={MetricsObjectTypes.APP}
                  direction={'outbound'}
                />
              </TabPane>
              {this.state.app.runtimes.map(runtime => {
                return runtime.dashboardRefs.map(dashboard => {
                  return (
                    <TabPane
                      key={dashboard.template}
                      eventKey={dashboard.template}
                      mountOnEnter={true}
                      unmountOnExit={true}
                    >
                      <CustomMetricsContainer
                        namespace={this.props.match.params.namespace}
                        app={this.props.match.params.app}
                        template={dashboard.template}
                      />
                    </TabPane>
                  );
                });
              })}
            </TabContent>
          </div>
        </TabContainer>
      </>
    );
  }

  private activeTab = (tabName: string, whenEmpty: string) => {
    return new URLSearchParams(this.props.location.search).get(tabName) || whenEmpty;
  };

  private tabSelectHandler = (tabName: string) => {
    return (tabKey?: string) => {
      if (!tabKey) {
        return;
      }

      const urlParams = new URLSearchParams('');
      urlParams.set(tabName, tabKey);

      this.props.history.push(this.props.location.pathname + '?' + urlParams.toString());
    };
  };
}

export default AppDetails;
