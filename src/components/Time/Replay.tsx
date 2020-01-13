import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import DatePicker from 'react-datepicker';
import { replayWindowSelector, replayQueryTimeSelector, durationSelector } from 'store/Selectors';
import { Tooltip, ButtonVariant, Button, Text } from '@patternfly/react-core';
import { ReplayWindow, DurationInSeconds, IntervalInMilliseconds, TimeInMilliseconds } from 'types/Common';
import ToolbarDropdown from 'components/ToolbarDropdown/ToolbarDropdown';
import { UserSettingsActions } from 'actions/UserSettingsActions';
import { KialiAppAction } from 'actions/KialiAppAction';
import Slider from 'components/IstioWizards/Slider/Slider';
import { KialiIcon, defaultIconStyle } from 'config/KialiIcon';
import { style } from 'typestyle';
import { toString } from './Utils';
import { serverConfig } from 'config';
import { PfColors } from 'components/Pf/PfColors';

type ReduxProps = {
  duration: DurationInSeconds;
  replayQueryTime: TimeInMilliseconds;
  replayWindow: ReplayWindow;

  setReplayQueryTime: (replayQueryTime: TimeInMilliseconds) => void;
  setReplayWindow: (replayWindow: ReplayWindow) => void;
  toggleReplayActive: () => void;
};

type ReplayProps = ReduxProps & {
  id: string;
};

type ReplayState = {
  isCustomStartTime: boolean;
  isReplaying: boolean;
  refresherRef?: number;
  replayFrame: number;
  replayFrameCount: number;
  replaySpeed: IntervalInMilliseconds;
};

type ReplaySpeed = {
  speed: IntervalInMilliseconds;
  text: string;
};

export const ReplayColor = PfColors.LightBlue300;

export const replayBorder = style({
  borderLeftStyle: 'solid',
  borderColor: ReplayColor,
  borderWidth: '3px'
});

// key represents replay interval in milliseconds
const replayIntervals = {
  60000: '1 minute',
  300000: '5 minutes',
  600000: '10 minutes',
  1800000: '30 minutes'
};

// key represents speed in milliseconds (i.e. how long to wait before refreshing-the-frame (fetching new data)
const replaySpeeds: ReplaySpeed[] = [
  { speed: 5000, text: 'slow' },
  { speed: 3000, text: 'medium' },
  { speed: 1000, text: 'fast' }
];

const defaultReplayInterval: IntervalInMilliseconds = 300000; // 5 minutes
const defaultReplaySpeed: IntervalInMilliseconds = 3000; // medium
const frameInterval: IntervalInMilliseconds = 10000; // number of ms clock advances per frame

const customToggleStyle = style({
  height: '36px'
});

const frameStyle = style({
  display: 'flex',
  margin: '5px 0 0 15px'
});

const pauseStyle = style({
  margin: '-5px 20px 0 30%',
  height: '37px',
  width: '10px'
});

const pauseIconStyle = style({
  fontSize: '1.5em'
});

const replayStyle = style({
  display: 'flex',
  width: '100%',
  padding: '5px 5px 0 10px',
  marginTop: '-5px'
});

const sliderStyle = style({
  width: '100%',
  margin: '0 -10px 0 20px'
});

const speedStyle = style({
  height: '1.5em',
  width: '4em',
  margin: '1px 0 0 0',
  padding: '0 2px 2px 2px'
});

const speedFocusStyle = style({
  backgroundColor: ReplayColor
});

const startTimeStyle = style({
  height: '36px',
  paddingLeft: '.75em',
  width: '10em'
});

export class Replay extends React.PureComponent<ReplayProps, ReplayState> {
  static getFrameCount = (elapsedTime: IntervalInMilliseconds): number => {
    return elapsedTime > 0 ? Math.floor(elapsedTime / frameInterval) : 0;
  };

  static queryTimeToFrame = (props: ReduxProps): number => {
    const elapsedTime: IntervalInMilliseconds = props.replayQueryTime - props.replayWindow.startTime;
    const frame: number = Replay.getFrameCount(elapsedTime);
    return frame;
  };

  static frameToQueryTime = (frame: number, props: ReduxProps): TimeInMilliseconds => {
    return props.replayWindow.startTime + frame * frameInterval;
  };

  private pickerTime: TimeInMilliseconds = 0;

  constructor(props: ReplayProps) {
    super(props);
    this.state = {
      isCustomStartTime: false,
      isReplaying: false,
      refresherRef: undefined,
      replayFrame: Replay.queryTimeToFrame(props),
      replayFrameCount: Replay.getFrameCount(props.replayWindow.interval),
      replaySpeed: defaultReplaySpeed
    };
  }

  componentDidMount() {
    if (!!!this.props.replayWindow.startTime) {
      this.initReplay();
    }
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
    if (!!!this.props.replayWindow.startTime) {
      return null;
    }

    const selectedTime: Date = new Date(this.props.replayWindow.startTime);
    const endTime: TimeInMilliseconds = selectedTime.getTime() + this.props.replayWindow.interval;
    const ticks: number[] = Array.from(Array(this.state.replayFrameCount).keys());
    const endString = toString(endTime, { month: undefined, day: undefined, second: '2-digit' });
    const now = Date.now();
    const maxTime: Date = new Date(now - this.props.replayWindow.interval);
    const minTime: Date = new Date(
      now - (serverConfig.prometheus.storageTsdbRetention! * 1000 + this.props.replayWindow.interval)
    );

    return (
      <div className={`${replayStyle} ${replayBorder}`}>
        {this.state.isCustomStartTime && (
          <Tooltip content="Replay start time">
            <DatePicker
              className={startTimeStyle}
              dateFormat="MMM dd, hh:mm aa"
              injectTimes={[maxTime]}
              maxDate={maxTime}
              maxTime={maxTime}
              minDate={minTime}
              minTime={minTime}
              onCalendarClose={() => this.onPickerClose()}
              onCalendarOpen={() => this.onPickerOpen()}
              onChange={date => this.onPickerChange(date)}
              popperPlacement="auto-end"
              selected={selectedTime}
              showTimeSelect={true}
              timeCaption="time"
              timeFormat="hh:mm aa"
              timeIntervals={5}
            />
          </Tooltip>
        )}
        <ToolbarDropdown
          id={'replay-interval'}
          handleSelect={key => this.setReplayInterval(Number(key))}
          value={String(this.props.replayWindow.interval)}
          label={replayIntervals[this.props.replayWindow.interval]}
          options={replayIntervals}
          tooltip="Replay length"
          nameDropdown={this.state.isCustomStartTime ? undefined : 'Last'}
        />
        <Tooltip
          key="toggle_advanced_setter"
          position="top"
          content={`Set ${this.state.isCustomStartTime ? 'simple' : 'custom'} start time`}
        >
          <Button className={customToggleStyle} variant={ButtonVariant.control} onClick={this.toggleCustomStartTime}>
            <KialiIcon.UserClock className={defaultIconStyle} />
          </Button>
        </Tooltip>
        <span className={sliderStyle}>
          <Slider
            key={endString} // on new endTime force new slider because of bug updating tick labels
            id="replay-slider"
            orientation="horizontal"
            min={0}
            max={this.state.replayFrameCount}
            maxLimit={this.state.replayFrameCount}
            step={1}
            value={this.state.replayFrame}
            ticks={ticks}
            tooltip={true}
            tooltipFormatter={this.formatTooltip}
            onSlideStop={this.setReplayFrame}
            input={false}
            locked={false}
            showLock={false}
          />
          <span className={frameStyle}>
            {this.state.isReplaying ? (
              <Tooltip key="replay-pause" position="top" content="Pause" entryDelay={1000}>
                <Button className={pauseStyle} variant={ButtonVariant.link} onClick={this.pause}>
                  <KialiIcon.PauseCircle className={pauseIconStyle} />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip key="replay-play" position="top" content="Play" entryDelay={1000}>
                <Button className={pauseStyle} variant={ButtonVariant.link} onClick={this.play}>
                  <KialiIcon.PlayCircle className={pauseIconStyle} />
                </Button>
              </Tooltip>
            )}
            <Text style={{ margin: '1px 15px 0 0' }}>{this.formatFrame(this.state.replayFrame)}</Text>
            {replaySpeeds.map(s => this.speedButton(s))}
          </span>
        </span>
      </div>
    );
  }

  formatTooltip = (val: number): string => {
    const time: string = toString(Replay.frameToQueryTime(val, this.props), { second: '2-digit' });
    return `${time} [${val}/${this.state.replayFrameCount}]`;
  };

  formatFrame = (frame: number): string => {
    const elapsedTime: IntervalInMilliseconds = frame * frameInterval;
    const elapsedSec: number = Math.floor((elapsedTime / 1000) % 60);
    const elapsedMin: number = Math.floor((elapsedTime / 1000 - elapsedSec) / 60);
    const zeroPadSec: string = elapsedSec < 10 ? '0' : '';
    const zeroPadMin: string = elapsedMin < 10 ? '0' : '';
    const elapsed: string = `${zeroPadMin}${elapsedMin}:${zeroPadSec}${elapsedSec}`;
    return elapsed;
  };

  private toggleCustomStartTime = () => {
    this.setState({ isCustomStartTime: !this.state.isCustomStartTime });
    this.initReplay();
  };

  private onPickerChange = (date: Date) => {
    this.pickerTime = date.getTime();
  };

  private onPickerClose = () => {
    if (this.pickerTime !== this.props.replayWindow.startTime) {
      this.setReplayStartTime(this.pickerTime);
    }
  };

  private onPickerOpen = () => {
    this.pickerTime = this.props.replayWindow.startTime;
  };

  private initReplay = () => {
    const interval: IntervalInMilliseconds = !!this.props.replayWindow.interval
      ? this.props.replayWindow.interval
      : defaultReplayInterval;
    // For simplicity/readability, round custom start times to the minute. Use seconds granularity for "Last <interval>"
    const startTime: TimeInMilliseconds = this.state.isCustomStartTime
      ? new Date().setSeconds(0, 0) - interval
      : new Date().getTime() - interval;
    this.setReplayWindow({ interval: interval, startTime: startTime });
  };

  private setReplayStartTime = (startTime: TimeInMilliseconds) => {
    this.setReplayWindow({ interval: this.props.replayWindow.interval, startTime: startTime });
  };

  private setReplayInterval = (interval: IntervalInMilliseconds) => {
    const startTime: TimeInMilliseconds = this.state.isCustomStartTime
      ? this.props.replayWindow.startTime
      : Date.now() - interval;
    this.setReplayWindow({ interval: interval, startTime: startTime });
  };

  private setReplayWindow = (replayWindow: ReplayWindow) => {
    const frameCount = Replay.getFrameCount(replayWindow.interval);
    this.setState({ replayFrame: 0, replayFrameCount: frameCount });
    this.props.setReplayWindow(replayWindow);
  };

  private setReplaySpeed = (replaySpeed: IntervalInMilliseconds) => {
    this.setState({ replaySpeed: replaySpeed });
  };

  private pause = () => {
    this.setState({ isReplaying: false });
  };

  private play = () => {
    this.setState({ isReplaying: true });
    const frameQueryTime = Replay.frameToQueryTime(this.state.replayFrame, this.props);
    if (frameQueryTime !== this.props.replayQueryTime) {
      this.props.setReplayQueryTime(frameQueryTime);
    }
  };

  private setReplayFrame = (frame: number) => {
    if (frame !== this.state.replayFrame) {
      this.setState({ replayFrame: frame });
      this.props.setReplayQueryTime(Replay.frameToQueryTime(frame, this.props));
    }
  };

  private updateRefresher = () => {
    if (this.state.refresherRef) {
      clearInterval(this.state.refresherRef);
    }
    if (!this.state.isReplaying || !!!this.props.replayWindow.interval) {
      return;
    }

    let refresherRef: number | undefined = undefined;
    refresherRef = window.setInterval(this.handleRefresh, this.state.replaySpeed);
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

  private speedButton = (replaySpeed: ReplaySpeed): React.ReactFragment => {
    const isFocus = this.state.replaySpeed === replaySpeed.speed;
    const className = isFocus ? `${speedStyle} ${speedFocusStyle}` : `${speedStyle}`;
    return (
      <Button
        className={className}
        variant={ButtonVariant.plain}
        isFocus={isFocus}
        onClick={() => this.setReplaySpeed(replaySpeed.speed)}
      >
        {replaySpeed.text}
      </Button>
    );
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  replayQueryTime: replayQueryTimeSelector(state),
  replayWindow: replayWindowSelector(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  setReplayQueryTime: bindActionCreators(UserSettingsActions.setReplayQueryTime, dispatch),
  setReplayWindow: bindActionCreators(UserSettingsActions.setReplayWindow, dispatch),
  toggleReplayActive: bindActionCreators(UserSettingsActions.toggleReplayActive, dispatch)
});

const ReplayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Replay);

export default ReplayContainer;
