import * as React from 'react';

import { connect } from 'react-redux';

import Namespace from '../../types/Namespace';
import { GraphParamsType, SummaryData } from '../../types/Graph';
import { Duration, Layout } from '../../types/GraphFilter';

import SummaryPanel from './SummaryPanel';
import CytoscapeGraph from '../../components/CytoscapeGraph/CytoscapeGraph';
import PfContainerNavVertical from '../../components/Pf/PfContainerNavVertical';
import { computePrometheusQueryInterval } from '../../services/Prometheus';
import { style } from 'typestyle';
import { KialiAppState } from '../../store/Store';
import GraphFilterContainer, { GraphTypes } from '../../containers/GraphFilterContainer';

type ServiceGraphPageState = {
  summaryData?: SummaryData | null;
};

type ServiceGraphPageProps = GraphParamsType & {
  graphTimestamp: string;
  graphData: any;
  isLoading: boolean;
  isReady: boolean;
  duration: number;
  graphType: GraphTypes;
  onParamsChange: (params: GraphParamsType) => void;
  fetchGraphData: (namespace: Namespace, graphDuration: Duration) => any;
};
const NUMBER_OF_DATAPOINTS = 30;

const cytscapeGraphStyle = style({
  position: 'absolute',
  right: 20,
  bottom: 0,
  top: 170,
  left: 220
});

// Allow Redux to map sections of our global app state to our props
const mapStateToProps = (state: KialiAppState) => ({
  graphType: state.serviceGraphDataState.graphType,
  duration: state.serviceGraphDataState.duration
});

class ServiceGraphPage extends React.Component<ServiceGraphPageProps, ServiceGraphPageState> {
  constructor(props: ServiceGraphPageProps) {
    super(props);

    this.state = {
      summaryData: { summaryType: 'graph', summaryTarget: null }
    };
  }

  render() {
    console.debug('Rerender Service Graph page');
    const graphParams: GraphParamsType = {
      namespace: this.props.namespace,
      graphLayout: this.props.graphLayout,
      graphDuration: { value: this.props.duration }
    };
    return (
      <PfContainerNavVertical>
        <h2>Service Graph</h2>
        <GraphFilterContainer
          disabled={this.props.isLoading}
          onLayoutChange={this.handleLayoutChange}
          onFilterChange={this.handleFilterChange}
          onNamespaceChange={this.handleNamespaceChange}
          onRefresh={this.handleRefreshClick}
          {...graphParams}
        />
        <div className={cytscapeGraphStyle}>
          <CytoscapeGraph
            {...graphParams}
            isLoading={this.props.isLoading}
            isReady={this.props.isReady}
            elements={this.props.graphData}
            onClick={this.handleGraphClick}
            onReady={this.handleReady}
            refresh={this.handleRefreshClick}
          />
          {this.state.summaryData ? (
            <SummaryPanel
              data={this.state.summaryData}
              namespace={this.props.namespace.name}
              queryTime={this.props.graphTimestamp}
              duration={this.props.duration}
              {...computePrometheusQueryInterval(this.props.graphDuration.value, NUMBER_OF_DATAPOINTS)}
            />
          ) : null}
        </div>
      </PfContainerNavVertical>
    );
  }

  componentDidMount() {
    this.loadGraphDataFromBackend();
  }

  componentWillReceiveProps(nextProps: ServiceGraphPageProps) {
    const nextNamespace = nextProps.namespace;
    const nextDuration = nextProps.graphDuration;

    const namespaceHasChanged = nextNamespace.name !== this.props.namespace.name;
    const durationHasChanged = nextDuration.value !== this.props.graphDuration.value;

    if (namespaceHasChanged || durationHasChanged) {
      this.loadGraphDataFromBackend(nextNamespace, nextDuration);
    }
  }

  private handleGraphClick = (data: SummaryData) => {
    if (data) {
      this.setState({ summaryData: data });
    }
  };

  private handleReady = (cy: any) => {
    if (cy) {
      this.setState({
        summaryData: {
          summaryType: 'graph',
          summaryTarget: cy
        }
      });
    }
  };

  private handleRefreshClick = () => {
    this.loadGraphDataFromBackend();
  };

  private handleLayoutChange = (layout: Layout) => {
    const newParams: GraphParamsType = {
      namespace: this.props.namespace,
      graphDuration: this.props.graphDuration,
      graphLayout: layout
    };
    this.props.onParamsChange(newParams);
  };

  private handleFilterChange = (duration: Duration) => {
    const newParams: GraphParamsType = {
      namespace: this.props.namespace,
      graphDuration: duration,
      graphLayout: this.props.graphLayout
    };
    this.props.onParamsChange(newParams);
  };

  private handleNamespaceChange = (namespace: Namespace) => {
    const newParams: GraphParamsType = {
      namespace: namespace,
      graphDuration: this.props.graphDuration,
      graphLayout: this.props.graphLayout
    };
    this.props.onParamsChange(newParams);
  };

  /** Fetch graph data */
  private loadGraphDataFromBackend = (namespace?: Namespace, graphDuration?: Duration) => {
    namespace = namespace ? namespace : this.props.namespace;
    graphDuration = graphDuration ? graphDuration : this.props.graphDuration;
    this.props.fetchGraphData(namespace, graphDuration);
    this.setState({
      summaryData: null
    });
  };
}
const ServiceGraphPageContainer = connect(mapStateToProps, null)(ServiceGraphPage);
export default ServiceGraphPageContainer;
