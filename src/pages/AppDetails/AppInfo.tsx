import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import * as API from '../../services/Api';
import * as AlertUtils from '../../utils/AlertUtils';
import AppDescription from './AppDescription';
import { App } from '../../types/App';
import { RenderComponentScroll } from '../../components/Nav/Page';
import { DurationInSeconds, TimeInMilliseconds } from 'types/Common';
import GraphDataSource from 'services/GraphDataSource';
import { AppHealth } from 'types/Health';
import { KialiAppState } from '../../store/Store';
import { connect } from 'react-redux';
import { durationSelector, meshWideMTLSEnabledSelector } from '../../store/Selectors';
import { style } from 'typestyle';
import MiniGraphCard from '../../components/CytoscapeGraph/MiniGraphCard';
import HealthCard from '../../components/Health/HealthCard';

type AppInfoProps = {
  app?: App;
  duration: DurationInSeconds;
  lastRefreshAt: TimeInMilliseconds;
  mtlsEnabled: boolean;
};

type AppInfoState = {
  health?: AppHealth;
  tabHeight?: number;
};

const fullHeightStyle = style({
  height: '100%'
});

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
    // RenderComponentScroll handles height to provide an inner scroll combined with tabs
    // This height needs to be propagated to minigraph to proper resize in height
    // Graph resizes correctly on width
    const height = this.state.tabHeight ? this.state.tabHeight - 115 : 300;
    const graphContainerStyle = style({ width: '100%', height: height });
    return (
      <RenderComponentScroll onResize={height => this.setState({ tabHeight: height })}>
        <Grid gutter={'md'} className={fullHeightStyle}>
          <GridItem span={3}>
            <AppDescription app={this.props.app} />
          </GridItem>
          <GridItem span={3}>
            {this.props.app ? <HealthCard name={this.props.app.name} health={this.state.health} /> : 'Loading'}
          </GridItem>
          <GridItem span={6}>
            <MiniGraphCard
              title={'Graph'}
              dataSource={this.graphDataSource}
              mtlsEnabled={this.props.mtlsEnabled}
              graphContainerStyle={graphContainerStyle}
            />
          </GridItem>
        </Grid>
      </RenderComponentScroll>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  lastRefreshAt: state.globalState.lastRefreshAt,
  mtlsEnabled: meshWideMTLSEnabledSelector(state)
});

const AppInfoContainer = connect(mapStateToProps)(AppInfo);
export default AppInfoContainer;
