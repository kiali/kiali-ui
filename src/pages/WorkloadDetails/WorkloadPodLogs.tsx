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
  Tooltip
} from '@patternfly/react-core';
import { style } from 'typestyle';
import { Pod, PodLogs, LogEntry } from '../../types/IstioObjects';
import { getPodLogs, Response } from '../../services/Api';
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

export interface WorkloadPodLogsProps {
  namespace: string;
  pods: Pod[];
  timeRange: TimeRange;
  lastRefreshAt: TimeInMilliseconds;
}

const NoAppContainer = 'n/a';

interface ContainerInfo {
  container: string;
  containerOptions: { [key: string]: string };
}

type TextAreaPosition = 'left' | 'right' | 'top' | 'bottom';

interface WorkloadPodLogsState {
  containerInfo?: ContainerInfo;
  filteredLogs: LogEntry[];
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
  '10': 'Last 10 lines',
  '50': 'Last 50 lines',
  '100': 'Last 100 lines',
  '300': 'Last 300 lines',
  '500': 'Last 500 lines',
  '1000': 'Last 1000 lines',
  '5000': 'Last 5000 lines'
};

const appLogsDivHorizontal = style({
  height: '90%',
  marginRight: '5px'
});

const displayFlex = style({
  display: 'flex'
});

const infoIcons = style({
  marginLeft: '0.5em',
  width: '24px'
});

const fullscreenTitleBackground = (isFullscreen: boolean) => ({ color: isFullscreen ? 'white' : 'black' });

const logsTitle = (isFullscreen: boolean) =>
  style(fullscreenTitleBackground(isFullscreen), {
    fontWeight: 'bold'
  });

const toolbar = style({
  margin: '0 0 10px 0'
});

const toolbarSpace = style({
  marginLeft: '1em'
});

const toolbarRight = style({
  marginLeft: 'auto'
});

const toolbarTail = style({
  marginTop: '2px'
});

const toolbarTitle = (position: TextAreaPosition = 'top') =>
  style({
    height: '36px',
    margin: `${position === 'right' ? '0 0 0 10px' : '0 10px 0 0'}`
  });

const logTextAreaBackground = (enabled = true) => ({ backgroundColor: enabled ? '#003145' : 'gray' });

const logsTextarea = (enabled = true, position: TextAreaPosition = 'top', hasTitle = true) =>
  style(logTextAreaBackground(enabled), {
    width: `${['top', 'bottom'].includes(position) ? '100%' : 'calc(100% - 10px)'}`,
    height: `calc(100% - ${position === 'top' ? '20px' : '0px'} - ${hasTitle ? '36px' : '0px'})`,
    overflow: 'auto',
    resize: 'none',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '11pt',
    margin: `${position === 'right' ? '0 0 0 10px' : 0}`,
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
    const containerInfo = this.getContainerInfo(pod);

    this.state = {
      ...defaultState,
      containerInfo: containerInfo,
      podValue: podValue
    };
  }

  componentDidMount() {
    if (this.state.containerInfo) {
      const pod = this.props.pods[this.state.podValue!];
      this.fetchLogs(
        this.props.namespace,
        pod.name,
        this.state.containerInfo.container,
        this.state.tailLines,
        this.props.timeRange
      );
    }
  }

  componentDidUpdate(prevProps: WorkloadPodLogsProps, prevState: WorkloadPodLogsState) {
    const prevContainer = prevState.containerInfo ? prevState.containerInfo.container : undefined;
    const newContainer = this.state.containerInfo ? this.state.containerInfo.container : undefined;
    const updateContainerInfo = this.state.containerInfo && this.state.containerInfo !== prevState.containerInfo;
    const updateContainer = newContainer && newContainer !== prevContainer;
    const updateTailLines = this.state.tailLines && prevState.tailLines !== this.state.tailLines;
    const lastRefreshChanged = prevProps.lastRefreshAt !== this.props.lastRefreshAt;
    const timeRangeChanged = !isEqualTimeRange(this.props.timeRange, prevProps.timeRange);
    if (updateContainerInfo || updateContainer || updateTailLines || lastRefreshChanged || timeRangeChanged) {
      const pod = this.props.pods[this.state.podValue!];
      this.fetchLogs(this.props.namespace, pod.name, newContainer!, this.state.tailLines, this.props.timeRange);
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
          {this.state.containerInfo && (
            <Grid style={{ height: '100%' }}>
              <GridItem span={12}>
                <Card style={{ height: '100%' }}>
                  <CardBody>
                    <Toolbar className={toolbar}>
                      <ToolbarGroup>
                        <ToolbarItem className={displayFlex}>
                          <ToolbarDropdown
                            id={'wpl_pods'}
                            nameDropdown="Pod"
                            tooltip="Display logs for the selected pod"
                            handleSelect={key => this.setPod(key)}
                            value={this.state.podValue}
                            label={this.props.pods[this.state.podValue!].name}
                            options={this.podOptions!}
                          />
                        </ToolbarItem>
                        <ToolbarItem className={`${displayFlex} ${toolbarSpace}`}>
                          <ToolbarDropdown
                            id={'wpl_containers'}
                            nameDropdown="Container"
                            tooltip="Choose container for selected pod"
                            handleSelect={key => this.setContainer(key)}
                            value={this.state.containerInfo.container}
                            label={this.state.containerInfo.container}
                            options={this.state.containerInfo.containerOptions!}
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
                    <Toolbar className={toolbar}>
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
                        <ToolbarItem>
                          <TextInput
                            id="log_show"
                            name="log_show"
                            style={{ width: '10em' }}
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
                            style={{ width: '10em' }}
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
                        <ToolbarItem className={toolbarSpace}>
                          <Switch
                            id="regex-switch"
                            label="Activate Regex"
                            isChecked={this.state.useRegex}
                            onChange={this.handleRegexChange}
                          />
                          <Tooltip
                            key="show_log_regex_help"
                            position="top"
                            content="Use Regex instead of substring for more advanced use"
                          >
                            <KialiIcon.Info className={infoIcons} />
                          </Tooltip>
                        </ToolbarItem>
                      </ToolbarGroup>
                    </Toolbar>
                    {this.getAppDiv()}
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

  private getAppDiv = () => {
    const appLogs = this.hasEntries(this.state.filteredLogs)
      ? this.entriesToString(this.state.filteredLogs)
      : NoLogsFoundMessage;
    const title = this.state.containerInfo!.containerOptions[this.state.containerInfo!.container];
    return (
      <div id="appLogDiv" className={appLogsDivHorizontal}>
        <Toolbar className={toolbarTitle()}>
          <ToolbarItem className={logsTitle(this.isFullscreen())}>{title}</ToolbarItem>
          <ToolbarGroup className={toolbarRight}>
            <ToolbarItem>
              <Tooltip key="copy_logs" position="top" content="Copy logs to clipboard">
                <CopyToClipboard onCopy={this.copyLogCallback} text={appLogs}>
                  <Button variant={ButtonVariant.link} isInline>
                    <KialiIcon.Copy className={defaultIconStyle} />
                  </Button>
                </CopyToClipboard>
              </Tooltip>
            </ToolbarItem>
            <ToolbarItem className={toolbarSpace}>
              <Tooltip key="expand_app_logs" position="top" content="Expand App logs full screen">
                <Button
                  variant={ButtonVariant.link}
                  onClick={this.openFullScreenLog}
                  isDisabled={!this.hasEntries(this.state.filteredLogs)}
                  isInline
                >
                  <KialiIcon.Expand className={defaultIconStyle} />
                </Button>
              </Tooltip>
            </ToolbarItem>
          </ToolbarGroup>
        </Toolbar>

        <textarea
          id="appLogTextArea"
          className={logsTextarea(this.hasEntries(this.state.filteredLogs))}
          ref={this.logsRef}
          readOnly={true}
          value={appLogs}
        />
      </div>
    );
  };

  private setPod = (podValue: string) => {
    const pod = this.props.pods[Number(podValue)];
    const containerInfo = this.getContainerInfo(pod);
    this.setState({ containerInfo: containerInfo, podValue: Number(podValue) });
  };

  private setContainer = (container: string) => {
    this.setState({
      containerInfo: { container: container, containerOptions: this.state.containerInfo!.containerOptions }
    });
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

  private makeElementFullScreen = (elementId: string) => {
    const screenFullAlias = screenfull as Screenfull; // this casting was necessary
    const element = document.getElementById(elementId);
    if (screenFullAlias.isEnabled) {
      if (element) {
        screenFullAlias.request(element);
      }
    }
  };

  private isFullscreen = () => {
    const screenFullAlias = screenfull as Screenfull; // this casting was necessary
    return screenFullAlias.isFullscreen;
  };

  private toggleFullscreen = (elementId: string) => {
    const screenFullAlias = screenfull as Screenfull; // this casting was necessary
    if (screenFullAlias.isFullscreen) {
      screenFullAlias.exit();
    } else {
      this.makeElementFullScreen(elementId);
    }
  };

  private openFullScreenLog = () => {
    this.toggleFullscreen('logDiv');
  };

  private getContainerInfo = (pod: Pod): ContainerInfo => {
    let containers = pod.containers ? pod.containers : [];
    containers.push(...(pod.istioContainers ? pod.istioContainers : []));
    containers = containers.filter(c => c.name !== 'istio-proxy');
    const options: { [key: string]: string } = {};

    if (containers.length === 0) {
      options[NoAppContainer] = NoAppContainer;
      return { container: NoAppContainer, containerOptions: options };
    }

    const containerNames = containers.map(c => c.name);
    containerNames.forEach(n => {
      const version = pod.appLabel && pod.labels ? pod.labels[serverConfig.istioLabels.versionLabelName] : undefined;
      options[n] = !!version ? `${n}-${version}` : n;
    });

    return { container: containerNames[0], containerOptions: options };
  };

  private fetchLogs = (
    namespace: string,
    podName: string,
    container: string,
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

    const appPromise: Promise<Response<PodLogs>> =
      container !== NoAppContainer
        ? getPodLogs(namespace, podName, container, tailLines, sinceTime, duration, false)
        : Promise.resolve({ data: { entries: [] } });

    const proxyPromise: Promise<Response<PodLogs>> = getPodLogs(
      namespace,
      podName,
      'istio-proxy',
      tailLines,
      sinceTime,
      duration,
      true
    );

    this.promises
      .registerAll('logs', [appPromise, proxyPromise])
      .then(responses => {
        let rawLogs: LogEntry[] = [];

        console.log(`Log Responses=[${responses.length}]`);

        for (let i = 0; i < responses.length; i++) {
          const response = responses[i];
          const containerRawLogs = response.data.entries as LogEntry[];
          rawLogs.push(...containerRawLogs);
        }

        const filteredLogs = this.filterLogs(rawLogs, this.state.showLogValue, this.state.hideLogValue);
        const sortedFilteredLogs = filteredLogs.sort((a, b) => {
          let aTimestamp = a.timestampUnix;
          let bTimestamp = b.timestampUnix;
          if (a.accessLogEntry !== undefined) {
            console.log(`a.accessLogEntry.timestampUnix=${a.accessLogEntry.timestampUnix}`);
            aTimestamp = a.accessLogEntry.timestampUnix;
          }
          if (b.accessLogEntry !== undefined) {
            console.log(`b.accessLogEntry.timestampUnix=${b.accessLogEntry.timestampUnix}`);
            bTimestamp = b.accessLogEntry.timestampUnix;
          }
          console.log(`a=${aTimestamp}. b=${bTimestamp}`);
          return aTimestamp - bTimestamp;
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
    return entries.map(le => (this.state.showTimestamps ? `${le.timestamp} ${le.message}` : le.message)).join('\n');
  };

  private hasEntries = (entries: LogEntry[]): boolean => !!entries && entries.length > 0;
}

const mapStateToProps = (state: KialiAppState) => {
  return {
    timeRange: timeRangeSelector(state),
    lastRefreshAt: state.globalState.lastRefreshAt
  };
};

const WorkloadPodLogsContainer = connect(mapStateToProps)(WorkloadPodLogs);
export default WorkloadPodLogsContainer;
