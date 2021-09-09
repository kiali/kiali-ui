import * as React from 'react';

import { DurationInSeconds } from '../../types/Common';
import { Metric } from '../../types/Metrics';
import { getName } from '../../utils/RateIntervals';
import { PFColors } from 'components/Pf/PfColors';
import { SparklineChart } from 'components/Charts/SparklineChart';
import { toVCLine } from 'utils/VictoryChartsUtils';

import 'components/Charts/Charts.css';

type Props = {
  metrics?: Metric[];
  errorMetrics?: Metric[];
  duration: DurationInSeconds;
};

class OverviewCardSparkline extends React.Component<Props, {}> {
  render() {
    if (
      this.props.metrics &&
      this.props.metrics.length > 0 &&
      this.props.errorMetrics &&
      this.props.metrics.length > 0
    ) {
      const data = toVCLine(this.props.metrics[0].datapoints, 'RPS', PFColors.Blue400);
      const dataErrors = toVCLine(this.props.errorMetrics[0].datapoints, 'Errors', PFColors.Danger);
      return (
        <>
          {'Traffic, ' + getName(this.props.duration).toLowerCase()}
          <SparklineChart
            name={'traffic'}
            height={60}
            showLegend={false}
            padding={{ top: 5, left: 30 }}
            tooltipFormat={dp => `${(dp.x as Date).toLocaleTimeString()}\n${dp.y} ${dp.name}`}
            series={[data, dataErrors]}
          />
        </>
      );
    }
    return <div style={{ paddingTop: '40px' }}>No traffic</div>;
  }
}

export default OverviewCardSparkline;
