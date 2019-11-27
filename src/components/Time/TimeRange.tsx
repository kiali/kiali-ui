import * as React from 'react';
import { connect } from 'react-redux';
import { DurationDropdownContainer } from '../DurationDropdown/DurationDropdown';
import RefreshContainer from 'components/Refresh/Refresh';
import { KialiAppState } from 'store/Store';
import { durationSelector, replayOffsetSelector } from 'store/Selectors';
import { DurationInSeconds, TimeOffsetInSeconds, TimeInSeconds } from 'types/Common';
import { Tooltip, TooltipPosition, Button } from '@patternfly/react-core';
import { KialiIcon, defaultIconStyle } from 'config/KialiIcon';
import ToolbarDropdown from 'components/ToolbarDropdown/ToolbarDropdown';
import { UserSettingsActions } from 'actions/UserSettingsActions';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppAction } from 'actions/KialiAppAction';

type ReduxProps = {
  duration: DurationInSeconds;
  replayOffset: TimeInSeconds;

  setReplayOffset: (replayOffset: TimeInSeconds) => void;
};

type TimeRangeProps = ReduxProps & {
  disabled: boolean;
  id: string;

  handleRefresh: () => void;
};

type TimeRangeState = {
  showReplay: boolean;
};

const replayOffsets = {
  0: 'Select a replay start time',
  60: '1 minute ago',
  300: '5 minutes ago',
  600: '10 minutes ago',
  1800: '30 minutes ago',
  3600: '1 hour ago',
  86400: '1 day ago'
};

export class TimeRange extends React.PureComponent<TimeRangeProps, TimeRangeState> {
  constructor(props: TimeRangeProps) {
    super(props);

    this.state = {
      showReplay: false
    };
  }

  render() {
    return (
      <span>
        {this.state.showReplay && (
          <div style={{ marginBottom: '5px' }}>
            <ToolbarDropdown
              id={'time-range-replay'}
              disabled={this.props.disabled}
              handleSelect={key => this.setReplay(Number(key))}
              value={String(this.props.replayOffset)}
              label={replayOffsets[this.props.replayOffset]}
              options={replayOffsets}
              tooltip="Replay traffic starting at selected time"
            />
          </div>
        )}
        <Tooltip key={'time-range-advanced'} position={TooltipPosition.left} content="Replay...">
          <Button variant="link" style={{ paddingLeft: '0px', paddingRight: '6px' }} onClick={this.onToggleReplay}>
            <KialiIcon.Clock className={defaultIconStyle} />
          </Button>
        </Tooltip>
        <DurationDropdownContainer
          id={'time_range_duration'}
          disabled={this.props.disabled}
          tooltip={'Duration for metric queries'}
        />
        <RefreshContainer
          id="time_range_refresh"
          disabled={this.props.disabled}
          hideLabel={true}
          handleRefresh={this.props.handleRefresh}
          manageURL={true}
        />
      </span>
    );
  }

  private onToggleReplay = () => {
    this.setState({ showReplay: !this.state.showReplay });
    this.props.setReplayOffset(0);
  };

  private setReplay = (replayOffset: number) => {
    this.props.setReplayOffset(replayOffset);
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  replayOffset: replayOffsetSelector(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  setReplayOffset: (replayOffset: TimeOffsetInSeconds) => {
    dispatch(UserSettingsActions.setReplayOffset(replayOffset));
  }
});

const TimeRangeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeRange);

export default TimeRangeContainer;
