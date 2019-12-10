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
  disabled: boolean;
  id: string;
};

type ReplayState = {
  isReplaying: boolean;
  refresherRef?: number;
  replayFrame: number;
  replayFrameCount: number;
  replaySpeed: number;
};

const replayIntervals = {
  0: 'Starting...',
  60: '1 minute ago',
  300: '5 minutes ago',
  600: '10 minutes ago',
  1800: '30 minutes ago',
  3600: '1 hour ago'
};

const replaySpeeds = {
  1: 'Very Fast',
  3: 'Fast',
  5: 'Medium',
  10: 'Slow'
};

const replayStyle = style({
  display: 'flex',
  width: '90%',
  marginBottom: '10px',
  marginTop: '-5px'
});

const pauseStyle = style({
  margin: '0 5px 0 10px'
});

const sliderStyle = style({
  width: '100%',
  margin: '0 10px 0 15px'
});

export class Replay extends React.PureComponent<ReplayProps, ReplayState> {
  static getFrameCount = (replayInterval: ReplayIntervalInSeconds): number => {
    return replayInterval > 0 ? Math.floor(replayInterval / 10) : 0;
  };

  static queryTimeToFrame = (props: ReduxProps) => {
    const replayStartTime: TimeInSeconds = props.replayEndTime - props.replayInterval;
    const elapsedTime: ReplayIntervalInSeconds = props.replayQueryTime - replayStartTime;
    const frame: number = Replay.getFrameCount(elapsedTime);
    return frame;
  };

  static frameToQueryTime = (frame: number, props: ReduxProps) => {
    const replayStartTime = props.replayEndTime - props.replayInterval;
    const queryTime: TimeInSeconds = !!replayStartTime ? replayStartTime + frame * 10 : 0;
    return queryTime;
  };

  constructor(props: ReplayProps) {
    super(props);
    this.state = {
      isReplaying: false,
      refresherRef: undefined,
      replayFrame: Replay.queryTimeToFrame(props),
      replayFrameCount: Replay.getFrameCount(props.replayInterval),
      replaySpeed: 5 // medium
    };
  }

  componentWillUnmount() {
    if (this.state.refresherRef) {
      clearInterval(this.state.refresherRef);
    }
  }

  render() {
    const locked = this.state.replayFrameCount < 1;
    const startTime: TimeInSeconds = this.props.replayEndTime - this.props.replayInterval;
    // const ticks: number[] = [0, 5, 10];
    const ticksLabels: string[] = [];
    const formatter: (val: number) => string = val => {
      return 'Current frame: ' + val;
    };
    ticksLabels.push(toString(startTime * 1000));
    ticksLabels.push(toString((this.props.replayEndTime - this.props.replayInterval / 2) * 1000));
    ticksLabels.push(toString(this.props.replayEndTime * 1000));

    return (
      <div className={replayStyle}>
        <ToolbarDropdown
          id={'replay-interval'}
          disabled={this.props.disabled}
          handleSelect={key => this.setReplayInterval(Number(key))}
          value={String(this.props.replayInterval)}
          label={replayIntervals[this.props.replayInterval]}
          options={replayIntervals}
          tooltip="Replay traffic starting at selected time"
          nameDropdown="Replay: "
        />
        <DurationDropdownContainer
          id={'replay-duration'}
          disabled={this.props.disabled}
          tooltip={'Duration for metric queries'}
          prefix="Duration"
        />
        <ToolbarDropdown
          id={'replay-speed'}
          disabled={this.props.disabled}
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
                <Button className={pauseStyle} variant={ButtonVariant.control} onClick={this.pause}>
                  <KialiIcon.Pause />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip key="replay-play" position="top" content="Play...">
                <Button className={pauseStyle} variant={ButtonVariant.control} onClick={this.play}>
                  <KialiIcon.Play />
                </Button>
              </Tooltip>
            )}
            <Tooltip key="end_replay" position="top" content="End Replay...">
              <Button variant={ButtonVariant.control} onClick={this.stop}>
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
                tooltip={true}
                tooltipFormatter={formatter}
                onSlideStop={this.setFrame}
                input={false}
                locked={locked}
                showLock={false}
              />
            </span>
          </>
        )}
      </div>
    );
  }

  private setReplayInterval = (replayInterval: ReplayIntervalInSeconds) => {
    const frameCount = Replay.getFrameCount(replayInterval);
    this.setState({ replayFrame: 0, replayFrameCount: frameCount });
    this.props.setReplayInterval(replayInterval);
  };

  private setReplaySpeed = (replaySpeed: number) => {
    this.setState({ replaySpeed: replaySpeed });
    this.updateRefresher();
  };

  private pause = () => {
    this.setState({ isReplaying: false });
    this.updateRefresher();
  };

  private play = () => {
    this.setState({ isReplaying: true });
    this.updateRefresher();
  };

  private stop = () => {
    this.props.toggleReplayActive();
  };

  private setFrame = (frame: number) => {
    this.setState({ replayFrame: frame });
    this.props.setReplayQueryTime(Replay.frameToQueryTime(frame, this.props));
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
    this.setState({ replayFrame: nextFrame });
    this.props.setReplayQueryTime(Replay.frameToQueryTime(nextFrame, this.props));
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
