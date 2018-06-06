import * as React from 'react';

import { GraphParamsType, SummaryData } from '../../types/Graph';
import { Duration } from '../../types/GraphFilter';

import SummaryPanel from './SummaryPanel';
import CytoscapeGraph from '../../components/CytoscapeGraph/CytoscapeGraph';
import OverviewGraphFilterToolbar from '../../components/GraphFilter/OverviewGraphFilterToolbar';
import PfContainerNavVertical from '../../components/Pf/PfContainerNavVertical';
import { computePrometheusQueryInterval } from '../../services/Prometheus';
import { style } from 'typestyle';

import GraphLegend from '../../components/GraphFilter/GraphLegend';

type OverviewGraphPageState = {
  // stateless
};

type OverviewGraphPageProps = GraphParamsType & {
  graphTimestamp: string;
  graphData: any;
  isLoading: boolean;
  showLegend: boolean;
  toggleLegend: () => void;
  isReady: boolean;
  fetchGraphData: (graphDuration: Duration) => any;
  cleanupGraphData: () => any;
  summaryData: SummaryData | null;
};
const NUMBER_OF_DATAPOINTS = 30;

const cytscapeGraphStyle = style({
  position: 'absolute',
  right: 20,
  bottom: 0,
  top: 170,
  left: 220
});

export default class OverviewGraphPage extends React.Component<OverviewGraphPageProps, OverviewGraphPageState> {
  constructor(props: OverviewGraphPageProps) {
    super(props);
  }

  componentDidMount() {
    this.loadGraphDataFromBackend();
  }

  componentWillReceiveProps(nextProps: OverviewGraphPageProps) {
    const nextDuration = nextProps.graphDuration;

    const durationHasChanged = nextDuration.value !== this.props.graphDuration.value;

    if (durationHasChanged) {
      this.loadGraphDataFromBackend(nextDuration);
    }
  }

  componentWillUnmount() {
    this.props.cleanupGraphData();
  }

  handleRefreshClick = () => {
    this.loadGraphDataFromBackend();
  };

  render() {
    const graphParams: GraphParamsType = {
      namespace: { name: '' },
      graphLayout: this.props.graphLayout,
      edgeLabelMode: this.props.edgeLabelMode,
      graphDuration: this.props.graphDuration
    };
    return (
      <PfContainerNavVertical>
        <h2>Overview</h2>
        <OverviewGraphFilterToolbar
          isLoading={this.props.isLoading}
          handleRefreshClick={this.handleRefreshClick}
          {...graphParams}
        />
        <div className={cytscapeGraphStyle}>
          <CytoscapeGraph {...graphParams} elements={this.props.graphData} refresh={this.handleRefreshClick} />
          {this.props.summaryData && this.props.summaryData.summaryType !== 'graph' ? (
            <SummaryPanel
              data={this.props.summaryData}
              namespace={this.props.namespace.name}
              queryTime={this.props.graphTimestamp}
              duration={this.props.graphDuration.value}
              {...computePrometheusQueryInterval(this.props.graphDuration.value, NUMBER_OF_DATAPOINTS)}
            />
          ) : null}
        </div>
        {this.props.showLegend && <GraphLegend closeLegend={this.props.toggleLegend} />}
      </PfContainerNavVertical>
    );
  }

  /** Fetch graph data */
  loadGraphDataFromBackend = (graphDuration?: Duration) => {
    graphDuration = graphDuration ? graphDuration : this.props.graphDuration;
    this.props.fetchGraphData(graphDuration);
  };
}
