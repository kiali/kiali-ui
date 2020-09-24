import * as React from 'react';
import {
  Card,
  CardBody,
  Checkbox,
  Grid,
  GridItem,
  Text,
  TextVariants,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Tooltip
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { connect } from 'react-redux';

import ToolbarDropdown from '../ToolbarDropdown/ToolbarDropdown';
import { RenderComponentScroll, RenderHeader } from '../Nav/Page';
import { KialiAppState } from '../../store/Store';
import { JaegerError, JaegerTrace } from '../../types/JaegerInfo';
import TraceDetails from './JaegerResults/TraceDetails';
import JaegerScatter from './JaegerScatter';
import { HistoryManager, URLParam } from '../../app/History';
import { config } from '../../config';
import TimeRangeComponent from 'components/Time/TimeRangeComponent';
import RefreshContainer from 'components/Refresh/Refresh';
import { RightActionBar } from 'components/RightActionBar/RightActionBar';
import { TracesFetcher } from './TracesFetcher';
import { getTimeRangeMicros, buildTags } from './JaegerHelper';
import SpanDetails from './JaegerResults/SpanDetails';

interface TracesProps {
  namespace: string;
  target: string;
  targetKind: 'app' | 'workload' | 'service';
  urlJaeger: string;
  namespaceSelector: boolean;
  showErrors: boolean;
  duration: number;
  selectedTrace?: JaegerTrace;
}

interface TracesState {
  url: string;
  width: number;
  showErrors: boolean;
  fixedTime: boolean;
  traceIntervalDurations: { [key: string]: string };
  selectedTraceIntervalDuration: string;
  selectedStatusCode: string;
  selectedLimitSpans: string;
  traces: JaegerTrace[];
  jaegerErrors: JaegerError[];
  targetApp?: string;
}

export const traceDurationUnits: { [key: string]: string } = {
  us: 'us',
  ms: 'ms',
  s: 's'
};

class TracesComponent extends React.Component<TracesProps, TracesState> {
  private fetcher: TracesFetcher;

  constructor(props: TracesProps) {
    super(props);
    const limit =
      HistoryManager.getParam(URLParam.JAEGER_LIMIT_TRACES) ||
      sessionStorage.getItem(URLParam.JAEGER_LIMIT_TRACES) ||
      '20';
    this.saveValue(URLParam.JAEGER_LIMIT_TRACES, limit);
    const statusCode =
      HistoryManager.getParam(URLParam.JAEGER_STATUS_CODE) ||
      sessionStorage.getItem(URLParam.JAEGER_STATUS_CODE) ||
      'none';
    const interval =
      HistoryManager.getParam(URLParam.JAEGER_TRACE_INTERVAL_SELECTED) ||
      sessionStorage.getItem(URLParam.JAEGER_TRACE_INTERVAL_SELECTED) ||
      'none';

    let targetApp: string | undefined = undefined;
    if (this.props.targetKind === 'app') {
      targetApp = this.props.namespaceSelector ? this.props.target + '.' + this.props.namespace : this.props.target;
    }
    this.state = {
      url: '',
      width: 0,
      fixedTime: true,
      showErrors: this.props.showErrors,
      traceIntervalDurations: { none: 'none' },
      selectedTraceIntervalDuration: interval,
      selectedStatusCode: statusCode,
      selectedLimitSpans: limit,
      traces: [],
      jaegerErrors: [],
      targetApp: targetApp
    };
    this.fetcher = new TracesFetcher(this.onTracesUpdated, errors => this.setState({ jaegerErrors: errors }));
  }

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate(prevProps: TracesProps) {
    // Selected trace (coming from redux) might have been reloaded and needs to be updated within the traces list
    // Check reference of selected trace
    if (this.props.selectedTrace && prevProps.selectedTrace !== this.props.selectedTrace) {
      const traces = this.state.traces;
      const trace = this.props.selectedTrace;
      const index = traces.findIndex(t => t.traceID === trace.traceID);
      if (index >= 0) {
        traces[index] = this.props.selectedTrace;
        this.setState({ traces: filterDuration(traces, this.state.selectedTraceIntervalDuration) });
      }
    }
  }

  private refresh = () => {
    this.fetcher.fetch(
      {
        namespace: this.props.namespace,
        target: this.props.target,
        targetKind: this.props.targetKind,
        spanLimit: Number(this.state.selectedLimitSpans),
        tags: buildTags(this.state.showErrors, this.state.selectedStatusCode)
      },
      this.state.traces
    );
  };

  private onTracesUpdated = (traces: JaegerTrace[], jaegerServiceName: string) => {
    const filtered = filterDuration(traces, this.state.selectedTraceIntervalDuration);
    const durations = this.getIntervalTraceDurations(filtered);
    const newState: Partial<TracesState> = {
      traces: filtered,
      traceIntervalDurations: durations
    };
    if (this.state.targetApp === undefined && jaegerServiceName) {
      newState.targetApp = jaegerServiceName;
    }
    this.setState(newState as TracesState);
  };

  private setErrorTraces = (value: string) => {
    this.fetcher.resetLastFetchTime();
    this.setState({ showErrors: value === 'Error traces' }, this.refresh);
  };

  private saveValue = (key: URLParam, value: string) => {
    sessionStorage.setItem(key, value);
    HistoryManager.setParam(key, value);
  };

  private removeValue = (key: URLParam) => {
    sessionStorage.removeItem(key);
    HistoryManager.deleteParam(key);
  };

  private getJaegerUrl = () => {
    if (this.props.urlJaeger === '' || !this.state.targetApp) {
      return undefined;
    }

    const range = getTimeRangeMicros();
    let url = `${this.props.urlJaeger}/search?service=${this.state.targetApp}&start=${range.from}&limit=${this.state.selectedLimitSpans}`;
    if (range.to) {
      url += `&end=${range.to}`;
    }
    const tags = buildTags(this.state.showErrors, this.state.selectedStatusCode);
    if (tags) {
      url += `&tags=${tags}`;
    }
    return url;
  };

  private handleStatusCode = (value: string) => {
    this.fetcher.resetLastFetchTime();
    this.saveValue(URLParam.JAEGER_STATUS_CODE, value);
    this.setState({ selectedStatusCode: value }, this.refresh);
  };

  private handleIntervalDuration = (key: string) => {
    if (key === 'none') {
      this.removeValue(URLParam.JAEGER_TRACE_INTERVAL_SELECTED);
    } else {
      this.saveValue(URLParam.JAEGER_TRACE_INTERVAL_SELECTED, key);
    }
    const refiltered = filterDuration(this.state.traces, key);
    this.setState({ selectedTraceIntervalDuration: key, traces: refiltered });
  };

  private handleLimit = (value: string) => {
    this.fetcher.resetLastFetchTime();
    if (value) {
      this.saveValue(URLParam.JAEGER_LIMIT_TRACES, value);
    } else {
      this.removeValue(URLParam.JAEGER_LIMIT_TRACES);
    }
    this.setState({ selectedLimitSpans: value }, this.refresh);
  };

  private getIntervalTraceDurations = (traces: JaegerTrace[]) => {
    let maxDuration = Math.max.apply(
      Math,
      traces.map(trace => trace.duration)
    );
    let intervals: { [key: string]: string } = { none: 'none' };
    let i = 0;
    let unit = traceDurationUnits[Object.keys(traceDurationUnits)[i]];
    while (maxDuration >= 1000 && Object.keys(traceDurationUnits).length > i) {
      i += 1;
      maxDuration /= 1000;
      unit = traceDurationUnits[Object.keys(traceDurationUnits)[i]];
    }
    const divisions = [5, 10, 20];
    i = 0;
    while (~~(maxDuration / divisions[i]) >= 5 && divisions.length > i) {
      i += 1;
    }
    for (let step = 0; step <= maxDuration; step += divisions[i]) {
      let to = step + divisions[i] <= maxDuration ? step + divisions[i] - 1 : step + divisions[i];
      if (!Number.isNaN(to)) {
        intervals[step + '-' + to + '-' + unit] = `${step}-${to} ${unit}`;
      }
    }
    return intervals;
  };

  render() {
    const jaegerURL = this.getJaegerUrl();
    return (
      <>
        {this.renderActions()}
        <RenderComponentScroll>
          <Grid style={{ padding: '10px' }} gutter="md">
            <GridItem span={12}>
              <Card>
                <CardBody>
                  <RenderHeader>
                    <Toolbar>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <Text
                            component={TextVariants.h5}
                            style={{ display: '-webkit-inline-box', marginRight: '10px' }}
                          >
                            Interval Trace
                          </Text>
                          <ToolbarDropdown
                            options={this.state.traceIntervalDurations}
                            value={this.state.traceIntervalDurations[this.state.selectedTraceIntervalDuration]}
                            handleSelect={key => this.handleIntervalDuration(key)}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <Text
                            component={TextVariants.h5}
                            style={{ display: '-webkit-inline-box', marginRight: '10px' }}
                          >
                            Limit Results
                          </Text>
                          <ToolbarDropdown
                            options={config.tracing.configuration.limitResults}
                            value={config.tracing.configuration.limitResults[this.state.selectedLimitSpans]}
                            handleSelect={key => this.handleLimit(key)}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <Text
                            component={TextVariants.h5}
                            style={{ display: '-webkit-inline-box', marginRight: '10px' }}
                          >
                            Status Code
                          </Text>
                          <ToolbarDropdown
                            options={config.tracing.configuration.statusCode}
                            value={config.tracing.configuration.statusCode[this.state.selectedStatusCode]}
                            handleSelect={key => this.handleStatusCode(key)}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <Text
                            component={TextVariants.h5}
                            style={{ display: '-webkit-inline-box', marginRight: '10px' }}
                          >
                            Display
                          </Text>
                          <ToolbarDropdown
                            options={{ 'All traces': 'All traces', 'Error traces': 'Error traces' }}
                            value={this.state.showErrors ? 'Error traces' : 'All traces'}
                            handleSelect={key => this.setErrorTraces(key)}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <Checkbox
                            label="Adjust time"
                            isChecked={this.state.fixedTime}
                            onChange={checked => {
                              this.setState({ fixedTime: checked });
                            }}
                            aria-label="adjust-time-chart"
                            id="check-adjust-time"
                            name="check-adjust-time"
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                      {jaegerURL && (
                        <ToolbarGroup style={{ marginLeft: 'auto' }}>
                          <ToolbarItem>
                            <Tooltip content={<>Open Chart in Jaeger UI</>}>
                              <a
                                href={jaegerURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ marginLeft: '10px' }}
                              >
                                View in Tracing <ExternalLinkAltIcon />
                              </a>
                            </Tooltip>
                          </ToolbarItem>
                        </ToolbarGroup>
                      )}
                    </Toolbar>
                  </RenderHeader>
                  <JaegerScatter
                    fixedTime={this.state.fixedTime}
                    traces={this.state.traces}
                    errorFetchTraces={this.state.jaegerErrors}
                    errorTraces={true}
                  />
                </CardBody>
              </Card>
            </GridItem>
            <GridItem span={12}>
              <TraceDetails
                namespace={this.props.namespace}
                target={this.props.target}
                targetKind={this.props.targetKind}
                jaegerURL={this.props.urlJaeger}
                otherTraces={this.state.traces}
              />
            </GridItem>
            <GridItem span={12}>
              <SpanDetails namespace={this.props.namespace} target={this.props.target} />
            </GridItem>
          </Grid>
        </RenderComponentScroll>
      </>
    );
  }

  private renderActions = (): JSX.Element => {
    return (
      <RightActionBar>
        <TimeRangeComponent onChanged={this.refresh} allowCustom={false} tooltip={'Time range'} />
        <RefreshContainer id="traces-refresh" handleRefresh={this.refresh} hideLabel={true} />
      </RightActionBar>
    );
  };
}

const filterDuration = (traces: JaegerTrace[], intervalDuration: string): JaegerTrace[] => {
  if (intervalDuration === 'none') {
    return traces;
  }
  const duration = intervalDuration.split('-');
  const index = Object.keys(traceDurationUnits).findIndex(el => el === duration[2]);
  const min = Number(duration[0]) * Math.pow(1000, index);
  const max = Number(duration[1]) * Math.pow(1000, index);
  return traces.filter(trace => trace.duration >= min && trace.duration <= max);
};

const mapStateToProps = (state: KialiAppState) => {
  return {
    urlJaeger: state.jaegerState.info ? state.jaegerState.info.url : '',
    namespaceSelector: state.jaegerState.info ? state.jaegerState.info.namespaceSelector : true,
    selectedTrace: state.jaegerState.selectedTrace
  };
};

export const TracesContainer = connect(mapStateToProps)(TracesComponent);

export default TracesContainer;
