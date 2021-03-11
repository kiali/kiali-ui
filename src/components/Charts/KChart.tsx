import * as React from 'react';
import { Button, EmptyState, EmptyStateIcon, EmptyStateBody, Expandable } from '@patternfly/react-core';
import { ChartArea, ChartBar, ChartScatter, ChartLine } from '@patternfly/react-charts';
import { CubesIcon, AngleDoubleLeftIcon, ExpandArrowsAltIcon, ErrorCircleOIcon } from '@patternfly/react-icons';

import { ChartModel } from 'types/Dashboards';
import { VCLines, RawOrBucket, RichDataPoint, LineInfo } from 'types/VictoryChartInfo';
import { Overlay } from 'types/Overlay';
import ChartWithLegend from './ChartWithLegend';
import { BrushHandlers } from './Container';

type KChartProps<T extends LineInfo> = {
  chart: ChartModel;
  data: VCLines<RichDataPoint>;
  isMaximized: boolean;
  onToggleMaximized: () => void;
  onClick?: (datum: RawOrBucket<T>) => void;
  brushHandlers?: BrushHandlers;
  overlay?: Overlay<T>;
  timeWindow?: [Date, Date];
};

export const maximizeButtonStyle: React.CSSProperties = {
  marginBottom: '-3.5em',
  marginRight: '0.8em',
  top: '-2.7em',
  position: 'relative',
  float: 'right'
};

type State = {
  collapsed: boolean;
};

type ChartTypeData = {
  fill: boolean;
  stroke: boolean;
  groupOffset: number;
  seriesComponent: React.ReactElement;
  sizeRatio: number;
};

const lineInfo: ChartTypeData = {
  fill: false,
  stroke: true,
  groupOffset: 0,
  seriesComponent: <ChartLine />,
  sizeRatio: 1.0
};
const areaInfo: ChartTypeData = {
  fill: true,
  stroke: false,
  groupOffset: 0,
  seriesComponent: <ChartArea />,
  sizeRatio: 1.0
};
const barInfo: ChartTypeData = {
  fill: true,
  stroke: false,
  groupOffset: 7,
  seriesComponent: <ChartBar />,
  sizeRatio: 1 / 6
};
const scatterInfo: ChartTypeData = {
  fill: true,
  stroke: false,
  groupOffset: 0,
  seriesComponent: <ChartScatter />,
  sizeRatio: 1 / 30
};

class KChart<T extends LineInfo> extends React.Component<KChartProps<T>, State> {
  constructor(props: KChartProps<T>) {
    super(props);
    this.state = {
      collapsed: this.props.chart.startCollapsed || (!this.props.chart.error && this.isEmpty())
    };
  }

  componentDidUpdate(prevProps: KChartProps<T>) {
    // If it starts collapsed because it's empty, then checks if there is new data to expand
    if (this.state.collapsed && this.props.data.length !== prevProps.data.length) {
      this.setState({
        collapsed: false
      });
    }
  }

  render() {
    return (
      <Expandable
        toggleText={this.props.chart.name}
        onToggle={() => {
          this.setState({ collapsed: !this.state.collapsed });
        }}
        isExpanded={!this.state.collapsed}
      >
        {this.props.chart.error ? this.renderError() : this.isEmpty() ? this.renderEmpty() : this.renderChart()}
      </Expandable>
    );
  }

  private determineChartType() {
    if (this.props.chart.chartType === undefined) {
      return this.props.chart.xAxis === 'series' ? barInfo : lineInfo;
    }
    const chartType = this.props.chart.chartType;
    switch (chartType) {
      case 'area':
        return areaInfo;
      case 'bar':
        return barInfo;
      case 'scatter':
        return scatterInfo;
      case 'line':
      default:
        return lineInfo;
    }
  }

  private renderChart() {
    if (this.state.collapsed) {
      return undefined;
    }
    const typeData = this.determineChartType();
    const minDomain = this.props.chart.min === undefined ? undefined : { y: this.props.chart.min };
    const maxDomain = this.props.chart.max === undefined ? undefined : { y: this.props.chart.max };

    return (
      <>
        {this.props.onToggleMaximized && (
          <div style={maximizeButtonStyle}>
            <Button variant="secondary" onClick={this.props.onToggleMaximized}>
              {this.props.isMaximized ? <AngleDoubleLeftIcon /> : <ExpandArrowsAltIcon />}
            </Button>
          </div>
        )}
        <ChartWithLegend
          data={this.props.data}
          seriesComponent={typeData.seriesComponent}
          fill={typeData.fill}
          stroke={typeData.stroke}
          groupOffset={typeData.groupOffset}
          sizeRatio={typeData.sizeRatio}
          overlay={this.props.overlay}
          unit={this.props.chart.unit}
          moreChartProps={{ minDomain: minDomain, maxDomain: maxDomain }}
          onClick={this.props.onClick}
          brushHandlers={this.props.brushHandlers}
          timeWindow={this.props.timeWindow}
          xAxis={this.props.chart.xAxis}
        />
      </>
    );
  }

  private isEmpty(): boolean {
    return !this.props.data.some(s => s.datapoints.length !== 0);
  }

  private renderEmpty() {
    return (
      <EmptyState variant="full">
        <EmptyStateIcon icon={CubesIcon} />
        <EmptyStateBody>No data available</EmptyStateBody>
      </EmptyState>
    );
  }

  private renderError() {
    return (
      <EmptyState variant="full">
        <EmptyStateIcon icon={() => <ErrorCircleOIcon style={{ color: '#cc0000' }} width={32} height={32} />} />
        <EmptyStateBody>
          An error occured while fetching this metric:
          <p>
            <i>{this.props.chart.error}</i>
          </p>
        </EmptyStateBody>
      </EmptyState>
    );
  }
}

export default KChart;
