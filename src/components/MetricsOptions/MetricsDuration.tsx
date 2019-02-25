import * as React from 'react';

import { URLParam, HistoryManager } from '../../app/History';
import { DurationInSeconds } from '../../types/Common';
import { ToolbarDropdown } from '../ToolbarDropdown/ToolbarDropdown';
import { serverConfig } from '../../config/serverConfig';

type Props = {
  onChanged: (duration: DurationInSeconds) => void;
};

export default class MetricsDuration extends React.Component<Props> {
  // Default to 10 minutes. Showing timeseries to only 1 minute doesn't make so much sense.
  static DefaultDuration = 600;

  private shouldReportOptions: boolean;
  private duration: DurationInSeconds;

  static initialDuration = (): DurationInSeconds => {
    const urlDuration = HistoryManager.getDuration();
    if (urlDuration !== undefined) {
      sessionStorage.setItem(URLParam.DURATION, String(urlDuration));
      return urlDuration;
    }
    const storageDuration = sessionStorage.getItem(URLParam.DURATION);
    return storageDuration !== null ? Number(storageDuration) : MetricsDuration.DefaultDuration;
  };

  constructor(props: Props) {
    super(props);
  }

  componentDidUpdate() {
    if (this.shouldReportOptions) {
      this.shouldReportOptions = false;
      this.props.onChanged(this.duration);
    }
  }

  onDurationChanged = (key: string) => {
    sessionStorage.setItem(URLParam.DURATION, key);
    HistoryManager.setParam(URLParam.DURATION, key);
  };

  render() {
    this.processUrlParams();
    return (
      <ToolbarDropdown
        id={'metrics_filter_interval_duration'}
        disabled={false}
        handleSelect={this.onDurationChanged}
        nameDropdown={'Fetching'}
        initialValue={this.duration}
        initialLabel={serverConfig.durations[this.duration]}
        options={serverConfig.durations}
      />
    );
  }

  processUrlParams() {
    const duration = MetricsDuration.initialDuration();
    this.shouldReportOptions = duration !== this.duration;
    this.duration = duration;
  }
}
