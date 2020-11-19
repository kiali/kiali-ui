import * as React from 'react';

import {
  DurationInSeconds,
  BoundsInMilliseconds,
  guardTimeRange,
  TimeRange,
  durationToBounds
} from '../../types/Common';
import { ToolbarDropdown } from '../ToolbarDropdown/ToolbarDropdown';
import { serverConfig, humanDurations } from '../../config/ServerConfig';
import { retrieveTimeRange, storeTimeRange } from './TimeRangeHelper';
import { DateTimePicker } from './DateTimePicker';
import { KialiAppState } from '../../store/Store';
import { timeRangeSelector } from '../../store/Selectors';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppAction } from '../../actions/KialiAppAction';
import { UserSettingsActions } from '../../actions/UserSettingsActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

type Props = {
  timeRange: TimeRange;
  tooltip: string;
  setTimeRange: (range: TimeRange) => void;
};

class TimeRangeComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    const range = retrieveTimeRange();
    console.log('TODELETE constructor this.range ' + JSON.stringify(range));
    storeTimeRange(range);
    this.props.setTimeRange(range);
  }

  componentDidUpdate() {
    console.log('TODELETE TimeRangeComponent componentDidUpdate');
    console.log('this.props.timeRange ' + JSON.stringify(this.props.timeRange));
    if (this.props.timeRange) {
      storeTimeRange(this.props.timeRange);
    }
  }

  onDurationChanged = (key: string) => {
    let range: TimeRange = {};
    if (key === 'custom') {
      // Convert to bounds
      range = guardTimeRange(range, durationToBounds, b => b);
      range.rangeDuration = undefined;
    } else {
      range.rangeDuration = Number(key);
      range.from = undefined;
      range.to = undefined;
    }
    console.log('TODELETE TimeRangeComponent setTimeRange this.range ' + JSON.stringify(range));
    this.props.setTimeRange(range);
  };

  onStartPickerChanged = (d?: Date) => {
    let range: TimeRange = {};
    console.log('TODELETE onStartPickerChanged d: ' + JSON.stringify(d));
    if (d) {
      range = guardTimeRange(range, durationToBounds, b => b);
      range.from = d.getTime();
      if (range.to && range.from > range.to) {
        range.from = range.to;
      }
      range.rangeDuration = undefined;
      console.log('TODELETE setTimeRange this.props.setTimeRange: ' + JSON.stringify(range));
      this.props.setTimeRange(range);
    }
  };

  onEndPickerChanged = (d?: Date) => {
    console.log('TODELETE onEndPickerChanged d: ' + JSON.stringify(d));
    const range = guardTimeRange(this.props.timeRange, durationToBounds, b => b);
    range.to = d ? d.getTime() : undefined;
    if (range.to && range.from && range.from > range.to) {
      range.to = range.from;
    }
    console.log('TODELETE setTimeRange this.props.setTimeRange: ' + JSON.stringify(range));
    this.props.setTimeRange(range);
  };

  render() {
    console.log('TODELETE TimeRangeComponent render()');
    return guardTimeRange(
      this.props.timeRange,
      d => this.renderDuration(d),
      ft => this.renderWithCustom(ft)
    );
  }

  renderDuration(d?: DurationInSeconds) {
    console.log('TODELETE renderDuration ' + JSON.stringify(d));
    const durations = humanDurations(serverConfig, 'Last', undefined);
    const options = { custom: 'Custom', ...durations };
    return (
      <ToolbarDropdown
        id={'metrics_filter_interval_duration'}
        handleSelect={this.onDurationChanged}
        initialValue={d || 'custom'}
        value={d || 'custom'}
        initialLabel={d ? serverConfig.durations[d] : 'Custom'}
        options={options}
        tooltip={this.props.tooltip}
      />
    );
  }

  renderWithCustom(bounds: BoundsInMilliseconds) {
    console.log('TODELETE renderWithCustom ' + JSON.stringify(bounds));
    return (
      <>
        {this.renderDuration()}
        {' From '}
        <DateTimePicker selected={bounds.from} onChange={date => this.onStartPickerChanged(date)} maxDate={bounds.to} />
        {' To '}
        <DateTimePicker selected={bounds.to} onChange={date => this.onEndPickerChanged(date)} minDate={bounds.from} />
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => {
  console.log('TODELETE mapStateToProps ' + JSON.stringify(state.userSettings.timeRange));
  console.log('TODELETE timeRangeSelector(state) ' + JSON.stringify(timeRangeSelector(state)));
  return {
    timeRange: timeRangeSelector(state)
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    setTimeRange: bindActionCreators(UserSettingsActions.setTimeRange, dispatch)
  };
};

const TimeRangeContainer = connect(mapStateToProps, mapDispatchToProps)(TimeRangeComponent);
export default TimeRangeContainer;
