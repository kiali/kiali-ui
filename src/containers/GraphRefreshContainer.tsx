import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { GraphFilterActions } from '../actions/GraphFilterActions';
import { KialiAppState } from '../store/Store';
import GraphRefresh from '../components/GraphFilter/GraphRefresh';
import { config } from '../config';
import { UserSettingsActions } from '../actions/UserSettingsActions';

const mapStateToProps = (state: KialiAppState) => ({
  selected: state.userSettings.refreshInterval,
  pollInterval: state.userSettings.refreshInterval
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSelect: bindActionCreators(UserSettingsActions.setRefreshInterval, dispatch),
    // TODO: We still need to reduxify namespace and duration to be able to use this
    // onUpdatePollInterval: bindActionCreators(GraphDataActions.fetchGraphData, dispatch),
    onUpdatePollInterval: bindActionCreators(GraphFilterActions.setRefreshRate, dispatch)
  };
};

const pollIntervalDefaults = config().toolbar.pollInterval;

const GraphRefreshWithDefaultOptions = props => {
  return <GraphRefresh options={pollIntervalDefaults} {...props} />;
};

const GraphRefreshContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphRefreshWithDefaultOptions);
export default GraphRefreshContainer;
