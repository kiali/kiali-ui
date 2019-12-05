import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import { replayOffsetSelector, refreshIntervalSelector, lastRefreshAtSelector } from 'store/Selectors';
import { Tooltip, ButtonVariant, Button } from '@patternfly/react-core';
import { TimeInSeconds, RefreshIntervalInMs, TimeOffsetInSeconds, TimeInMilliseconds } from 'types/Common';
import ToolbarDropdown from 'components/ToolbarDropdown/ToolbarDropdown';
import { UserSettingsActions } from 'actions/UserSettingsActions';
import { KialiAppAction } from 'actions/KialiAppAction';
import Slider from 'components/IstioWizards/Slider/Slider';
import { KialiIcon } from 'config/KialiIcon';
import { style } from 'typestyle';

type ReduxProps = {
  lastRefreshAt: TimeInMilliseconds;
  refreshInterval: RefreshIntervalInMs;
  replayOffset: TimeOffsetInSeconds;

  setReplayOffset: (replayOffset: TimeInSeconds) => void;
  toggleReplayActive: () => void;
};

type ReplayProps = ReduxProps & {
  disabled: boolean;
  id: string;
};

type ReplayState = {
  replayTime: TimeInSeconds;
  replayFrame: number;
  replayFrameCount: number;
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

const replayStyle = style({
  display: 'flex',
  width: '70%',
  marginBottom: '10px',
  marginTop: '-5px'
});

const sliderStyle = style({
  width: '100%',
  margin: '10px 5px 0 15px'
});

export class Replay extends React.PureComponent<ReplayProps, ReplayState> {
  static getFrameCount = (replayOffset: TimeOffsetInSeconds, refreshInterval: RefreshIntervalInMs) => {
    return refreshInterval > 0 ? Math.floor(replayOffset / (refreshInterval / 1000)) : 0;
  };

  constructor(props: ReplayProps) {
    super(props);
    this.state = {
      replayTime: 0,
      replayFrame: 0,
      replayFrameCount: Replay.getFrameCount(props.replayOffset, props.refreshInterval)
    };
  }

  componentDidUpdate(prevProps: ReplayProps) {
    const intervalChange = prevProps.refreshInterval !== this.props.refreshInterval;
    const frameChange = prevProps.lastRefreshAt !== this.props.lastRefreshAt;

    if (intervalChange) {
      const frameCount = Replay.getFrameCount(this.props.replayOffset, this.props.refreshInterval);
      this.setState({ replayFrame: 0, replayFrameCount: frameCount });
    } else if (frameChange && this.state.replayFrame < this.state.replayFrameCount) {
      this.setState({ replayFrame: this.state.replayFrame + 1 });
    }
  }

  render() {
    const locked = this.state.replayFrameCount < 1;

    return (
      <div className={replayStyle}>
        <ToolbarDropdown
          id={'time-range-replay'}
          disabled={this.props.disabled}
          handleSelect={key => this.setReplay(Number(key))}
          value={String(this.props.replayOffset)}
          label={replayOffsets[this.props.replayOffset]}
          options={replayOffsets}
          tooltip="Replay traffic starting at selected time"
        />
        {!!this.props.replayOffset && (
          <>
            <span className={sliderStyle}>
              <Slider
                id="replay-slider"
                orientation="horizontal"
                min={0}
                max={this.state.replayFrameCount}
                maxLimit={this.state.replayFrameCount}
                step={1}
                value={this.state.replayFrame}
                tooltip={true}
                onSlideStop={this.setFrame}
                input={false}
                locked={locked}
                showLock={false}
              />
            </span>
            <Tooltip key="end_replay" position="top" content="End Replay...">
              <Button variant={ButtonVariant.control} onClick={this.endReplay}>
                <KialiIcon.Close />
              </Button>
            </Tooltip>
          </>
        )}
      </div>
    );
  }

  private setReplay = (replayOffset: TimeOffsetInSeconds) => {
    console.log(`SetReplay`);
    const frameCount = Replay.getFrameCount(replayOffset, this.props.refreshInterval);
    this.setState({ replayTime: Date.now(), replayFrame: 0, replayFrameCount: frameCount });
    this.props.setReplayOffset(replayOffset);
  };

  private endReplay = () => {
    console.log(`EndReplay`);
    this.props.toggleReplayActive();
  };

  private setFrame = (frame: number) => {
    console.log(`SetFrame [${frame}]`);
    this.setState({ replayFrame: frame });
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  lastRefreshAt: lastRefreshAtSelector(state), // re-render on refresh
  refreshInterval: refreshIntervalSelector(state),
  replayOffset: replayOffsetSelector(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  setReplayOffset: bindActionCreators(UserSettingsActions.setReplayOffset, dispatch),
  toggleReplayActive: bindActionCreators(UserSettingsActions.toggleReplayActive, dispatch)
});

const ReplayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Replay);

export default ReplayContainer;
