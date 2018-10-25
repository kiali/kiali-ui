import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { GraphFilterActions } from '../actions/GraphFilterActions';
import { KialiAppState } from '../store/Store';
import GraphRefresh from '../components/GraphFilter/GraphRefresh';
import { config } from '../config';
import { UserSettingsActions } from '../actions/UserSettingsActions';
import { refreshIntervalSelector } from '../store/Selectors';

const mapStateToProps = (state: KialiAppState) => ({
  selected: refreshIntervalSelector(state),
  pollInterval: refreshIntervalSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {
    onSelect: bindActionCreators(UserSettingsActions.setRefreshInterval, dispatch),
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
