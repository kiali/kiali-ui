import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { KialiAppState } from '../store/Store';
import GraphRefresh from '../components/GraphFilter/GraphRefresh';
import { config } from '../config';
import { UserSettingsActions } from '../actions/UserSettingsActions';

const mapStateToProps = (state: KialiAppState) => ({
  selected: state.userSettings.refreshInterval
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSelect: bindActionCreators(UserSettingsActions.setRefreshInterval, dispatch)
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
