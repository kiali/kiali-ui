import ToolbarDropdown from '../ToolbarDropdown/ToolbarDropdown';
import { Durations, serverConfig } from '../../config/ServerConfig';
import * as React from 'react';
import { DurationInSeconds } from '../../types/Common';
import { KialiAppState } from '../../store/Store';
import { durationSelector } from '../../store/Selectors';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppAction } from '../../actions/KialiAppAction';
import { bindActionCreators } from 'redux';
import { UserSettingsActions } from '../../actions/UserSettingsActions';
import { connect } from 'react-redux';
import { HistoryManager, URLParam } from '../../app/History';
import history from '../../app/History';
import _ from 'lodash';

type ReduxProps = {
  duration: DurationInSeconds;
  setDuration: (duration: DurationInSeconds) => void;
};

type BasicDurationDropdownProps = ReduxProps & {
  id: string;
  disabled?: boolean;
  prefix?: string;
  tooltip?: string;
  nameDropdown?: string;
};

// These are taken from the serverConfig
type DurationDropdownProps = BasicDurationDropdownProps & {
  durations: Durations;
};

export class DurationDropdown extends React.Component<DurationDropdownProps> {
  static defaultPrefix = 'Last';
  private prefixedDurations: Durations;

  constructor(props) {
    super(props);
    const prefix = !!this.props.prefix ? this.props.prefix : DurationDropdown.defaultPrefix;
    this.prefixedDurations = _.mapValues(this.props.durations, val => `${prefix} ${val}`);
  }

  render() {
    return (
      <ToolbarDropdown
        id={this.props.id}
        disabled={this.props.disabled}
        handleSelect={key => this.props.setDuration(Number(key))}
        value={String(this.props.duration)}
        label={this.prefixedDurations[this.props.duration]}
        options={this.prefixedDurations}
        tooltip={this.props.tooltip}
        nameDropdown={this.props.nameDropdown}
      />
    );
  }
}

export const withDurations = DurationDropdownComponent => {
  return (props: BasicDurationDropdownProps) => {
    return <DurationDropdownComponent durations={serverConfig.durations} {...props} />;
  };
};

export const withURLAwareness = DurationDropdownComponent => {
  return class extends React.Component<BasicDurationDropdownProps> {
    constructor(props: BasicDurationDropdownProps) {
      super(props);
      const urlParams = new URLSearchParams(history.location.search);
      const urlDuration = HistoryManager.getDuration(urlParams);
      if (urlDuration !== undefined && urlDuration !== props.duration) {
        props.setDuration(urlDuration);
      }
      HistoryManager.setParam(URLParam.DURATION, String(this.props.duration));
    }

    componentDidUpdate() {
      HistoryManager.setParam(URLParam.DURATION, String(this.props.duration));
    }

    render() {
      return <DurationDropdownComponent {...this.props} />;
    }
  };
};

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    setDuration: bindActionCreators(UserSettingsActions.setDuration, dispatch)
  };
};

export const DurationDropdownContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(withURLAwareness(withDurations(DurationDropdown)));
