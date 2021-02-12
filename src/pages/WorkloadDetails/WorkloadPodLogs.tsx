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
import { Pod, LogEntry } from '../../types/IstioObjects';
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

export interface WorkloadPodLogsProps {
  namespace: string;
  pods: Pod[];
  timeRange: TimeRange;
  lastRefreshAt: TimeInMilliseconds;
}

// const NoAppContainer = 'n/a';

interface Container {
  displayName: string;
  isProxy: boolean;
  isSelected: boolean;
  name: string;
}

type TextAreaPosition = 'left' | 'right' | 'top' | 'bottom';

interface WorkloadPodLogsState {
  containers?: Container[];
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
  '10': '10 lines',
  '50': '50 lines',
  '100': '100 lines',
  '300': '300 lines',
  '500': '500 lines',
  '1000': '1000 lines',
  '5000': '5000 lines'
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

const toolbarSmallSpace = style({
  marginLeft: '0.5em'
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

const logsTextarea = (enabled = true, position: TextAreaPosition = 'top', _hasTitle = true) =>
  style(logTextAreaBackground(enabled), {
    width: `${['top', 'bottom'].includes(position) ? '100%' : 'calc(100% - 10px)'}`,
    height: `calc(var(--kiali-details-pages-tab-content-height) - 185px)`,
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
    const containers = this.getContainers(pod);

    this.state = {
      ...defaultState,
      containers: containers,
      podValue: podValue
    };
  }

  componentDidMount() {
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
            <Grid style={{ height: '100%' }}>
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

  private getContainerLegend = () => {
    const containers = this.state.containers!.map(c => {
      return { name: c.displayName };
    });
    return <VictoryLegend orientation="horizontal" height={34} gutter={20} data={containers} />;
  };

  private getAppDiv = () => {
    // const title = this.state.containerInfo!.containerOptions[this.state.containerInfo!.container];
    return (
      <div id="appLogDiv" className={appLogsDivHorizontal}>
        <Toolbar className={toolbarTitle()}>
          <ToolbarGroup>
            <ToolbarItem className={logsTitle(this.isFullscreen())}>{this.getContainerLegend()}</ToolbarItem>
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

        <div id="appLogTextArea" className={logsTextarea(this.hasEntries(this.state.filteredLogs))} ref={this.logsRef}>
          {this.hasEntries(this.state.filteredLogs)
            ? this.state.filteredLogs.map(le => (
                <>
                  <b>${le.message}</b>
                  <br />
                </>
              ))
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

  /*
  private setContainer = (container: string) => {
    this.setState({
      containerInfo: { container: container, containerOptions: this.state.containerInfo!.containerOptions }
    });
  };
  */

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

  private getContainers = (pod: Pod): Container[] => {
    let podContainers = pod.containers || [];
    let containers = podContainers.map(c => {
      const name = c.name;
      const version = pod.appLabel && pod.labels ? pod.labels[serverConfig.istioLabels.versionLabelName] : undefined;
      const displayName = !version ? name : `${name}-${version}`;

      return { name: name, displayName: displayName, isProxy: false, isSelected: true };
    });

    podContainers = pod.istioContainers || [];
    containers.push(
      ...podContainers.map(c => {
        const name = c.name;
        const displayName = c.name;

        return { name: name, displayName: displayName, isProxy: true, isSelected: true };
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

    const containerPromises = containers
      .filter(c => c.isSelected)
      .map(c => {
        return getPodLogs(namespace, podName, c.name, tailLines, sinceTime, duration, c.isProxy);
      });

    this.promises
      .registerAll('logs', containerPromises)
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
