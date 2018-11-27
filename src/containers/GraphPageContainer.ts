import { KialiAppState } from '../store/Store';
import { connect } from 'react-redux';
import Namespace from '../types/Namespace';
import { EdgeLabelMode } from '../types/GraphFilter';
import GraphPage from '../pages/Graph/GraphPage';

import { GraphDataThunkActions } from '../actions/GraphDataActions';
import { GraphFilterActions } from '../actions/GraphFilterActions';
import { bindActionCreators } from 'redux';
import { GraphType, NodeParamsType } from '../types/Graph';
import { activeNamespacesSelector, durationSelector, refreshIntervalSelector } from '../store/Selectors';
import { DurationInSeconds } from '../types/Common';

const mapStateToProps = (state: KialiAppState) => ({
  activeNamespaces: activeNamespacesSelector(state),
  duration: durationSelector(state),
  graphTimestamp: state.graph.graphDataTimestamp,
  graphData: state.graph.graphData,
  isLoading: state.graph.isLoading,
  summaryData: state.graph.sidePanelInfo
    ? {
        summaryTarget: state.graph.sidePanelInfo.graphReference,
        summaryType: state.graph.sidePanelInfo.kind
      }
    : null,
  showLegend: state.graph.filterState.showLegend,
  pollInterval: refreshIntervalSelector(state),
  isPageVisible: state.globalState.isPageVisible,
  showSecurity: state.graph.filterState.showSecurity,
  showUnusedNodes: state.graph.filterState.showUnusedNodes,
  isError: state.graph.isError
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchGraphData: (
    namespaces: Namespace[],
    duration: DurationInSeconds,
    graphType: GraphType,
    injectServiceNodes: boolean,
    edgeLabelMode: EdgeLabelMode,
    showSecurity: boolean,
    showUnusedNodes: boolean,
    node?: NodeParamsType
  ) =>
    dispatch(
      GraphDataThunkActions.fetchGraphData(
        namespaces,
        duration,
        graphType,
        injectServiceNodes,
        edgeLabelMode,
        showSecurity,
        showUnusedNodes,
        node
      )
    ),
  toggleLegend: bindActionCreators(GraphFilterActions.toggleLegend, dispatch)
});

const GraphPageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphPage);
export default GraphPageContainer;
