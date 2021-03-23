import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Grid,
  GridItem,
  Switch,
  TextInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
  TooltipPosition,
  Badge
} from '@patternfly/react-core';
import { style } from 'typestyle';
import { Pod, LogEntry, AccessLog } from '../../types/IstioObjects';
import { getPodLogs } from '../../services/Api';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import { ToolbarDropdown } from '../../components/ToolbarDropdown/ToolbarDropdown';
import { TimeRange, evalTimeRange, TimeInMilliseconds, isEqualTimeRange } from '../../types/Common';
import { RenderComponentScroll } from '../../components/Nav/Page';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { KialiIcon, defaultIconStyle } from '../../config/KialiIcon';
import screenfull, { Screenfull } from 'screenfull';
import { serverConfig } from 'config';
import { KialiAppState } from '../../store/Store';
import { connect } from 'react-redux';
import { timeRangeSelector } from '../../store/Selectors';
import { VictoryLegend } from 'victory';
import { PfColors, PFColorVal } from 'components/Pf/PfColors';

const appContainerColors = [PfColors.White, PfColors.LightGreen, PfColors.LightBlue, PfColors.Purple100];
const proxyContainerColor = PfColors.Gold;

export interface WorkloadPodLogsProps {
  namespace: string;
  pods: Pod[];
  timeRange: TimeRange;
  lastRefreshAt: TimeInMilliseconds;
}

interface Container {
  color: PFColorVal;
  displayName: string;
  isProxy: boolean;
  isSelected: boolean;
  name: string;
}

interface WorkloadPodLogsState {
  containers?: Container[];
  filteredLogs: LogEntry[];
  fullscreen: boolean;
  hideError?: string;
  hideLogValue: string;
  loadingLogs: boolean;
  loadingLogsError?: string;
  logWindowSelections: any[];
  podValue?: number;
  rawLogs: LogEntry[];
  showClearHideLogButton: boolean;
  showClearShowLogButton: boolean;
  showError?: string;
  showLogValue: string;
  showTimestamps: boolean;
  tailLines: number;
  useRegex: boolean;
}

const RETURN_KEY_CODE = 13;
const NoLogsFoundMessage = 'No container logs found for the time period.';

const TailLinesDefault = 100;
const TailLinesOptions = {
  '-1': 'All lines',
  '10': '10 lines',
  '50': '50 lines',
  '100': '100 lines',
  '300': '300 lines',
  '500': '500 lines',
  '1000': '1000 lines',
  '5000': '5000 lines'
};

const alFieldName = style({
  color: PfColors.Gold,
  display: 'inline-block'
});

const alInfoIcon = style({
  display: 'inline-block',
  margin: '0px 5px 0px 0px',
  width: '10px'
});

const displayFlex = style({
  display: 'flex'
});

const infoIcons = style({
  marginLeft: '0.5em',
  width: '24px'
});

const toolbar = style({
  margin: '0 0 10px 0'
});

const toolbarSpace = style({
  marginLeft: '1em'
});

const toolbarSmallSpace = style({
  marginLeft: '0.5em'
});

const toolbarRight = style({
  marginLeft: 'auto'
});

const toolbarTail = style({
  marginTop: '2px'
});

const toolbarTitle = style({
  height: '36px',
  margin: '0 10px 0 0'
});

const logsDiv = style({
  marginRight: '5px'
});

const logsTextBackground = (enabled: boolean) => ({ backgroundColor: enabled ? '#003145' : 'gray' });
const logsTextHeight = (fullscreen: boolean) => ({
  height: fullscreen ? `calc(100vh - 145px)` : `calc(var(--kiali-details-pages-tab-content-height) - 160px)`
});

const logsText = (enabled = true, fullscreen = false) =>
  style(logsTextBackground(enabled), logsTextHeight(fullscreen), {
    width: '100%',
    overflow: 'auto',
    resize: 'none',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '11pt',
    margin: 0,
    padding: '10px',
    whiteSpace: 'pre'
  });

class WorkloadPodLogs extends React.Component<WorkloadPodLogsProps, WorkloadPodLogsState> {
  private promises: PromisesRegistry = new PromisesRegistry();
  private podOptions: string[] = [];
  private readonly logsRef: React.RefObject<any>;

  constructor(props: WorkloadPodLogsProps) {
    super(props);
    this.logsRef = React.createRef();

    const defaultState = {
      filteredLogs: [],
      fullscreen: false,
      hideLogValue: '',
      loadingLogs: false,
      logWindowSelections: [],
      rawLogs: [],
      showClearHideLogButton: false,
      showClearShowLogButton: false,
      showLogValue: '',
      showTimestamps: false,
      tailLines: TailLinesDefault,
      useRegex: false
    };
    if (this.props.pods.length < 1) {
      this.state = {
        ...defaultState,
        loadingLogsError: 'There are no logs to display because no pods are available.'
      };
      return;
    }

    if (this.props.pods.length > 0) {
      for (let i = 0; i < this.props.pods.length; ++i) {
        this.podOptions[`${i}`] = this.props.pods[i].name;
      }
    }

    const podValue = 0;
    const pod = this.props.pods[podValue];
    const containers = this.getContainers(pod);

    this.state = {
      ...defaultState,
      containers: containers,
      podValue: podValue
    };
  }

  componentDidMount() {
    const screenFullAlias = screenfull as Screenfull;
    screenFullAlias.onchange(() => this.setState({ fullscreen: !this.state.fullscreen }));

    if (this.state.containers) {
      const pod = this.props.pods[this.state.podValue!];
      this.fetchLogs(this.props.namespace, pod.name, this.state.containers, this.state.tailLines, this.props.timeRange);
    }
  }

  componentDidUpdate(prevProps: WorkloadPodLogsProps, prevState: WorkloadPodLogsState) {
    const prevContainers = prevState.containers ? prevState.containers : undefined;
    const newContainers = this.state.containers ? this.state.containers : undefined;
    const updateContainerInfo = this.state.containers && this.state.containers !== prevState.containers;
    const updateContainer = newContainers && newContainers !== prevContainers;
    const updateTailLines = this.state.tailLines && prevState.tailLines !== this.state.tailLines;
    const lastRefreshChanged = prevProps.lastRefreshAt !== this.props.lastRefreshAt;
    const timeRangeChanged = !isEqualTimeRange(this.props.timeRange, prevProps.timeRange);
    if (updateContainerInfo || updateContainer || updateTailLines || lastRefreshChanged || timeRangeChanged) {
      const pod = this.props.pods[this.state.podValue!];
      this.fetchLogs(this.props.namespace, pod.name, newContainers!, this.state.tailLines, this.props.timeRange);
    }
    this.logsRef.current.scrollTop = this.logsRef.current.scrollHeight;

    if (prevState.useRegex !== this.state.useRegex) {
      this.doShowAndHide();
    }
  }

  componentWillUnmount() {
    this.promises.cancelAll();
  }

  renderItem = object => {
    return <ToolbarItem className={displayFlex}>{object}</ToolbarItem>;
  };

  render() {
    return (
      <>
        <RenderComponentScroll>
          {this.state.containers && (
            <Grid id="logsPage" style={{ height: '100%' }}>
              <GridItem span={12}>
                <Card style={{ height: '100%' }}>
                  <CardBody>
                    <Toolbar className={toolbar}>
                      <ToolbarGroup>
                        <Tooltip position={TooltipPosition.top} content={<>Pod</>}>
                          <Badge className="virtualitem_badge_definition">P</Badge>
                        </Tooltip>
                        <ToolbarItem className={displayFlex}>
                          <ToolbarDropdown
                            id={'wpl_pods'}
                            tooltip="Display logs for the selected pod"
                            handleSelect={key => this.setPod(key)}
                            value={this.state.podValue}
                            label={this.props.pods[this.state.podValue!].name}
                            options={this.podOptions!}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <TextInput
                            id="log_show"
                            name="log_show"
                            style={{ width: '8em' }}
                            isValid={!this.state.showError}
                            autoComplete="on"
                            type="text"
                            onKeyPress={this.checkSubmitShow}
                            onChange={this.updateShow}
                            defaultValue={this.state.showLogValue}
                            aria-label="show log text"
                            placeholder="Show..."
                          />
                          {this.state.showClearShowLogButton && (
                            <Tooltip key="clear_show_log" position="top" content="Clear Show Log Entries...">
                              <Button variant={ButtonVariant.control} onClick={this.clearShow}>
                                <KialiIcon.Close />
                              </Button>
                            </Tooltip>
                          )}
                          <TextInput
                            id="log_hide"
                            name="log_hide"
                            style={{ width: '8em' }}
                            isValid={!this.state.hideError}
                            autoComplete="on"
                            type="text"
                            onKeyPress={this.checkSubmitHide}
                            onChange={this.updateHide}
                            defaultValue={this.state.hideLogValue}
                            aria-label="hide log text"
                            placeholder="Hide..."
                          />
                          {this.state.showClearHideLogButton && (
                            <Tooltip key="clear_hide_log" position="top" content="Clear Hide Log Entries...">
                              <Button variant={ButtonVariant.control} onClick={this.clearHide}>
                                <KialiIcon.Close />
                              </Button>
                            </Tooltip>
                          )}
                          {this.state.showError && <div style={{ color: 'red' }}>{this.state.showError}</div>}
                          {this.state.hideError && <div style={{ color: 'red' }}>{this.state.hideError}</div>}
                        </ToolbarItem>
                        <ToolbarItem>
                          <Tooltip
                            key="show_hide_log_help"
                            position="top"
                            content="Show only lines containing a substring. Hide all lines containing a substring. Case sensitive."
                          >
                            <KialiIcon.Info className={infoIcons} />
                          </Tooltip>
                        </ToolbarItem>
                        <ToolbarItem className={toolbarSmallSpace}>
                          <Tooltip
                            key="show_hide_regex_help"
                            position="top"
                            content="Use regular expression matching for Show/Hide"
                          >
                            <Button
                              variant={ButtonVariant.link}
                              isBlock={this.state.useRegex}
                              onClick={this.handleRegexChange}
                              isInline
                            >
                              <KialiIcon.Regex className={defaultIconStyle} />
                            </Button>
                          </Tooltip>
                        </ToolbarItem>
                      </ToolbarGroup>
                      <ToolbarGroup>
                        <ToolbarItem className={toolbarSpace}>
                          <Switch
                            id="timestamps-switch"
                            label="Timestamps"
                            isChecked={this.state.showTimestamps}
                            onChange={this.handleTimestampsChange}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                      <ToolbarGroup className={toolbarRight}>
                        <ToolbarItem className={displayFlex}>
                          <ToolbarDropdown
                            id={'wpl_tailLines'}
                            handleSelect={key => this.setTailLines(Number(key))}
                            value={this.state.tailLines}
                            label={TailLinesOptions[this.state.tailLines]}
                            options={TailLinesOptions}
                            tooltip={'Show up to last N log lines'}
                            classNameSelect={toolbarTail}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                    </Toolbar>
                    {this.getLogsDiv()}
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          )}
          {this.state.loadingLogsError && <div>{this.state.loadingLogsError}</div>}
        </RenderComponentScroll>
      </>
    );
  }

  private getContainerLegend = () => {
    const data = this.state.containers!.map(c => {
      return { name: c.displayName };
    });
    const colorScale = this.state.containers!.map(c => {
      return c.color;
    });
    return (
      <VictoryLegend
        orientation="horizontal"
        style={{
          data: { stroke: 'navy', strokeWidth: 2 }
        }}
        colorScale={colorScale}
        height={34}
        gutter={20}
        data={data}
        events={[
          {
            target: 'data',
            eventHandlers: {
              onClick: evt => {
                evt.stopPropagation();
                return [
                  {
                    target: 'data',
                    mutation: props => {
                      const container = this.state.containers![props.datum.column];
                      return !container.isSelected
                        ? null
                        : { style: { stroke: 'navy', strokeWidth: 2, fill: PfColors.Gray } };
                    }
                  },
                  {
                    target: 'labels',
                    mutation: props => {
                      const container = this.state.containers![props.datum.column];
                      container.isSelected = !container.isSelected;
                      this.setState({ containers: [...this.state.containers!] });
                      return container.isSelected ? null : { style: { fill: PfColors.Gray } };
                    }
                  }
                ];
              }
            }
          }
        ]}
      />
    );
  };

  private getLogsDiv = () => {
    return (
      <div id="logsDiv" className={logsDiv}>
        <Toolbar className={toolbarTitle}>
          <ToolbarGroup>
            <ToolbarItem>{this.getContainerLegend()}</ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup className={toolbarRight}>
            <ToolbarItem>
              <Tooltip key="copy_logs" position="top" content="Copy logs to clipboard">
                <CopyToClipboard onCopy={this.copyLogCallback} text={this.entriesToString(this.state.filteredLogs)}>
                  <Button variant={ButtonVariant.link} isInline>
                    <KialiIcon.Copy className={defaultIconStyle} />
                  </Button>
                </CopyToClipboard>
              </Tooltip>
            </ToolbarItem>
            <ToolbarItem className={toolbarSpace}>
              <Tooltip key="fullscreen_logs" position="top" content="Expand logs full screen">
                <Button
                  variant={ButtonVariant.link}
                  onClick={this.toggleFullscreen}
                  isDisabled={!this.hasEntries(this.state.filteredLogs)}
                  isInline
                >
                  <KialiIcon.Expand className={defaultIconStyle} />
                </Button>
              </Tooltip>
            </ToolbarItem>
          </ToolbarGroup>
        </Toolbar>

        <div
          id="logsText"
          className={logsText(this.hasEntries(this.state.filteredLogs), this.state.fullscreen)}
          ref={this.logsRef}
        >
          {this.hasEntries(this.state.filteredLogs)
            ? this.state.filteredLogs.map((le, i) => {
                return !le.accessLog ? (
                  <>
                    <p style={{ color: le.color!, fontSize: '12px' }}>{this.entryToString(le)}</p>
                  </>
                ) : (
                  <div>
                    {this.state.showTimestamps && (
                      <span style={{ color: le.color!, fontSize: '12px', marginRight: '5px' }}>{le.timestamp}</span>
                    )}
                    <Tooltip
                      key={`al-${i}`}
                      position={TooltipPosition.auto}
                      content={this.accessLogContent(le.accessLog)}
                    >
                      <KialiIcon.Info className={alInfoIcon} color={PfColors.Gold} />
                    </Tooltip>
                    <p style={{ color: le.color!, fontSize: '12px', display: 'inline-block' }}>{le.message}</p>
                  </div>
                );
              })
            : NoLogsFoundMessage}
        </div>
      </div>
    );
  };

  private setPod = (podValue: string) => {
    const pod = this.props.pods[Number(podValue)];
    const containerNames = this.getContainers(pod);
    this.setState({ containers: containerNames, podValue: Number(podValue) });
  };

  private setTailLines = (tailLines: number) => {
    this.setState({ tailLines: tailLines });
  };

  private handleTimestampsChange = (isChecked: boolean) => {
    this.setState({ showTimestamps: isChecked });
  };

  private handleRegexChange = () => {
    this.setState({
      useRegex: !this.state.useRegex
    });
  };

  private doShowAndHide = () => {
    const filteredLogs = this.filterLogs(this.state.rawLogs, this.state.showLogValue, this.state.hideLogValue);
    this.setState({
      filteredLogs: filteredLogs,
      showClearShowLogButton: !!this.state.showLogValue,
      showClearHideLogButton: !!this.state.hideLogValue
    });
  };

  private checkSubmitShow = event => {
    const keyCode = event.keyCode ? event.keyCode : event.which;
    if (keyCode === RETURN_KEY_CODE) {
      event.preventDefault();
      this.doShowAndHide();
    }
  };

  private updateShow = val => {
    if ('' === val) {
      this.clearShow();
    } else {
      this.setState({ showLogValue: val });
    }
  };

  private filterLogs = (rawLogs: LogEntry[], showValue: string, hideValue: string): LogEntry[] => {
    let filteredLogs = rawLogs;

    if (!!showValue) {
      if (this.state.useRegex) {
        try {
          const regexp = RegExp(showValue);
          filteredLogs = filteredLogs.filter(le => regexp.test(le.message));
          if (!!this.state.showError) {
            this.setState({ showError: undefined });
          }
        } catch (e) {
          this.setState({ showError: `Show: ${e.message}` });
        }
      } else {
        filteredLogs = filteredLogs.filter(le => le.message.includes(showValue));
      }
    }
    if (!!hideValue) {
      if (this.state.useRegex) {
        try {
          const regexp = RegExp(hideValue);
          filteredLogs = filteredLogs.filter(le => !regexp.test(le.message));
          if (!!this.state.hideError) {
            this.setState({ hideError: undefined });
          }
        } catch (e) {
          this.setState({ hideError: `Hide: ${e.message}` });
        }
      } else {
        filteredLogs = filteredLogs.filter(le => !le.message.includes(hideValue));
      }
    }

    return filteredLogs;
  };

  private clearShow = () => {
    // TODO: when TextInput refs are fixed in PF4 then use the ref and remove the direct HTMLElement usage
    // this.showInputRef.value = '';
    const htmlInputElement: HTMLInputElement = document.getElementById('log_show') as HTMLInputElement;
    if (htmlInputElement !== null) {
      htmlInputElement.value = '';
    }

    this.setState({
      showError: undefined,
      showLogValue: '',
      showClearShowLogButton: false,
      filteredLogs: this.filterLogs(this.state.rawLogs, '', this.state.hideLogValue)
    });
  };

  private checkSubmitHide = event => {
    const keyCode = event.keyCode ? event.keyCode : event.which;
    if (keyCode === RETURN_KEY_CODE) {
      event.preventDefault();
      this.doShowAndHide();
    }
  };

  private updateHide = val => {
    if ('' === val) {
      this.clearHide();
    } else {
      this.setState({ hideLogValue: val });
    }
  };

  private clearHide = () => {
    // TODO: when TextInput refs are fixed in PF4 then use the ref and remove the direct HTMLElement usage
    // this.hideInputRef.value = '';
    const htmlInputElement: HTMLInputElement = document.getElementById('log_hide') as HTMLInputElement;
    if (htmlInputElement !== null) {
      htmlInputElement.value = '';
    }

    this.setState({
      hideError: undefined,
      hideLogValue: '',
      showClearHideLogButton: false,
      filteredLogs: this.filterLogs(this.state.rawLogs, this.state.showLogValue, '')
    });
  };

  private copyLogCallback = (_text: string, _result: boolean) => {
    this.logsRef.current.select();
  };

  private toggleFullscreen = () => {
    const screenFullAlias = screenfull as Screenfull; // this casting was necessary
    if (screenFullAlias.isFullscreen) {
      screenFullAlias.exit();
    } else {
      const element = document.getElementById('logsPage');
      if (screenFullAlias.isEnabled) {
        if (element) {
          screenFullAlias.request(element);
        }
      }
    }
  };

  private getContainers = (pod: Pod): Container[] => {
    // consistently position the proxy container first, if it (they?) exist.
    let podContainers = pod.istioContainers || [];
    let containers = podContainers.map(c => {
      const name = c.name;
      const displayName = c.name;

      return { color: proxyContainerColor, displayName: displayName, isProxy: true, isSelected: true, name: name };
    });

    podContainers = pod.containers || [];
    containers.push(
      ...podContainers.map((c, i) => {
        const name = c.name;
        const version = pod.appLabel && pod.labels ? pod.labels[serverConfig.istioLabels.versionLabelName] : undefined;
        const displayName = !version ? name : `${name}-${version}`;
        const color = appContainerColors[i % appContainerColors.length];

        return { color: color, isProxy: false, isSelected: true, displayName: displayName, name: name };
      })
    );

    return containers;
  };

  private fetchLogs = (
    namespace: string,
    podName: string,
    containers: Container[],
    tailLines: number,
    timeRange: TimeRange
  ) => {
    const now = Date.now();
    const timeRangeDates = evalTimeRange(timeRange);
    const sinceTime = Math.floor(timeRangeDates[0].getTime() / 1000);
    const endTime = timeRangeDates[1].getTime();
    // to save work on the server-side, only supply duration when time range is in the past
    let duration = 0;
    if (endTime < now) {
      duration = Math.floor(timeRangeDates[1].getTime() / 1000) - sinceTime;
    }

    const selectedContainers = containers.filter(c => c.isSelected);
    const containerPromises = selectedContainers.map(c => {
      return getPodLogs(namespace, podName, c.name, tailLines, sinceTime, duration, c.isProxy);
    });

    this.promises
      .registerAll('logs', containerPromises)
      .then(responses => {
        let rawLogs: LogEntry[] = [];

        for (let i = 0; i < responses.length; i++) {
          const response = responses[i];
          const containerRawLogs = response.data.entries as LogEntry[];
          if (!containerRawLogs) {
            continue;
          }
          const color = selectedContainers[i].color;
          containerRawLogs.forEach(le => (le.color = color));
          rawLogs.push(...containerRawLogs);
        }

        const filteredLogs = this.filterLogs(rawLogs, this.state.showLogValue, this.state.hideLogValue);
        const sortedFilteredLogs = filteredLogs.sort((a, b) => {
          return a.timestampUnix - b.timestampUnix;
        });

        this.setState({
          loadingLogs: false,
          rawLogs: rawLogs,
          filteredLogs: sortedFilteredLogs
        });

        this.logsRef.current.scrollTop = this.logsRef.current.scrollHeight;
        return;
      })
      .catch(error => {
        if (error.isCanceled) {
          console.debug('Logs: Ignore fetch error (canceled).');
          this.setState({ loadingLogs: false });
          return;
        }
        const errorMsg = error.response && error.response.data.error ? error.response.data.error : error.message;
        this.setState({
          loadingLogs: false,
          rawLogs: [
            {
              severity: 'Error',
              timestamp: Date.toString(),
              timestampUnix: Date.now(),
              message: `Failed to fetch app logs: ${errorMsg}`
            }
          ]
        });
      });

    this.setState({
      loadingLogs: true,
      rawLogs: []
    });
  };

  private entriesToString = (entries: LogEntry[]): string => {
    return entries.map(le => this.entryToString(le)).join('\n');
  };

  private entryToString = (le: LogEntry): string => {
    return this.state.showTimestamps ? `${le.timestamp} ${le.message}` : le.message;
  };

  private hasEntries = (entries: LogEntry[]): boolean => !!entries && entries.length > 0;

  private accessLogContent = (al: AccessLog): any => {
    return (
      <div style={{ textAlign: 'left' }}>
        {this.accessLogField('authority', al.authority)}
        {this.accessLogField('bytes received', al.bytes_received)}
        {this.accessLogField('bytes sent', al.bytes_sent)}
        {this.accessLogField('downstream local', al.downstream_local)}
        {this.accessLogField('downstream remote', al.downstream_remote)}
        {this.accessLogField('duration', al.duration)}
        {this.accessLogField('forwarded for', al.forwarded_for)}
        {this.accessLogField('method', al.method)}
        {this.accessLogField('protocol', al.protocol)}
        {this.accessLogField('request id', al.request_id)}
        {this.accessLogField('requested server', al.requested_server)}
        {this.accessLogField('response flags', al.response_flags)}
        {this.accessLogField('route name', al.route_name)}
        {this.accessLogField('status code', al.status_code)}
        {this.accessLogField('tcp service time', al.tcp_service_time)}
        {this.accessLogField('timestamp', al.timestamp)}
        {this.accessLogField('upstream cluster', al.upstream_cluster)}
        {this.accessLogField('upstream failure reason', al.upstream_failure_reason)}
        {this.accessLogField('upstream local', al.upstream_local)}
        {this.accessLogField('upstream service', al.upstream_service)}
        {this.accessLogField('upstream service time', al.upstream_service_time)}
        {this.accessLogField('uri param', al.uri_param)}
        {this.accessLogField('uri path', al.uri_path)}
        {this.accessLogField('user agent', al.user_agent)}
      </div>
    );
  };

  private accessLogField = (key: string, val: string): any => {
    return !val ? null : (
      <>
        <span className={alFieldName}>{key}:&nbsp;</span>
        <span>{val}</span>
        <br />
      </>
    );
  };
}

const mapStateToProps = (state: KialiAppState) => {
  return {
    timeRange: timeRangeSelector(state),
    lastRefreshAt: state.globalState.lastRefreshAt
  };
};

const WorkloadPodLogsContainer = connect(mapStateToProps)(WorkloadPodLogs);
export default WorkloadPodLogsContainer;
