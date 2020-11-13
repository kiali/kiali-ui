import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import * as API from '../../services/Api';
import * as AlertUtils from '../../utils/AlertUtils';
import AppDescription from './AppInfo/AppDescription';
import { App } from '../../types/App';
import { RenderComponentScroll } from '../../components/Nav/Page';
import './AppInfo.css';
import { DurationInSeconds } from 'types/Common';
import GraphDataSource from 'services/GraphDataSource';
import { AppHealth } from 'types/Health';

type AppInfoProps = {
  app?: App;
  duration: DurationInSeconds;
  lastRefresh: number;
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
    console.log('TODELETE AppInfo - componentDidMount() ');
    this.fetchBackend();
  }

  componentDidUpdate(prev: AppInfoProps) {
    console.log('TODELETE AppInfo - componentDidUpdate()');
    console.log(
      'TODELETE AppInfo prev.duration [' + prev.duration + '] !== this.props.duration [' + this.props.duration + ']'
    );
    console.log('TODELETE AppInfo prev.app [' + prev.app + '] !== this.props.app [' + this.props.app + ']');
    console.log(
      'TODELETE AppInfo prev.lastRefresh [' +
        prev.lastRefresh +
        '] !== this.props.lastRefresh [' +
        this.props.lastRefresh +
        '] '
    );
    const lastRefreshChanged = prev.lastRefresh !== this.props.lastRefresh;
    if (prev.duration !== this.props.duration || lastRefreshChanged) {
      this.fetchBackend();
    }
  }

  private fetchBackend = () => {
    console.log('TODELETE AppInfo - fetchBackend (1)');
    if (!this.props.app) {
      return;
    }
    console.log('TODELETE AppInfo - fetchBackend (2)');
    this.graphDataSource.fetchForApp(this.props.duration, this.props.app.namespace.name, this.props.app.name);
    const hasSidecar = this.props.app.workloads.some(w => w.istioSidecar);
    API.getAppHealth(this.props.app.namespace.name, this.props.app.name, this.props.duration, hasSidecar)
      .then(health => this.setState({ health: health }))
      .catch(error => AlertUtils.addError('Could not fetch Health.', error));
  };

  render() {
    console.log('TODELETE AppInfo - render() ');
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

export default AppInfo;
