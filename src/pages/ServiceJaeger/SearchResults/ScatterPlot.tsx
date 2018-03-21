import './react-vis.css';
import './ScatterPlot.css';

import { FlexibleWidthXYPlot, XAxis, YAxis, MarkSeries, Hint } from 'react-vis';
import React from 'react';
import dimensions from 'react-dimensions';
import moment from 'moment';
import { compose, withState, withProps } from 'recompose';
import { formatDuration } from './date';

const FALLBACK_TRACE_NAME = '<trace-without-root-span>';

type valueShape = {
  x: number;
  y: number;
  traceID: string;
  size: number;
  name: string;
};

type ScatterPlotProps = {
  containerWidth?: number;
  data: (valueShape | null)[];
  overValue?: valueShape;
  onValueClick?: any;
  onValueOut?: any;
  onValueOver?: any;
};

class ScatterPlot extends React.Component<ScatterPlotProps> {
  constructor(props: ScatterPlotProps) {
    super(props);
  }

  render() {
    const { data, onValueClick, overValue, onValueOver, onValueOut } = this.props;
    return (
      <div className="TraceResultsScatterPlot">
        <FlexibleWidthXYPlot
          margin={{
            left: 50
          }}
          height={200}
        >
          <XAxis title="Time" tickTotal={4} tickFormat={t => moment(t).format('hh:mm:ss a')} />
          <YAxis title="Duration" tickTotal={3} tickFormat={t => formatDuration(t, 'milliseconds')} />
          <MarkSeries
            sizeRange={[3, 10]}
            opacity={0.5}
            onValueClick={onValueClick}
            onValueMouseOver={onValueOver}
            onValueMouseOut={onValueOut}
            data={data}
          />
          {overValue && (
            <Hint value={overValue}>
              <h4 className="scatter-plot-hint">{overValue.name || FALLBACK_TRACE_NAME}</h4>
            </Hint>
          )}
        </FlexibleWidthXYPlot>
      </div>
    );
  }
}

const ScatterPlotCompose = compose(
  withState('overValue', 'setOverValue', null),
  withProps(({ setOverValue }) => ({
    onValueOver: value => setOverValue(value),
    onValueOut: () => setOverValue(null)
  }))
)(ScatterPlot);

export default dimensions()(ScatterPlotCompose);
