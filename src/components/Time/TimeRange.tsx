import * as React from 'react';
import { connect } from 'react-redux';
import { DurationDropdownContainer } from '../DurationDropdown/DurationDropdown';
import RefreshContainer from 'components/Refresh/Refresh';
import { KialiAppState } from 'store/Store';
import { durationSelector, replayActiveSelector } from 'store/Selectors';
import { DurationInSeconds } from 'types/Common';
import { Tooltip, TooltipPosition, Button } from '@patternfly/react-core';
import { KialiIcon, defaultIconStyle } from 'config/KialiIcon';
import { UserSettingsActions } from 'actions/UserSettingsActions';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppAction } from 'actions/KialiAppAction';
import { bindActionCreators } from 'redux';

type ReduxProps = {
  duration: DurationInSeconds;
  replayActive: boolean;

  toggleReplayActive: () => void;
};

type TimeRangeProps = ReduxProps & {
  disabled: boolean;
  id: string;

  handleRefresh: () => void;
};

export class TimeRange extends React.PureComponent<TimeRangeProps> {
  render() {
    return (
      <span>
        {!this.props.replayActive && (
          <>
            <Tooltip key={'time-range-advanced'} position={TooltipPosition.left} content="Toggle Replay...">
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
          </>
        )}
      </span>
    );
  }

  private onToggleReplay = () => {
    this.props.toggleReplayActive();
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  replayActive: replayActiveSelector(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  toggleReplayActive: bindActionCreators(UserSettingsActions.toggleReplayActive, dispatch)
});

const TimeRangeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeRange);

export default TimeRangeContainer;
