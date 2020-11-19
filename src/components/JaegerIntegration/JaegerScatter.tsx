import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { ChartScatter } from '@patternfly/react-charts';
import { Title, EmptyState, EmptyStateVariant, EmptyStateBody } from '@patternfly/react-core';

import { JaegerError, JaegerTrace } from '../../types/JaegerInfo';
import { isErrorTag } from './JaegerHelper';
import { PfColors } from '../Pf/PfColors';

import jaegerIcon from '../../assets/img/jaeger-icon.svg';
import { evalTimeRange } from 'types/Common';
import { KialiAppState } from 'store/Store';
import { KialiAppAction } from 'actions/KialiAppAction';
import { JaegerThunkActions } from 'actions/JaegerThunkActions';
import { LineInfo, makeLegend, VCDataPoint } from 'types/VictoryChartInfo';
import ChartWithLegend from 'components/Charts/ChartWithLegend';
import { durationSelector } from '../../store/Selectors';

interface JaegerScatterProps {
  duration: number;
  traces: JaegerTrace[];
  fixedTime: boolean;
  errorTraces?: boolean;
  errorFetchTraces?: JaegerError[];
  setTraceId: (traceId?: string) => void;
  selectedTrace?: JaegerTrace;
}

const ONE_MILLISECOND = 1000000;
const MINIMAL_SIZE = 2;
const MAXIMAL_SIZE = 30;

type JaegerLineInfo = LineInfo & { id: string };
type Datapoint = VCDataPoint & JaegerLineInfo;

class JaegerScatter extends React.Component<JaegerScatterProps> {
  renderFetchEmtpy = (title, msg) => {
    return (
      <EmptyState variant={EmptyStateVariant.full}>
        <img alt="Jaeger Link" src={jaegerIcon} className={'pf-c-empty-state__icon'} />
        <Title headingLevel="h5" size="lg">
          {title}
        </Title>
        <EmptyStateBody>{msg}</EmptyStateBody>
      </EmptyState>
    );
  };
  render() {
    const tracesRaw: Datapoint[] = [];
    const tracesError: Datapoint[] = [];
    // Tracing uses Duration instead of TimeRange, evalTimeRange is a helper here
    const timeWindow = evalTimeRange({ rangeDuration: this.props.duration });

    let traces = this.props.traces;
    // Add currently selected trace in list in case it wasn't
    if (
      this.props.selectedTrace &&
      !traces.some(t => t.traceID === this.props.selectedTrace!.traceID) &&
      this.props.selectedTrace.startTime >= 1000 * timeWindow[0].getTime() &&
      this.props.selectedTrace.startTime <= 1000 * timeWindow[1].getTime()
    ) {
      traces.push(this.props.selectedTrace);
    }

    traces.forEach(trace => {
      const isSelected = this.props.selectedTrace && trace.traceID === this.props.selectedTrace.traceID;
      const traceError = trace.spans.filter(sp => sp.tags.some(isErrorTag)).length > 0;
      const traceItem = {
        x: new Date(trace.startTime / 1000),
        y: Number(trace.duration / ONE_MILLISECOND),
        name: `${trace.traceName !== '' ? trace.traceName : '<trace-without-root-span>'} (${trace.traceID.slice(
          0,
          7
        )})`,
        color: isSelected ? PfColors.Blue500 : PfColors.Blue200,
        unit: 'seconds',
        id: trace.traceID,
        size: Math.min(MAXIMAL_SIZE, trace.spans.length + MINIMAL_SIZE)
      };
      if (traceError) {
        traceItem.color = isSelected ? PfColors.Red500 : PfColors.Red200;
        tracesError.push(traceItem);
      } else {
        tracesRaw.push(traceItem);
      }
    });
    const successTraces = {
      datapoints: tracesRaw,
      color: (({ datum }) => datum.color) as any,
      legendItem: makeLegend('Traces', PfColors.Blue200)
    };

    const errorTraces = {
      datapoints: tracesError,
      color: (({ datum }) => datum.color) as any,
      legendItem: makeLegend('Error Traces', PfColors.Red200)
    };

    return this.props.errorFetchTraces && this.props.errorFetchTraces.length > 0 ? (
      this.renderFetchEmtpy('Error fetching Traces in Tracing tool', this.props.errorFetchTraces![0].msg)
    ) : this.props.traces.length > 0 ? (
      <ChartWithLegend<Datapoint, JaegerLineInfo>
        data={[successTraces, errorTraces]}
        fill={true}
        unit="seconds"
        seriesComponent={<ChartScatter />}
        timeWindow={this.props.fixedTime ? timeWindow : undefined}
        onClick={dp => this.props.setTraceId(dp.id)}
      />
    ) : (
      this.renderFetchEmtpy('No traces', 'No trace results. Try another query.')
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  selectedTrace: state.jaegerState.selectedTrace
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  setTraceId: (traceId?: string) => dispatch(JaegerThunkActions.setTraceId(traceId))
});

const Container = connect(mapStateToProps, mapDispatchToProps)(JaegerScatter);
export default Container;
