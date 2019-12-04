import * as React from 'react';
import { connect } from 'react-redux';
import { KialiAppState } from 'store/Store';
import { replayOffsetSelector } from 'store/Selectors';
import { TimeOffsetInSeconds, TimeInSeconds } from 'types/Common';
import ToolbarDropdown from 'components/ToolbarDropdown/ToolbarDropdown';
import { UserSettingsActions } from 'actions/UserSettingsActions';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppAction } from 'actions/KialiAppAction';

type ReduxProps = {
  replayOffset: TimeInSeconds;

  setReplayOffset: (replayOffset: TimeInSeconds) => void;
};

type ReplayProps = ReduxProps & {
  disabled: boolean;
  id: string;
};

const replayOffsets = {
  0: 'Replay starting...',
  60: '1 minute ago',
  300: '5 minutes ago',
  600: '10 minutes ago',
  1800: '30 minutes ago',
  3600: '1 hour ago',
  86400: '1 day ago'
};

export class Replay extends React.PureComponent<ReplayProps> {
  render() {
    return (
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
    );
  }

  private setReplay = (replayOffset: number) => {
    this.props.setReplayOffset(replayOffset);
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  replayOffset: replayOffsetSelector(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  setReplayOffset: (replayOffset: TimeOffsetInSeconds) => {
    dispatch(UserSettingsActions.setReplayOffset(replayOffset));
  }
});

const ReplayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Replay);

export default ReplayContainer;
