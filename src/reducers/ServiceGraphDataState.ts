import { ServiceGraphDataState } from '../store/Store';
import { ServiceGraphDataActionKeys } from '../actions/ServiceGraphDataActions';

export const SERVICE_GRAPH_DATA_INITIAL_STATE: ServiceGraphDataState = {
  isLoading: false,
  timestamp: 0,
  graphType: 'cola',
  duration: 60,
  graphData: {}
};

// This Reducer allows changes to the 'serviceGraphDataState' portion of Redux Store
const serviceGraphDataState = (state: ServiceGraphDataState = SERVICE_GRAPH_DATA_INITIAL_STATE, action) => {
  switch (action.type) {
    case ServiceGraphDataActionKeys.GET_GRAPH_DATA_START:
      console.log('ServiceGraphDataState reducer: graph data is loading...');
      return {
        ...state,
        isLoading: true
      };
    case ServiceGraphDataActionKeys.GET_GRAPH_DATA_SUCCESS:
      console.log('ServiceGraphDataState reducer: graph data successfully received');
      return {
        ...state,
        isLoading: false,
        timestamp: action.timestamp,
        graphData: action.graphData
      };
    case ServiceGraphDataActionKeys.GET_GRAPH_DATA_FAILURE:
      console.warn('ServiceGraphDataState reducer: failed to get graph data');
      return {
        ...state,
        isLoading: false,
        error: action.error
      };
    case ServiceGraphDataActionKeys.CHANGE_GRAPH_LAYOUT:
      console.debug(`ServiceGraphDataState reducer: Change graph layout to $action.graphType`);
      return {
        ...state,
        isLoading: false,
        graphType: action.graphType
      };
    case ServiceGraphDataActionKeys.CHANGE_DURATION:
      console.debug(`ServiceGraphDataState reducer: Change duration to $action.duration`);
      return {
        ...state,
        isLoading: false,
        duration: action.duration
      };
    default:
      return state;
  }
};

export default serviceGraphDataState;
