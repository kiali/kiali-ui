import * as React from 'react';
import { RenderComponentScroll, RenderHeader } from '../../components/Nav/Page';
import ToolbarDropdown from '../../components/ToolbarDropdown/ToolbarDropdown';
import { Button, Card, CardBody, Checkbox, Grid, GridItem, Text, TextVariants, Tooltip } from '@patternfly/react-core';
import { KialiAppState } from '../../store/Store';
import { connect } from 'react-redux';
import { JaegerErrors, JaegerTrace } from '../../types/JaegerInfo';
import { JaegerItem } from '../../components/JaegerIntegration/JaegerResults';
import { JaegerScatter } from '../../components/JaegerIntegration/JaegerScatter';
import { PfColors } from '../../components/Pf/PfColors';
import { JaegerSearchOptions, convTagsLogfmt } from '../../components/JaegerIntegration/RouteHelper';
import { HistoryManager, URLParam } from '../../app/History';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { serverConfig, config } from '../../config';

interface ServiceTracesProps {
  namespace: string;
  service: string;
  urlJaeger: string;
  namespaceSelector: boolean;
  errorTags?: boolean;
  duration: number;
  traces: JaegerTrace[];
  errorTraces?: JaegerErrors[];
  selectedTrace?: JaegerTrace;
  selectedErrorTrace?: JaegerErrors[];
  onRefresh: (clean?: boolean, traceId?: string) => void;
}

interface ServiceTracesState {
  url: string;
  width: number;
  errorTraces: boolean;
  fixedTime: boolean;
  options: JaegerSearchOptions;
  maxTraceDuration: number;
  unitDuration: string;
  durationsTypes: { [key: string]: string };
  spanIntervalDuration: { [key: string]: string };
  selectedSpanDuration: string;
  selectedStatusCode: string;
  selectedLimitSpans: string;
}

const spanDurationUnits: { [key: string]: string } = {
  us: 'us',
  ms: 'ms',
  s: 's'
};

class ServiceTracesC extends React.Component<ServiceTracesProps, ServiceTracesState> {
  constructor(props: ServiceTracesProps) {
    super(props);
    let limit =
      HistoryManager.getParam(URLParam.JAEGER_LIMIT_TRACES) ||
      sessionStorage.getItem(URLParam.JAEGER_LIMIT_TRACES) ||
      '20';
    let tags = '';
    const statusCode =
      HistoryManager.getParam(URLParam.JAEGER_STATUS_CODE) ||
      sessionStorage.getItem(URLParam.JAEGER_STATUS_CODE) ||
      'none';
    if (this.props.errorTags) {
      tags += 'error=true';
    }
    if (statusCode !== 'none') {
      tags += ' http.status_code=' + statusCode;
    }
    HistoryManager.setParam(URLParam.JAEGER_TAGS, convTagsLogfmt(tags));
    const span =
      HistoryManager.getParam(URLParam.JAEGER_SPAN_INTERVAL_SELECTED) ||
      sessionStorage.getItem(URLParam.JAEGER_SPAN_INTERVAL_SELECTED) ||
      'none';

    this.state = {
      url: '',
      width: 0,
      maxTraceDuration: 0,
      unitDuration: 'us',
      fixedTime: true,
      errorTraces: this.props.errorTags || false,
      options: {
        limit: limit,
        tags: tags,
        minDuration: HistoryManager.getParam(URLParam.JAEGER_MIN_DURATION) || '',
        maxDuration: HistoryManager.getParam(URLParam.JAEGER_MAX_DURATION) || ''
      },
      durationsTypes: { max: '', min: '' },
      spanIntervalDuration: { none: 'none' },
      selectedSpanDuration: span,
      selectedStatusCode: statusCode,
      selectedLimitSpans: limit
    };
    this.props.onRefresh();
  }

  componentDidUpdate(prevProps: ServiceTracesProps) {
    if (prevProps.traces !== this.props.traces) {
      this.getIntervalSpanDurations();
    }
  }

  setErrorTraces = () => {
    const errorTraces = !this.state.errorTraces;
    this.setState({ errorTraces: !this.state.errorTraces });
    let tags = this.state.options.tags || '';
    if (errorTraces) {
      tags === '' ? (tags = 'error=true') : (tags += ' error=true');
    } else {
      tags = tags.replace(/ ?error=true/, '');
    }
    this.onOptionsChange('JAEGER_TAGS', tags);
    this.props.onRefresh();
  };

  saveValue = (key: string, value: string) => {
    sessionStorage.setItem(URLParam[key], value);
    HistoryManager.setParam(URLParam[key], value);
  };

  removeValue = (key: string) => {
    sessionStorage.removeItem(URLParam[key]);
    HistoryManager.deleteParam(URLParam[key]);
  };

  onOptionsChange = (key: string, value: string) => {
    let options = this.state.options;
    options[URLParam[key]] = value;
    value !== ''
      ? key !== 'JAEGER_TAGS'
        ? this.saveValue(key, value)
        : this.saveValue(key, convTagsLogfmt(value))
      : this.removeValue(key);
    this.setState({ options: options });
  };

  getJaegerUrl = () => {
    const service =
      this.props.namespaceSelector && serverConfig.istioNamespace !== this.props.namespace
        ? `${this.props.service}.${this.props.namespace}`
        : `${this.props.service}`;
    const variables = [
      URLParam.JAEGER_MAX_DURATION,
      URLParam.JAEGER_START_TIME,
      URLParam.JAEGER_END_TIME,
      URLParam.JAEGER_MIN_DURATION,
      URLParam.JAEGER_TAGS,
      URLParam.JAEGER_LIMIT_TRACES
    ];
    let url = `${this.props.urlJaeger}/search?service=${service}`;
    variables.forEach(query => {
      const value = HistoryManager.getParam(query);
      if (value) {
        url += `&${query}=${value}`;
      }
    });
    return url;
  };

  handleStatusCode = (key: string) => {
    this.setState({ selectedStatusCode: key });
    this.saveValue('JAEGER_STATUS_CODE', key);
    let tags = this.state.options.tags || '';
    if (key === 'none') {
      tags = tags.replace(/ ?http\.status_code=[0-9][0-9][0-9]/, '');
    } else {
      const new_tag = `http.status_code=${key}`;
      tags.includes('http.status_code')
        ? (tags = tags.replace(/http\.status_code=[0-9][0-9][0-9]/, new_tag))
        : tags === ''
        ? (tags = new_tag)
        : (tags += ' ' + new_tag);
    }
    this.onOptionsChange('JAEGER_TAGS', tags);
    this.props.onRefresh();
  };

  handleSpanDuration = (key: string) => {
    this.saveValue('JAEGER_SPAN_INTERVAL_SELECTED', key);
    if (key !== 'none') {
      let selected = this.state.spanIntervalDuration[key].split(' ');
      const unit = selected[1];
      const minMax = selected[0].split('-');
      const min = minMax[0] + unit;
      const max = minMax[1] + unit;
      this.setState({ durationsTypes: { min: min, max: max }, selectedSpanDuration: key });
      this.onOptionsChange('JAEGER_MIN_DURATION', min);
      this.onOptionsChange('JAEGER_MAX_DURATION', max);
    } else {
      HistoryManager.deleteParam(URLParam['JAEGER_MAX_DURATION']);
      HistoryManager.deleteParam(URLParam['JAEGER_MIN_DURATION']);
      this.setState({ selectedSpanDuration: key });
    }
    this.props.onRefresh();
  };

  handleLimitDuration = (key: string) => {
    this.setState({ selectedLimitSpans: key });
    this.onOptionsChange('JAEGER_LIMIT_TRACES', key);
    this.props.onRefresh();
  };

  getIntervalSpanDurations = () => {
    let maxDuration = Math.max.apply(
      Math,
      this.props.traces.map(trace => Math.max.apply(Math, trace.spans.map(span => span.duration)))
    );
    let intervals: { [key: string]: string } = { none: 'none' };
    let i = 0;
    let unit = spanDurationUnits[Object.keys(spanDurationUnits)[i]];
    while (maxDuration >= 1000 && Object.keys(spanDurationUnits).length > i) {
      i += 1;
      maxDuration /= 1000;
      unit = spanDurationUnits[Object.keys(spanDurationUnits)[i]];
    }
    const divisions = [5, 10, 20];
    i = 0;
    while (~~(maxDuration / divisions[i]) >= 5 && divisions.length > i) {
      i += 1;
    }
    for (let step = 0; step <= maxDuration; step += divisions[i]) {
      let to = step + divisions[i] <= maxDuration ? step + divisions[i] - 1 : step + divisions[i];
      if (!Number.isNaN(to)) {
        intervals[step + '-' + to] = `${step}-${to} ${unit}`;
      }
    }
    this.setState({ maxTraceDuration: maxDuration, unitDuration: unit, spanIntervalDuration: intervals });
  };

  render() {
    return (
      <RenderComponentScroll>
        <Grid style={{ padding: '20px' }}>
          <GridItem span={12}>
            <Card>
              <CardBody>
                <RenderHeader>
                  <Grid>
                    <GridItem span={2}>
                      <Text component={TextVariants.h5} style={{ display: '-webkit-inline-box', marginRight: '10px' }}>
                        Interval Span
                      </Text>
                      <ToolbarDropdown
                        options={this.state.spanIntervalDuration}
                        value={this.state.spanIntervalDuration[this.state.selectedSpanDuration]}
                        handleSelect={key => this.handleSpanDuration(key)}
                      />
                    </GridItem>
                    <GridItem span={2}>
                      <Text component={TextVariants.h5} style={{ display: '-webkit-inline-box', marginRight: '10px' }}>
                        Limit Results
                      </Text>
                      <ToolbarDropdown
                        options={config.tracing.configuration.limitResults}
                        value={config.tracing.configuration.limitResults[this.state.selectedLimitSpans]}
                        handleSelect={key => this.handleLimitDuration(key)}
                      />
                    </GridItem>
                    <GridItem span={2}>
                      <Text
                        component={TextVariants.h5}
                        style={{ display: '-webkit-inline-box', marginLeft: '-40px', marginRight: '10px' }}
                      >
                        Status Code
                      </Text>
                      <ToolbarDropdown
                        options={config.tracing.configuration.statusCode}
                        value={config.tracing.configuration.statusCode[this.state.selectedStatusCode]}
                        handleSelect={key => this.handleStatusCode(key)}
                      />
                    </GridItem>
                    <GridItem span={2}>
                      <div style={{ marginTop: '10px' }}>
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
                      </div>
                    </GridItem>
                    <GridItem span={2} />
                    <GridItem span={2}>
                      <Tooltip content={<>{!this.state.errorTraces ? 'Show Error Traces' : 'Show All Traces'}</>}>
                        <Button
                          variant="tertiary"
                          onClick={() => this.setErrorTraces()}
                          style={this.state.errorTraces ? { backgroundColor: PfColors.Blue100 } : {}}
                        >
                          {!this.state.errorTraces ? 'Errors' : 'All'}
                        </Button>
                      </Tooltip>
                      {this.props.urlJaeger !== '' && (
                        <Tooltip content={<>Open Chart in Jaeger UI</>}>
                          <Button
                            variant="link"
                            onClick={() => window.open(this.getJaegerUrl(), '_blank')}
                            style={{ marginLeft: '10px' }}
                          >
                            View in Tracing <ExternalLinkAltIcon />
                          </Button>
                        </Tooltip>
                      )}
                    </GridItem>
                  </Grid>
                </RenderHeader>
                <Grid style={{ margin: '20px' }}>
                  <GridItem span={12}>
                    <JaegerScatter
                      fixedTime={this.state.fixedTime}
                      traces={this.props.traces}
                      errorFetchTraces={this.props.errorTraces}
                      onClick={traceId => this.props.onRefresh(true, traceId)}
                      errorTraces={true}
                    />
                  </GridItem>
                  <GridItem span={12}>
                    {this.props.selectedTrace && (
                      <JaegerItem
                        trace={this.props.selectedTrace}
                        namespace={this.props.namespace}
                        service={this.props.service}
                        maxTraceDuration={this.state.maxTraceDuration}
                        jaegerURL={this.props.urlJaeger}
                      />
                    )}
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </RenderComponentScroll>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => {
  return {
    urlJaeger: state.jaegerState ? state.jaegerState.jaegerURL : '',
    namespaceSelector: state.jaegerState ? state.jaegerState.namespaceSelector : true
  };
};

export const ServiceTraces = connect(mapStateToProps)(ServiceTracesC);

export default ServiceTraces;
