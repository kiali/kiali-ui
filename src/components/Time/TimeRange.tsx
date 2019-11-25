import * as React from 'react';
import { connect } from 'react-redux';
import { DurationDropdownContainer } from '../DurationDropdown/DurationDropdown';
import RefreshContainer from 'components/Refresh/Refresh';
import { KialiAppState } from 'store/Store';
import { lastRefreshAtSelector, durationSelector } from 'store/Selectors';
import { TimeInMilliseconds, DurationInSeconds, TimeInSeconds } from 'types/Common';
import { Tooltip, TooltipPosition, Button } from '@patternfly/react-core';
import { KialiIcon, defaultIconStyle } from 'config/KialiIcon';

type ReduxProps = {
  duration: DurationInSeconds;
  lastRefreshAt: TimeInMilliseconds;
};

type TimeRangeProps = ReduxProps & {
  disabled: boolean;
  id: string;

  handleRefresh: () => void;
};

type TimeRangeState = {
  replayStartTime: TimeInSeconds;
  showReplay: boolean;
};
export class TimeRange extends React.PureComponent<TimeRangeProps, TimeRangeState> {
  constructor(props: TimeRangeProps) {
    super(props);

    this.state = {
      replayStartTime: 0,
      showReplay: false
    };
  }

  render() {
    return (
      <span>
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
    this.setState({ showReplay: !this.state.showReplay, replayStartTime: 0 });
  };
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
