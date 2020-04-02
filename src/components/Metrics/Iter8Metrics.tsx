import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Text, TextVariants, Toolbar, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { Dashboard, DashboardModel, ExternalLink, Overlay, VCDataPoint } from '@kiali/k-charted-pf4';

import RefreshContainer from '../../components/Refresh/Refresh';
import * as API from '../../services/Api';
import { KialiAppState } from '../../store/Store';
import { TimeRange } from '../../types/Common';
import { Direction } from '../../types/MetricsOptions';
import * as AlertUtils from '../../utils/AlertUtils';
import { Iter8MetricsOptions } from '../../types/Iter8';
import * as MetricsHelper from './Helper';
import { MetricsSettings, LabelsSettings } from '../MetricsOptions/MetricsSettings';
import MetricsReporter from '../MetricsOptions/MetricsReporter';
import history, { URLParam } from '../../app/History';
import { MetricsObjectTypes } from '../../types/Metrics';
import { GrafanaInfo } from '../../types/GrafanaInfo';
import { MessageType } from '../../types/MessageCenter';
import TimeRangeComponent from 'components/Time/TimeRangeComponent';
import { retrieveTimeRange, storeBounds } from 'components/Time/TimeRangeHelper';

type MetricsState = {
  dashboard?: DashboardModel;
  labelsSettings: LabelsSettings;
  grafanaLinks: ExternalLink[];
  spanOverlay?: Overlay;
  timeRange: TimeRange;
  timeWindow?: Date[];
  timeWindowType: string;
  metricTypeInfo?: string;
};

type ObjectId = {
  namespace: string;
  object: string;
};

type Iter8MetricsProps = ObjectId &
  RouteComponentProps<{}> & {
    objectType: MetricsObjectTypes;
    direction: Direction;
    startTime: number;
    endTime: number;
    baseline: string;
    candidate: string;
  };

type Props = Iter8MetricsProps & {
  // Redux props
  jaegerIntegration: boolean;
};

class Iter8Metrics extends React.Component<Props, MetricsState> {
  options: Iter8MetricsOptions;
  // spanOverlay: SpanOverlay;
  static grafanaInfoPromise: Promise<GrafanaInfo | undefined> | undefined;

  constructor(props: Props) {
    super(props);

    const settings = MetricsHelper.retrieveMetricsSettings();
    const timeRange = retrieveTimeRange() || MetricsHelper.defaultMetricsDuration;
    this.options = this.initOptions(settings);
    // Initialize active filters from URL
    this.state = {
      labelsSettings: settings.labelsSettings,
      grafanaLinks: [],
      timeRange: timeRange,
      timeWindowType: 'Live View'
    };
    // this.spanOverlay = new SpanOverlay(changed => this.setState({ spanOverlay: changed }));
  }

  initOptions(settings: MetricsSettings): Iter8MetricsOptions {
    const options: Iter8MetricsOptions = {
      reporter: MetricsReporter.initialReporter(this.props.direction),
      direction: this.props.direction
    };
    MetricsHelper.settingsToOptions(settings, options);
    return options;
  }

  componentDidMount() {
    this.refresh();
  }

  refresh = () => {
    this.fetchMetrics();
    // if (this.props.jaegerIntegration && this.props.timeWindowType == 'Live') {
    //   this.spanOverlay.fetch(
    //     this.props.namespace,
    //     this.props.object,
    //     this.options.duration || MetricsHelper.defaultMetricsDuration
    //   );
    // }
  };

  fetchMetrics = () => {
    // Time range needs to be reevaluated everytime fetching
    MetricsHelper.timeRangeToOptions(this.state.timeRange, this.options);
    let promise: Promise<API.Response<DashboardModel>>;
    this.options.byLabels = ['destination_version'];
    this.options.charts = 'request_count';
    if (this.props.endTime !== 0) {
      this.options.startTime = this.props.startTime;
      this.options.endTime = this.props.endTime;
      this.setState({ timeWindowType: 'Snapshot View' });
    } else {
      this.options.startTime = this.props.startTime;
      this.setState({ timeWindowType: 'Live View' });
    }
    this.options.baseline = this.props.baseline;
    this.options.candidate = this.props.candidate;
    promise = API.getIter8Dashboard(this.props.namespace, this.props.object, this.options);

    return promise
      .then(response => {
        const labelsSettings = MetricsHelper.extractLabelsSettings(response.data, this.state.labelsSettings);
        this.setState({
          dashboard: response.data,
          labelsSettings: labelsSettings
        });
      })
      .catch(error => {
        AlertUtils.addError('Could not fetch metrics.', error);
        throw error;
      });
  };

  fetchGrafanaInfo() {
    if (!Iter8Metrics.grafanaInfoPromise) {
      Iter8Metrics.grafanaInfoPromise = API.getGrafanaInfo().then(response => {
        if (response.status === 204) {
          return undefined;
        }
        return response.data;
      });
    }
    Iter8Metrics.grafanaInfoPromise
      .then(grafanaInfo => {
        if (grafanaInfo) {
          this.setState({ grafanaLinks: grafanaInfo.externalLinks });
        } else {
          this.setState({ grafanaLinks: [] });
        }
      })
      .catch(err => {
        AlertUtils.addError(
          'Could not fetch Grafana info. Turning off links to Grafana.',
          err,
          'default',
          MessageType.INFO
        );
      });
  }

  onTimeFrameChanged = (range: TimeRange) => {
    this.setState({ timeRange: range }, () => {
      // this.spanOverlay.resetLastFetchTime();
      this.refresh();
    });
  };

  onClickDataPoint = (_, datum: VCDataPoint) => {
    if ('traceId' in datum) {
      history.push(
        `/namespaces/${this.props.namespace}/services/${this.props.object}?tab=traces&${URLParam.JAEGER_TRACE_ID}=${
          datum.traceId
        }`
      );
    }
  };

  private onDomainChange(dates: [Date, Date]) {
    if (dates && dates[0] && dates[1]) {
      const range: TimeRange = {
        from: dates[0].getTime(),
        to: dates[1].getTime()
      };
      storeBounds(range);
      this.onTimeFrameChanged(range);
    }
  }

  iter8EvalTimeRange = (from, to): [Date, Date] => {
    return [new Date(from), to ? new Date(to) : new Date()];
  };

  render() {
    if (!this.state.dashboard) {
      return this.renderOptionsBar();
    }

    const urlParams = new URLSearchParams(history.location.search);
    const expandedChart = urlParams.get('expand') || undefined;
    // const timeWindow = evalTimeRange(retrieveTimeRange() || MetricsHelper.defaultMetricsDuration)

    const timeWindow = this.iter8EvalTimeRange(this.props.startTime, this.props.endTime);
    const warningMessage = this.state.dashboard.charts.map(chart => {
      if (chart.metric !== undefined) {
        if (chart.metric.length === 0) {
          return (
            <>
              <Text component={TextVariants.h4}>Prometeus data not available for the time range</Text>
            </>
          );
        }
      }
      return '';
    });

    return (
      <>
        <Text component={TextVariants.h4}>{warningMessage}</Text>
        {this.renderOptionsBar()}
        <Dashboard
          dashboard={this.state.dashboard}
          labelValues={MetricsHelper.convertAsPromLabels(this.state.labelsSettings)}
          expandedChart={expandedChart}
          expandHandler={this.expandHandler}
          onClick={this.onClickDataPoint}
          labelPrettifier={MetricsHelper.prettyLabelValues}
          timeWindow={timeWindow}
          brushHandlers={{ onDomainChangeEnd: (_, props) => this.onDomainChange(props.currentDomain.x) }}
        />
      </>
    );
  }

  renderOptionsBar() {
    return (
      <Toolbar style={{ paddingBottom: 8 }}>
        <ToolbarGroup style={{ marginLeft: 'auto', marginRight: 0 }}>
          <ToolbarItem id="timewindowtype">{this.state.timeWindowType} &nbsp;&nbsp;&nbsp;</ToolbarItem>
          <ToolbarItem>
            <TimeRangeComponent
              range={this.state.timeRange}
              onChanged={this.onTimeFrameChanged}
              tooltip={'Time range for metrics'}
              allowCustom={true}
            />
          </ToolbarItem>
          <ToolbarItem>
            <RefreshContainer id="it8metrics-refresh" handleRefresh={this.refresh} hideLabel={true} />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
  }

  private expandHandler = (expandedChart?: string) => {
    const urlParams = new URLSearchParams(history.location.search);
    urlParams.delete('expand');
    if (expandedChart) {
      urlParams.set('expand', expandedChart);
    }
    history.push(history.location.pathname + '?' + urlParams.toString());
  };
}

const mapStateToProps = (state: KialiAppState) => {
  return {
    jaegerIntegration: state.jaegerState ? state.jaegerState.integration : false
  };
};

const Iter8MetricsContainer = withRouter<RouteComponentProps<{}> & Iter8MetricsProps, any>(
  connect(mapStateToProps)(Iter8Metrics)
);

export default Iter8MetricsContainer;
