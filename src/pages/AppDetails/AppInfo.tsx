import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import * as API from '../../services/Api';
import * as AlertUtils from '../../utils/AlertUtils';
import AppDescription from './AppInfo/AppDescription';
import { App } from '../../types/App';
import { RenderComponentScroll } from '../../components/Nav/Page';
import './AppInfo.css';
import { DurationInSeconds, TimeInMilliseconds } from 'types/Common';
import GraphDataSource from 'services/GraphDataSource';
import { AppHealth } from 'types/Health';
import { KialiAppState } from '../../store/Store';
import { connect } from 'react-redux';

type AppInfoProps = {
  app?: App;
  duration: DurationInSeconds;
  lastRefreshAt: TimeInMilliseconds;
};

type AppInfoState = {
  health?: AppHealth;
};

class AppInfo extends React.Component<AppInfoProps, AppInfoState> {
  private graphDataSource = new GraphDataSource();

  constructor(props: AppInfoProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.fetchBackend();
  }

  componentDidUpdate(prev: AppInfoProps) {
    if (this.props.duration !== prev.duration || this.props.lastRefreshAt !== prev.lastRefreshAt) {
      this.fetchBackend();
    }
  }

  private fetchBackend = () => {
    if (!this.props.app) {
      return;
    }
    this.graphDataSource.fetchForApp(this.props.duration, this.props.app.namespace.name, this.props.app.name);
    const hasSidecar = this.props.app.workloads.some(w => w.istioSidecar);
    API.getAppHealth(this.props.app.namespace.name, this.props.app.name, this.props.duration, hasSidecar)
      .then(health => this.setState({ health: health }))
      .catch(error => AlertUtils.addError('Could not fetch Health.', error));
  };

  render() {
    return (
      <>
        <RenderComponentScroll>
          <Grid style={{ margin: '10px' }} gutter={'md'}>
            <GridItem span={12}>
              <AppDescription
                app={this.props.app}
                miniGraphDataSource={this.graphDataSource}
                health={this.state.health}
              />
            </GridItem>
          </Grid>
        </RenderComponentScroll>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  lastRefreshAt: state.globalState.lastRefreshAt
});

const AppInfoContainer = connect(mapStateToProps)(AppInfo);
export default AppInfoContainer;
