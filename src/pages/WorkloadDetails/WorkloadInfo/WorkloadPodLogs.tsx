import * as React from 'react';
import { Button, Icon, Table, Toolbar } from 'patternfly-react';
import { Pod, PodLogs } from '../../../types/IstioObjects';
import { getPod, getPodLogs, Response } from '../../../services/Api';
import { CancelablePromise, makeCancelablePromise } from '../../../utils/CancelablePromises';
import { ToolbarDropdown } from '../../../components/ToolbarDropdown/ToolbarDropdown';

export interface WorkloadPodLogsProps {
  namespace: string;
  pods: Pod[];
}

interface WorkloadPodLogsState {
  container?: string;
  containers?: Object;
  duration: string; // DurationInSeconds
  loadingPod: boolean;
  loadingPodError?: string;
  loadingPodLogs: boolean;
  pod?: Pod;
  podLogs?: PodLogs;
}

const DurationDefault = '300';
const Durations = {
  '60': 'Last 1m',
  '300': 'Last 5m',
  '600': 'Last 10m',
  '1800': 'Last 30m',
  '3600': 'Last 1h',
  '10800': 'Last 3h',
  '21600': 'Last 6h',
  '43200': 'Last 12h',
  '86400': 'Last 1d',
  '604800': 'Last 7d'
};

export default class WorkloadPodLogs extends React.Component<WorkloadPodLogsProps, WorkloadPodLogsState> {
  private loadPodPromise?: CancelablePromise<Response<Pod>[]>;
  private loadPodLogsPromise?: CancelablePromise<Response<PodLogs>[]>;

  headerFormat = (label, { column }) => <Table.Heading className={column.property}>{label}</Table.Heading>;
  cellFormat = (value, { column }) => {
    const props = column.cell.props;
    const className = props ? props.align : '';

    return <Table.Cell className={className}>{value}</Table.Cell>;
  };

  constructor(props: WorkloadPodLogsProps) {
    super(props);
    this.state = {
      duration: DurationDefault,
      loadingPod: true,
      loadingPodLogs: false
    };
  }

  componentDidMount() {
    this.fetchPod(this.props.namespace, this.props.pods[0].name);
  }

  componentDidUpdate(prevProps: WorkloadPodLogsProps, prevState: WorkloadPodLogsState) {
    const newContainer = this.state.container && prevState.container !== this.state.container;
    const newDuration = this.state.duration && prevState.duration !== this.state.duration;
    if (newContainer || newDuration) {
      this.fetchLogs(this.props.namespace, this.state.pod!.name, this.state.container!, Number(this.state.duration));
    }
  }

  render() {
    return (
      <>
        {this.state.container && (
          <>
            <Toolbar>
              <ToolbarDropdown
                id={'wpl_containers'}
                nameDropdown="Container"
                tooltip="Display logs for the selected pod container"
                handleSelect={key => this.setContainer(key)}
                value={this.state.container}
                label={this.state.container}
                options={this.state.containers!}
              />
              <Toolbar.RightContent>
                <ToolbarDropdown
                  id={'wpl_duration'}
                  handleSelect={key => this.setDuration(key)}
                  value={this.state.duration}
                  label={Durations[this.state.duration]}
                  options={Durations}
                  tooltip={'Time range for graph data'}
                />
                <span style={{ paddingLeft: '0.5em' }}>
                  <Button id={'wpl_refresh'} disabled={!this.state.podLogs} onClick={() => this.handleRefresh()}>
                    <Icon name="refresh" />
                  </Button>
                </span>
              </Toolbar.RightContent>
            </Toolbar>
            <textarea
              style={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                resize: 'vertical',
                color: '#fff',
                backgroundColor: '#003145'
              }}
              readOnly={true}
              value={this.state.podLogs ? this.state.podLogs.logs : 'Loading logs...'}
            />
          </>
        )}
        {this.state.loadingPodError && <div>{this.state.loadingPodError}</div>}
      </>
    );
  }

  private setContainer = (container: string) => {
    this.setState({ container: container });
  };

  private setDuration = (duration: string) => {
    this.setState({ duration: duration });
  };

  private handleRefresh = () => {
    this.fetchLogs(this.props.namespace, this.state.pod!.name, this.state.container!, Number(this.state.duration));
  };

  private fetchPod = (namespace: string, podName: string) => {
    const promise: Promise<Response<Pod>> = getPod(namespace, podName);
    this.loadPodPromise = makeCancelablePromise(Promise.all([promise]));
    this.loadPodPromise.promise
      .then(response => {
        const pod = response[0].data;
        const containers: Object = {};
        if (pod.containers) {
          pod.containers.forEach(c => {
            containers[c.name] = c.name;
          });
        }
        if (pod.istioContainers) {
          pod.istioContainers.forEach(c => {
            containers[c.name] = c.name;
          });
        }
        const container =
          pod.containers && pod.containers.length > 0 ? pod.containers[0].name : pod.istioContainers![0].name;
        this.setState({
          container: container,
          containers: containers,
          loadingPod: false,
          loadingPodError: undefined,
          pod: pod
        });
        return;
      })
      .catch(error => {
        if (error.isCanceled) {
          console.debug('Pod: Ignore fetch error (canceled).');
          return;
        }
        const errorMsg = error.response && error.response.data.error ? error.response.data.error : error.message;
        this.setState({
          container: undefined,
          containers: undefined,
          loadingPod: false,
          loadingPodError: errorMsg,
          pod: undefined
        });
      });

    this.setState({
      container: undefined,
      containers: undefined,
      loadingPod: true,
      loadingPodError: undefined,
      pod: undefined,
      podLogs: undefined
    });
  };

  private fetchLogs = (namespace: string, podName: string, container: string, duration: number) => {
    const sinceTime = Math.floor(Date.now() / 1000) - duration;
    const promise: Promise<Response<PodLogs>> = getPodLogs(namespace, podName, container, sinceTime);
    this.loadPodLogsPromise = makeCancelablePromise(Promise.all([promise]));
    this.loadPodLogsPromise.promise
      .then(response => {
        const podLogs = response[0].data;
        this.setState({
          loadingPodLogs: false,
          podLogs: podLogs.logs ? podLogs : { logs: 'No logs found for the time period.' }
        });
        return;
      })
      .catch(error => {
        if (error.isCanceled) {
          console.debug('PodLogs: Ignore fetch error (canceled).');
          return;
        }
        const errorMsg = error.response && error.response.data.error ? error.response.data.error : error.message;
        this.setState({
          loadingPodLogs: false,
          podLogs: { logs: `Failed to fetch pod logs: ${errorMsg}` }
        });
      });

    this.setState({
      loadingPodLogs: true,
      podLogs: undefined
    });
  };
}
