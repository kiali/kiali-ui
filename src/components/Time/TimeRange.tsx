import * as React from 'react';
import { connect } from 'react-redux';
import { DurationDropdownContainer } from '../DurationDropdown/DurationDropdown';
import RefreshContainer from 'components/Refresh/Refresh';
import { KialiAppState } from 'store/Store';
import { lastRefreshAtSelector, durationSelector } from 'store/Selectors';
import { TimeInMilliseconds, DurationInSeconds } from 'types/Common';

const timeDisplayOptions = {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
};

type ReduxProps = {
  duration: DurationInSeconds;
  lastRefreshAt: TimeInMilliseconds;
};

type TimeRangeProps = ReduxProps & {
  disabled: boolean;
  id: string;

  handleRefresh: () => void;
};

export class TimeRange extends React.PureComponent<TimeRangeProps> {
  render() {
    const rangeEnd: TimeInMilliseconds = this.props.lastRefreshAt;
    const rangeStart: TimeInMilliseconds = rangeEnd - this.props.duration * 1000;

    return (
      <>
        <span>
          {new Date(rangeStart).toLocaleDateString(undefined, timeDisplayOptions)}
          {' ... '}
          {new Date(rangeEnd).toLocaleDateString(undefined, timeDisplayOptions)}
        </span>
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
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  lastRefreshAt: lastRefreshAtSelector(state)
});

const TimeRangeContainer = connect(
  mapStateToProps,
  null
)(TimeRange);

export default TimeRangeContainer;
