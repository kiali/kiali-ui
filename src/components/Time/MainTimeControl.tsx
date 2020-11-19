import * as React from 'react';
import TimeControlsContainer from './TimeControls';
import TimeRangeComponent from './TimeRangeComponent';
import RefreshContainer from '../Refresh/Refresh';

type Props = {
  customDuration: boolean;
};

export default class MainTimeControl extends React.Component<Props> {
  render() {
    const timeControlComponent = (
      <TimeControlsContainer key={'DurationDropdown'} id="app-info-duration-dropdown" disabled={false} />
    );
    const timeRangeComponent = (
      <div style={{ display: 'flex' }}>
        <TimeRangeComponent tooltip={'Time range'} />
        <RefreshContainer id="metrics-refresh" hideLabel={true} manageURL={true} />
      </div>
    );
    return this.props.customDuration ? timeRangeComponent : timeControlComponent;
  }
}
