import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import {
  replayIntervalSelector,
  refreshIntervalSelector,
  lastRefreshAtSelector,
  replayEndTimeSelector,
  replayQueryTimeSelector
} from 'store/Selectors';
import { Tooltip, ButtonVariant, Button } from '@patternfly/react-core';
import { TimeInSeconds, RefreshIntervalInMs, ReplayIntervalInSeconds, TimeInMilliseconds } from 'types/Common';
import ToolbarDropdown from 'components/ToolbarDropdown/ToolbarDropdown';
import { UserSettingsActions } from 'actions/UserSettingsActions';
import { KialiAppAction } from 'actions/KialiAppAction';
import Slider from 'components/IstioWizards/Slider/Slider';
import { KialiIcon } from 'config/KialiIcon';
import { style } from 'typestyle';
import { toString } from './LocalTime';
import { DurationDropdownContainer } from 'components/DurationDropdown/DurationDropdown';

type ReduxProps = {
  lastRefreshAt: TimeInMilliseconds;
  refreshInterval: RefreshIntervalInMs;
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
  replayFrame: number;
  replayFrameCount: number;
};

const replayIntervals = {
  0: 'Starting...',
  60: '1 minute ago',
  300: '5 minutes ago',
  600: '10 minutes ago',
  1800: '30 minutes ago',
  3600: '1 hour ago'
};

const replayStyle = style({
  display: 'flex',
  width: '70%',
  marginBottom: '10px',
  marginTop: '-5px'
});

const sliderStyle = style({
  width: '100%',
  margin: '0 5px 0 15px'
});

export class Replay extends React.PureComponent<ReplayProps, ReplayState> {
  static getFrameCount = (replayInterval: ReplayIntervalInSeconds, refreshInterval: RefreshIntervalInMs): number => {
    return refreshInterval > 0 ? Math.floor(replayInterval / (refreshInterval / 1000)) : 0;
  };

  static queryTimeToFrame = (props: ReduxProps) => {
    const replayStartTime = props.replayEndTime - props.replayInterval;
    const elapsedTime = props.replayQueryTime - replayStartTime;
    const frame: number = !!props.refreshInterval ? Math.floor(elapsedTime / (props.refreshInterval / 1000)) : 0;
    return frame;
  };

  static frameToQueryTime = (frame: number, props: ReduxProps) => {
    const step = Math.floor(props.refreshInterval / 1000);
    const replayStartTime = props.replayEndTime - props.replayInterval;
    const queryTime: TimeInSeconds = !!replayStartTime ? replayStartTime + frame * step : 0;
    return queryTime;
  };

  constructor(props: ReplayProps) {
    super(props);
    this.state = {
      replayFrame: Replay.queryTimeToFrame(props),
      replayFrameCount: Replay.getFrameCount(props.replayInterval, props.refreshInterval)
    };
  }

  componentDidUpdate(prevProps: ReplayProps) {
    const refreshIntervalChange = prevProps.refreshInterval !== this.props.refreshInterval;
    const frameChange = prevProps.lastRefreshAt !== this.props.lastRefreshAt;

    if (refreshIntervalChange) {
      const frameCount = Replay.getFrameCount(this.props.replayInterval, this.props.refreshInterval);
      this.setState({ replayFrame: 0, replayFrameCount: frameCount });
      this.props.setReplayQueryTime(Replay.frameToQueryTime(0, this.props));
    } else if (frameChange && this.state.replayFrame < this.state.replayFrameCount) {
      const nextFrame = this.state.replayFrame + 1;
      this.setState({ replayFrame: nextFrame });
      this.props.setReplayQueryTime(Replay.frameToQueryTime(nextFrame, this.props));
    }
  }

  render() {
    const locked = this.state.replayFrameCount < 1;
    const startTime: TimeInSeconds = this.props.replayEndTime - this.props.replayInterval;
    const ticks: number[] = [0, 5, 10];
    const ticksLabels: string[] = [];
    const formatter: (val: number) => string = val => {
      return 'Current frame: ' + val;
    };
    ticksLabels.push(toString(startTime * 1000));
    ticksLabels.push(toString((this.props.replayEndTime - this.props.replayInterval / 2) * 1000));
    ticksLabels.push(toString(this.props.replayEndTime * 1000));

    return (
      <div className={replayStyle}>
        <DurationDropdownContainer
          id={'time_range_duration'}
          disabled={this.props.disabled}
          tooltip={'Duration for metric queries'}
          prefix="Query Back"
        />
        <ToolbarDropdown
          id={'time-range-replay'}
          disabled={this.props.disabled}
          handleSelect={key => this.setReplayInterval(Number(key))}
          value={String(this.props.replayInterval)}
          label={replayIntervals[this.props.replayInterval]}
          options={replayIntervals}
          tooltip="Replay traffic starting at selected time"
        />
        {!!this.props.replayInterval && (
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
                ticks={ticks}
                ticks_labels={ticksLabels}
                tooltip={true}
                tooltipFormatter={formatter}
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

  private setReplayInterval = (replayInterval: ReplayIntervalInSeconds) => {
    console.log(`SetReplayInterval`);
    const frameCount = Replay.getFrameCount(replayInterval, this.props.refreshInterval);
    this.setState({ replayFrame: 0, replayFrameCount: frameCount });
    this.props.setReplayInterval(replayInterval);
  };

  private endReplay = () => {
    console.log(`EndReplay`);
    this.props.toggleReplayActive();
  };

  private setFrame = (frame: number) => {
    console.log(`SetFrame [${frame}]`);
    this.setState({ replayFrame: frame });
    this.props.setReplayQueryTime(Replay.frameToQueryTime(frame, this.props));
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  lastRefreshAt: lastRefreshAtSelector(state), // re-render on refresh
  refreshInterval: refreshIntervalSelector(state),
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
