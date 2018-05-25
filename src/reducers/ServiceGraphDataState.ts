import { ServiceGraphState } from '../store/Store';
import { ServiceGraphDataActionKeys } from '../actions/ServiceGraphDataActions';
import { ServiceGraphActionKeys } from '../actions/ServiceGraphActions';
import FilterStateReducer from './ServiceGraphFilterState';

const EMPTY_GRAPH_DATA = { nodes: [], edges: [] };

const INITIAL_STATE: any = {
  isLoading: false,
  graphDataTimestamp: 0,
  graphData: EMPTY_GRAPH_DATA,
  sidePanelInfo: null,
  hideLegend: true
};

// This Reducer allows changes to the 'serviceGraphDataState' portion of Redux Store
const serviceGraphDataState = (state: ServiceGraphState = INITIAL_STATE, action) => {
  const filterState = FilterStateReducer(state.filterState, action);
  let newState: ServiceGraphState = {
    ...state,
    filterState
  };

  switch (action.type) {
    case ServiceGraphDataActionKeys.GET_GRAPH_DATA_START:
    case ServiceGraphDataActionKeys.GET_OVERVIEW_GRAPH_DATA_START:
      newState.isLoading = true;
      break;
    case ServiceGraphDataActionKeys.HANDLE_LEGEND:
      return {
        ...state,
        hideLegend: !state.hideLegend
      };
    case ServiceGraphDataActionKeys.GET_GRAPH_DATA_SUCCESS:
    case ServiceGraphDataActionKeys.GET_OVERVIEW_GRAPH_DATA_SUCCESS:
      newState.isLoading = false;
      newState.graphDataTimestamp = action.timestamp;
      newState.graphData = action.graphData;
      break;
    case ServiceGraphDataActionKeys.GET_GRAPH_DATA_FAILURE:
    case ServiceGraphDataActionKeys.GET_OVERVIEW_GRAPH_DATA_FAILURE:
      console.warn('ServiceGraphDataState reducer: failed to get graph data');
      newState.isLoading = false;
      // newState.error = action.error; // Already handled in the action.
      break;
    case ServiceGraphActionKeys.SERVICE_GRAPH_SIDE_PANEL_SHOW_INFO:
      newState.sidePanelInfo = {
        kind: action.summaryType,
        graphReference: action.summaryTarget
      };
      break;
    case ServiceGraphDataActionKeys.CLEANUP_GRAPH_DATA:
    case ServiceGraphDataActionKeys.CLEANUP_OVERVIEW_GRAPH_DATA:
      newState.graphData = EMPTY_GRAPH_DATA;
      newState.graphDataTimestamp = 0;
      break;
    default:
      break;
  }

  return newState;
};

export default serviceGraphDataState;
