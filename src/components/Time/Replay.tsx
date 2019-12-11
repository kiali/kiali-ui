import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import { replayIntervalSelector, replayEndTimeSelector, replayQueryTimeSelector } from 'store/Selectors';
import { Tooltip, ButtonVariant, Button } from '@patternfly/react-core';
import { TimeInSeconds, ReplayIntervalInSeconds } from 'types/Common';
import ToolbarDropdown from 'components/ToolbarDropdown/ToolbarDropdown';
import { UserSettingsActions } from 'actions/UserSettingsActions';
import { KialiAppAction } from 'actions/KialiAppAction';
import Slider from 'components/IstioWizards/Slider/Slider';
import { KialiIcon } from 'config/KialiIcon';
import { style } from 'typestyle';
import { toString } from './LocalTime';
import { DurationDropdownContainer } from 'components/DurationDropdown/DurationDropdown';

type ReduxProps = {
  replayEndTime: TimeInSeconds;
  replayInterval: ReplayIntervalInSeconds;
  replayQueryTime: TimeInSeconds;

  setReplayInterval: (replayInterval: ReplayIntervalInSeconds) => void;
  setReplayQueryTime: (replayQueryTime: TimeInSeconds) => void;
  toggleReplayActive: () => void;
};

type ReplayProps = ReduxProps & {
  id: string;
};

type ReplayState = {
  isReplaying: boolean;
  refresherRef?: number;
  replayFrame: number;
  replayFrameCount: number;
  replaySpeed: number;
};

// key represents replay interval in seconds
const replayIntervals = {
  0: 'Start...',
  60: '1 minute ago',
  300: '5 minutes ago',
  600: '10 minutes ago',
  1800: '30 minutes ago',
  3600: '1 hour ago'
};

// key represents refresh interval in seconds
const replaySpeeds = {
  1: 'Very Fast',
  3: 'Fast',
  5: 'Medium',
  10: 'Slow'
};

// number of seconds clock advances per frame
const frameInterval = 10;

const replayStyle = style({
  display: 'flex',
  width: '90%',
  marginBottom: '10px',
  marginTop: '-5px'
});

const pauseStyle = style({
  margin: '0 5px 0 10px',
  height: '37px'
});

const stopStyle = style({
  height: '37px'
});

const sliderStyle = style({
  width: '100%',
  margin: '0 10px 0 15px'
});

export class Replay extends React.PureComponent<ReplayProps, ReplayState> {
  static getFrameCount = (replayInterval: ReplayIntervalInSeconds): number => {
    return replayInterval > 0 ? Math.floor(replayInterval / frameInterval) : 0;
  };

  static queryTimeToFrame = (props: ReduxProps): number => {
    const replayStartTime: TimeInSeconds = props.replayEndTime - props.replayInterval;
    const elapsedTime: ReplayIntervalInSeconds = props.replayQueryTime - replayStartTime;
    const frame: number = Replay.getFrameCount(elapsedTime);
    return frame;
  };

  static frameToQueryTime = (frame: number, props: ReduxProps): TimeInSeconds => {
    const replayStartTime = props.replayEndTime - props.replayInterval;
    const queryTime: TimeInSeconds = !!replayStartTime ? replayStartTime + frame * frameInterval : 0;
    return queryTime;
  };

  constructor(props: ReplayProps) {
    super(props);
    this.state = {
      isReplaying: false,
      refresherRef: undefined,
      replayFrame: Replay.queryTimeToFrame(props),
      replayFrameCount: Replay.getFrameCount(props.replayInterval),
      replaySpeed: 3 // Fast
    };
  }

  componentDidUpdate(_: ReplayProps, prevState: ReplayState) {
    let refreshChange = this.state.isReplaying !== prevState.isReplaying;
    refreshChange = refreshChange || this.state.replaySpeed !== prevState.replaySpeed;

    if (refreshChange) {
      this.updateRefresher();
    }
  }

  componentWillUnmount() {
    if (this.state.refresherRef) {
      clearInterval(this.state.refresherRef);
    }
  }

  render() {
    const startTime: TimeInSeconds = this.props.replayEndTime - this.props.replayInterval;
    const ticks: number[] = [0, Math.floor(this.state.replayFrameCount / 2), this.state.replayFrameCount];
    const ticksLabels: string[] = [];
    ticksLabels.push(toString(startTime * 1000, { second: '2-digit' }));
    ticksLabels.push(
      toString((this.props.replayEndTime - this.props.replayInterval / 2) * 1000, {
        month: undefined,
        day: undefined,
        second: '2-digit'
      })
    );
    ticksLabels.push(
      toString(this.props.replayEndTime * 1000, { month: undefined, day: undefined, second: '2-digit' })
    );

    return (
      <div className={replayStyle}>
        <ToolbarDropdown
          id={'replay-interval'}
          handleSelect={key => this.setReplayInterval(Number(key))}
          value={String(this.props.replayInterval)}
          label={replayIntervals[this.props.replayInterval]}
          options={replayIntervals}
          tooltip="Replay traffic starting at selected time"
          nameDropdown="Replay: "
        />
        <DurationDropdownContainer id={'replay-duration'} tooltip={'Duration for metric queries'} prefix="Duration" />
        <ToolbarDropdown
          id={'replay-speed'}
          handleSelect={key => this.setReplaySpeed(Number(key))}
          value={String(this.state.replaySpeed)}
          label={replaySpeeds[this.state.replaySpeed]}
          options={replaySpeeds}
          tooltip="Replay speed"
        />
        {!!this.props.replayInterval && (
          <>
            {this.state.isReplaying ? (
              <Tooltip key="replay-pause" position="top" content="Pause...">
                <Button className={pauseStyle} variant={ButtonVariant.link} onClick={this.pause}>
                  <KialiIcon.Pause />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip key="replay-play" position="top" content="Play...">
                <Button className={pauseStyle} variant={ButtonVariant.link} onClick={this.play}>
                  <KialiIcon.Play />
                </Button>
              </Tooltip>
            )}
            <Tooltip key="end_replay" position="top" content="End Replay...">
              <Button className={stopStyle} variant={ButtonVariant.link} onClick={this.stop}>
                <KialiIcon.Stop />
              </Button>
            </Tooltip>
            <span className={sliderStyle}>
              <Slider
                id="replay-slider"
                orientation="horizontal"
                min={0}
                max={this.state.replayFrameCount}
                maxLimit={this.state.replayFrameCount}
                step={1}
                value={this.state.replayFrame}
                ticks={ticks}
                ticks_labels={ticksLabels}
                tooltip={true}
                tooltipFormatter={this.formatTooltip}
                onSlideStop={this.setFrame}
                input={false}
                locked={false}
                showLock={false}
              />
            </span>
          </>
        )}
      </div>
    );
  }

  formatTooltip = (val: number): string => {
    const time: string = toString(Replay.frameToQueryTime(val, this.props) * 1000, { second: '2-digit' });
    return `Frame ${val}/${this.state.replayFrameCount}: ${time}`;
  };

  private setReplayInterval = (replayInterval: ReplayIntervalInSeconds) => {
    const frameCount = Replay.getFrameCount(replayInterval);
    this.setState({ replayFrame: 0, replayFrameCount: frameCount });
    this.props.setReplayInterval(replayInterval);
  };

  private setReplaySpeed = (replaySpeed: number) => {
    this.setState({ replaySpeed: replaySpeed });
  };

  private pause = () => {
    this.setState({ isReplaying: false });
  };

  private play = () => {
    this.setState({ isReplaying: true });
    const frameTime = Replay.frameToQueryTime(this.state.replayFrame, this.props);
    if (frameTime !== this.props.replayQueryTime) {
      this.props.setReplayQueryTime(frameTime);
    }
  };

  private stop = () => {
    this.props.toggleReplayActive();
  };

  private setFrame = (frame: number) => {
    if (frame !== this.state.replayFrame) {
      this.setState({ replayFrame: frame });
      this.props.setReplayQueryTime(Replay.frameToQueryTime(frame, this.props));
    }
  };

  private updateRefresher = () => {
    if (this.state.refresherRef) {
      clearInterval(this.state.refresherRef);
    }
    if (!this.state.isReplaying || !!!this.props.replayInterval) {
      return;
    }

    let refresherRef: number | undefined = undefined;
    refresherRef = window.setInterval(this.handleRefresh, this.state.replaySpeed * 1000);
    this.setState({ refresherRef: refresherRef });
  };

  private handleRefresh = () => {
    const nextFrame = this.state.replayFrame + 1;
    if (nextFrame > this.state.replayFrameCount) {
      this.pause();
    } else {
      this.setState({ replayFrame: nextFrame });
      this.props.setReplayQueryTime(Replay.frameToQueryTime(nextFrame, this.props));
    }
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  replayEndTime: replayEndTimeSelector(state),
  replayInterval: replayIntervalSelector(state),
  replayQueryTime: replayQueryTimeSelector(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  setReplayInterval: bindActionCreators(UserSettingsActions.setReplayInterval, dispatch),
  setReplayQueryTime: bindActionCreators(UserSettingsActions.setReplayQueryTime, dispatch),
  toggleReplayActive: bindActionCreators(UserSettingsActions.toggleReplayActive, dispatch)
});

const ReplayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Replay);

export default ReplayContainer;
