import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Icon, Toolbar, ToolbarRightContent, FormGroup } from 'patternfly-react';

import { config } from '../../config';
import ValueSelectHelper from './ValueSelectHelper';
import MetricsOptions from '../../types/MetricsOptions';
import { ToolbarDropdown } from '../ToolbarDropdown/ToolbarDropdown';
import { HistoryManager } from '../../app/History';
import { KialiAppState } from '../../store/Store';
import { UserSettingsActions } from '../../actions/UserSettingsActions';
import { store } from '../../store/ConfigStore';

interface MetricOptionsProps {
  onOptionsChanged: (opts: MetricsOptions) => void;
  onPollIntervalChanged: (interval: number) => void;
  onReporterChanged: (reporter: string) => void;
  onManualRefresh: () => void;
  metricReporter: string;
  duration: number; // from Redux
  pollInterval: number; // from Redux
  setRefreshInterval: (interval: number) => void; // from Redux
  setDurationInterval: (interval: number) => void; // from Redux
}

interface MetricsOptionsState {
  groupByLabels: string[];
}

interface GroupByLabel {
  labelIn: string;
  labelOut: string;
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    setDurationInterval: bindActionCreators(UserSettingsActions.setDurationInterval, dispatch),
    setRefreshInterval: bindActionCreators(UserSettingsActions.setRefreshInterval, dispatch)
  };
};

const mapStateToProps = (state: KialiAppState) => ({
  duration: state.userSettings.durationInterval,
  pollInterval: state.userSettings.refreshInterval
});

export class MetricsOptionsBar extends React.Component<MetricOptionsProps, MetricsOptionsState> {
  static PollIntervals = config().toolbar.pollInterval;

  static Durations = config().toolbar.intervalDuration;

  static GroupByLabelOptions: { [key: string]: GroupByLabel } = {
    'Local version': {
      labelIn: 'destination_version',
      labelOut: 'source_version'
    },
    'Remote app': {
      labelIn: 'source_app',
      labelOut: 'destination_app'
    },
    'Remote version': {
      labelIn: 'source_version',
      labelOut: 'destination_version'
    },
    'Response code': {
      labelIn: 'response_code',
      labelOut: 'response_code'
    }
  };

  static ReporterOptions: { [key: string]: string } = {
    destination: 'Destination',
    source: 'Source'
  };

  duration: number;
  pollInterval: number;

  groupByLabelsHelper: ValueSelectHelper;

  constructor(props: MetricOptionsProps) {
    super(props);

    this.groupByLabelsHelper = new ValueSelectHelper({
      items: Object.keys(MetricsOptionsBar.GroupByLabelOptions),
      onChange: this.changedGroupByLabel,
      dropdownTitle: 'Group by',
      resultsTitle: 'Grouping by:',
      urlAttrName: 'groupings'
    });

    this.duration = this.initialDuration();
    this.pollInterval = this.initialPollInterval();

    this.state = {
      groupByLabels: this.groupByLabelsHelper.selected
    };
  }

  componentDidMount() {
    // Init state upstream
    this.reportOptions();
    this.props.onPollIntervalChanged(this.props.pollInterval);
  }

  initialPollInterval = (): number => {
    let initialPollInterval = this.props.pollInterval ? this.props.pollInterval : config().toolbar.defaultPollInterval;

    const pollIntervalParam = HistoryManager.getParam('pi');
    if (pollIntervalParam != null) {
      initialPollInterval = Number(pollIntervalParam);
    }

    return initialPollInterval;
  };

  initialDuration = (): number => {
    let initialDuration = this.props.duration ? this.props.duration : config().toolbar.defaultDuration;

    console.warn('Duration: ' + initialDuration);
    const durationParam = HistoryManager.getParam('duration');
    if (durationParam != null) {
      initialDuration = Number(durationParam);
    }

    return initialDuration;
  };

  onPollIntervalChanged = (key: number) => {
    this.props.setRefreshInterval(key);
    // We use a specific handler so that changing poll interval doesn't trigger a metrics refresh in parent
    // Especially useful when pausing
    this.props.onPollIntervalChanged(key);
  };

  onDurationChanged = (key: number) => {
    console.warn('onDurationChanged: ' + key);
    store.dispatch(UserSettingsActions.setDurationInterval(key));
    this.props.setDurationInterval(key);
    this.reportOptions();
  };

  reportOptions() {
    // State-to-options converter (removes unnecessary properties)
    const labelsIn = this.state.groupByLabels.map(lbl => MetricsOptionsBar.GroupByLabelOptions[lbl].labelIn);
    const labelsOut = this.state.groupByLabels.map(lbl => MetricsOptionsBar.GroupByLabelOptions[lbl].labelOut);
    this.props.onOptionsChanged({
      duration: this.duration,
      byLabelsIn: labelsIn,
      byLabelsOut: labelsOut
    });
  }

  changedGroupByLabel = (labels: string[]) => {
    this.setState({ groupByLabels: labels }, () => {
      this.reportOptions();
    });
  };

  render() {
    return (
      <Toolbar>
        {this.groupByLabelsHelper.renderDropdown()}
        <FormGroup>
          <ToolbarDropdown
            id={'metrics_filter_reporter'}
            disabled={false}
            handleSelect={this.props.onReporterChanged}
            nameDropdown={'Reported from'}
            value={this.props.metricReporter}
            initialLabel={MetricsOptionsBar.ReporterOptions[this.props.metricReporter]}
            options={MetricsOptionsBar.ReporterOptions}
          />
        </FormGroup>
        <ToolbarDropdown
          id={'metrics_filter_interval_duration'}
          disabled={false}
          handleSelect={this.onDurationChanged}
          nameDropdown={'Duration'}
          initialValue={this.props.duration}
          initialLabel={String(MetricsOptionsBar.Durations[this.duration])}
          options={MetricsOptionsBar.Durations}
        />
        <ToolbarDropdown
          id={'metrics_filter_poll_interval'}
          disabled={false}
          handleSelect={this.onPollIntervalChanged}
          nameDropdown={'Poll Interval'}
          initialValue={this.props.pollInterval}
          initialLabel={String(MetricsOptionsBar.PollIntervals[this.pollInterval])}
          options={MetricsOptionsBar.PollIntervals}
        />
        <ToolbarRightContent>
          <Button onClick={this.props.onManualRefresh}>
            <Icon name="refresh" />
          </Button>
        </ToolbarRightContent>
        {this.groupByLabelsHelper.hasResults() && (
          <Toolbar.Results>{this.groupByLabelsHelper.renderResults()}</Toolbar.Results>
        )}
      </Toolbar>
    );
  }
}
const MetricsOptionsBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MetricsOptionsBar);
export default MetricsOptionsBarContainer;
