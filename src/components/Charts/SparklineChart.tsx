import * as React from 'react';
import {
  Chart,
  ChartProps,
  ChartTooltip,
  ChartVoronoiContainer,
  ChartAxis,
  ChartScatter,
  ChartArea
} from '@patternfly/react-charts';
import { VictoryLegend } from 'victory';

import { VCDataPoint, VCLines } from '../../utils/Graphing';
import { PfColors } from 'components/Pf/PfColors';
import * as Legend from './LegendHelper';
import { CustomFlyout } from './CustomFlyout';
import { CustomLabel } from './CustomLabel';

import './Charts.css';

type Props = ChartProps & {
  name: string;
  series: VCLines;
  showLegend?: boolean;
  tooltipFormat?: (dp: VCDataPoint) => string;
};

type State = {
  width: number;
  hiddenSeries: Set<number>;
};

export class SparklineChart extends React.Component<Props, State> {
  containerRef?: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    if (props.width === undefined) {
      this.containerRef = React.createRef<HTMLDivElement>();
    }
    this.state = { width: props.width || 1, hiddenSeries: new Set() };
  }

  handleResize = () => {
    if (this.containerRef && this.containerRef.current) {
      this.setState({ width: this.containerRef.current.clientWidth });
    }
  };

  componentDidMount() {
    if (this.containerRef) {
      setTimeout(() => {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
      });
    }
  }

  componentWillUnmount() {
    if (this.containerRef) {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  render() {
    if (this.containerRef) {
      return <div ref={this.containerRef}>{this.renderChart()}</div>;
    }
    return this.renderChart();
  }

  renderChart() {
    const legendHeight = 30;
    let height = this.props.height || 300;
    const padding = { top: 0, bottom: 0, left: 0, right: 0, ...this.props.padding };
    let events: any = undefined;
    if (this.props.showLegend) {
      padding.bottom += legendHeight;
      height += legendHeight;
      events = Legend.events({
        items: this.props.series,
        itemBaseName: this.props.name + '-area-',
        legendName: this.props.name + '-legend',
        onClick: idx => {
          if (!this.state.hiddenSeries.delete(idx)) {
            // Was not already hidden => add to set
            this.state.hiddenSeries.add(idx);
          }
          this.setState({ hiddenSeries: new Set(this.state.hiddenSeries) });
          return null;
        },
        onMouseOver: (_, props) => {
          return {
            style: { ...props.style, strokeWidth: 4, fillOpacity: 0.5 }
          };
        }
      });
    }

    // Hack:
    // At the moment it doesn't seem possible to get all active points (under cursor) during the tooltip generation process. Only a single point is provided by Victory.
    // So here we are encoding color information within text tooltip ; which will be extracted in our CustomLabel component.
    // Also, note that the colors index is created on purpose, instead of directly encoding color string.
    // Because Victory internally will compute tooltip width based on text width, we must reduce the injected text to the miminum.
    const colors = this.props.series.map(s => s.color);
    const tooltip = (
      <ChartTooltip
        flyoutComponent={<CustomFlyout />}
        labelComponent={<CustomLabel colors={colors} />}
        constrainToVisibleArea={true}
      />
    );
    const container = (
      <ChartVoronoiContainer
        labels={obj => {
          if (obj.datum.childName.startsWith(this.props.name + '-scatter')) {
            return null as any;
          }
          const colorIdx = colors.findIndex(c => c === obj.datum.color);
          return `${colorIdx}@${this.props.tooltipFormat ? this.props.tooltipFormat(obj.datum) : obj.datum.y}`;
        }}
        labelComponent={tooltip}
      />
    );
    const hiddenAxisStyle = {
      axis: { stroke: 'none' },
      ticks: { stroke: 'none' },
      tickLabels: { stroke: 'none', fill: 'none' }
    };

    return (
      <Chart
        {...this.props}
        height={height}
        width={this.state.width}
        padding={padding}
        events={events}
        containerComponent={container}
        // Hack: 1 pxl on Y domain padding to prevent harsh clipping (https://github.com/kiali/kiali/issues/2069)
        domainPadding={{ y: 1 }}
      >
        <ChartAxis tickCount={15} style={hiddenAxisStyle} />
        <ChartAxis dependentAxis={true} style={hiddenAxisStyle} />
        {this.props.series.map((serie, idx) => {
          if (this.state.hiddenSeries.has(idx)) {
            return undefined;
          }
          return (
            <ChartScatter
              name={this.props.name + '-scatter-' + idx}
              key={this.props.name + '-scatter-' + idx}
              data={serie.datapoints}
              style={{ data: { fill: serie.color } }}
              size={({ active }) => (active ? 5 : 2)}
            />
          );
        })}
        {this.props.series.map((serie, idx) => {
          if (this.state.hiddenSeries.has(idx)) {
            return undefined;
          }
          return (
            <ChartArea
              name={this.props.name + '-area-' + idx}
              key={this.props.name + '-area-' + idx}
              data={serie.datapoints}
              style={{
                data: {
                  fill: serie.color,
                  fillOpacity: 0.2,
                  stroke: serie.color,
                  strokeWidth: 2
                }
              }}
            />
          );
        })}
        {this.props.showLegend && (
          <VictoryLegend
            name={this.props.name + '-legend'}
            data={this.props.series.map((s, idx) => {
              if (this.state.hiddenSeries.has(idx)) {
                return { ...s.legendItem, symbol: { fill: PfColors.Gray } };
              }
              return s.legendItem;
            })}
            y={height - legendHeight}
            height={legendHeight}
            themeColor={this.props.themeColor}
            width={this.state.width}
          />
        )}
      </Chart>
    );
  }
}
