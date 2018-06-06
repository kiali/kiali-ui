import { KialiAppState } from '../store/Store';
import { connect } from 'react-redux';
import { Duration } from '../types/GraphFilter';
import OverviewGraphPage from '../pages/ServiceGraph/OverviewGraphPage';

import { ServiceGraphDataActions } from '../actions/ServiceGraphDataActions';

const mapStateToProps = (state: KialiAppState) => ({
  graphTimestamp: state.serviceGraph.graphDataTimestamp,
  graphData: state.serviceGraph.graphData,
  isLoading: state.serviceGraph.isLoading,
  summaryData: state.serviceGraph.sidePanelInfo
    ? {
        summaryTarget: state.serviceGraph.sidePanelInfo.graphReference,
        summaryType: state.serviceGraph.sidePanelInfo.kind
      }
    : null,
  hideLegend: state.serviceGraph.hideLegend
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchGraphData: (graphDuration: Duration) => dispatch(ServiceGraphDataActions.fetchOverviewGraphData(graphDuration)),
  cleanupGraphData: () => dispatch(ServiceGraphDataActions.cleanupOverviewGraphData()),
  handleLegend: () => dispatch(ServiceGraphDataActions.handleLegend())
});

const OverviewGraphPageConnected = connect(mapStateToProps, mapDispatchToProps)(OverviewGraphPage);
export default OverviewGraphPageConnected;
