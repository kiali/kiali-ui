import * as React from 'react';
import { SimpleList, SimpleListItem, Button } from '@patternfly/react-core';

import history from '../../app/History';
import * as API from '../../services/Api';
import * as AlertUtils from '../../utils/AlertUtils';
import { JaegerInfo, JaegerTrace } from 'types/JaegerInfo';
import { PromisesRegistry } from 'utils/CancelablePromises';
import { TracingQuery } from 'types/Tracing';
import { TimeRange, guardTimeRange, durationToBounds } from 'types/Common';
import { transformTraceData } from 'components/JaegerIntegration/JaegerResults';
import { TraceListItem } from 'components/JaegerIntegration/TraceListItem';

type Props = {
  jaegerInfo?: JaegerInfo;
  namespace: string;
  service: string;
  timeRange: TimeRange;
};

type State = {
  traces: JaegerTrace[];
};

const tracesLimit = 15;

export class SummaryPanelNodeTraces extends React.Component<Props, State> {
  private promises = new PromisesRegistry();

  constructor(props: Props) {
    super(props);
    this.state = { traces: [] };
  }

  componentDidMount() {
    this.loadTraces();
  }

  // componentDidUpdate(prevProps: Props) {
  //   if (shouldRefreshData(prevProps, this.props)) {
  //     this.loadTraces();
  //   }
  // }

  componentWillUnmount() {
    this.promises.cancelAll();
  }

  private loadTraces() {
    // Convert any time range (like duration) to bounded from/to
    const boundsMillis = guardTimeRange(this.props.timeRange, durationToBounds, b => b);
    // Convert to microseconds
    const params: TracingQuery = {
      startMicros: boundsMillis.from * 1000,
      endMicros: boundsMillis.to ? boundsMillis.to * 1000 : undefined,
      limit: tracesLimit
    };
    this.promises.cancelAll();
    this.promises
      .register('traces', API.getJaegerTraces(this.props.namespace, this.props.service, params))
      .then(response => {
        const traces = response.data.data
          ? (response.data.data
              .map(trace => transformTraceData(trace))
              .filter(trace => trace !== null) as JaegerTrace[])
          : [];
        this.setState({ traces: traces });
      })
      .catch(error => {
        AlertUtils.addError('Could not fetch traces.', error);
      });
  }

  private onSelect() {}

  render() {
    if (this.state.traces.length === 0) {
      return null;
    }
    const tracesDetailsURL = `/namespaces/${this.props.namespace}/services/${this.props.service}?tab=traces`;

    return (
      <>
        <SimpleList onSelect={this.onSelect} aria-label="Simple List Example">
          {this.state.traces.map((trace, idx) => {
            return (
              <SimpleListItem key={'trace_' + idx}>
                <TraceListItem trace={trace} />
              </SimpleListItem>
            );
          })}
        </SimpleList>
        <Button onClick={() => history.push(tracesDetailsURL)}>Find more traces</Button>
      </>
    );
  }
}
