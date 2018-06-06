import { createAction } from 'typesafe-actions';
import Namespace from '../types/Namespace';
import { Duration } from '../types/GraphFilter';
import * as API from '../services/Api';
import * as MessageCenter from '../utils/MessageCenter';
import { authentication } from '../utils/Authentication';
import * as H from '../utils/Health';

const EMPTY_GRAPH_DATA = { nodes: [], edges: [] };

export enum ServiceGraphDataActionKeys {
  GET_GRAPH_DATA_START = 'GET_GRAPH_DATA_START',
  GET_GRAPH_DATA_SUCCESS = 'GET_GRAPH_DATA_SUCCESS',
  GET_GRAPH_DATA_FAILURE = 'GET_GRAPH_DATA_FAILURE',
  CLEANUP_GRAPH_DATA = 'CLEANUP_GRAPH_DATA',
  GET_OVERVIEW_GRAPH_DATA_START = 'GET_OVERVIEW_GRAPH_DATA_START',
  GET_OVERVIEW_GRAPH_DATA_SUCCESS = 'GET_OVERVIEW_GRAPH_DATA_SUCCESS',
  GET_OVERVIEW_GRAPH_DATA_FAILURE = 'GET_OVERVIEW_GRAPH_DATA_FAILURE',
  CLEANUP_OVERVIEW_GRAPH_DATA = 'CLEANUP_OVERVIEW_GRAPH_DATA',
  HANDLE_LEGEND = 'HANDLE_LEGEND'
}

// When updating the cytoscape graph, the element data expects to have all the changes
// non provided values are taken as "this didn't change", similar as setState does.
// Put default values for all fields that are omitted.
const decorateGraphData = (graphData: any) => {
  const elementsDefaults = {
    edges: {
      rate: undefined,
      rate3XX: undefined,
      rate4XX: undefined,
      rate5XX: undefined,
      percentErr: undefined,
      percentRate: undefined,
      latency: undefined,
      isUnused: undefined
    },
    nodes: {
      version: undefined,
      rate: undefined,
      rate3XX: undefined,
      rate4XX: undefined,
      rate5XX: undefined,
      rateSelfInvoke: undefined,
      globalStatus: undefined,
      hasCB: undefined,
      hasMissingSidecars: undefined,
      hasRR: undefined,
      isDead: undefined,
      isGroup: undefined,
      isRoot: undefined,
      isUnused: undefined
    }
  };
  if (graphData) {
    if (graphData.nodes) {
      graphData.nodes = graphData.nodes.map(node => {
        const decoratedNode = { ...node };
        decoratedNode.data = { ...elementsDefaults.nodes, ...decoratedNode.data };
        return decoratedNode;
      });
    }
    if (graphData.edges) {
      graphData.edges = graphData.edges.map(edge => {
        const decoratedEdge = { ...edge };
        decoratedEdge.data = { ...elementsDefaults.edges, ...decoratedEdge.data };
        return decoratedEdge;
      });
    }
  }
  return graphData;
};

// synchronous action creators
export const ServiceGraphDataActions = {
  getGraphDataStart: createAction(ServiceGraphDataActionKeys.GET_GRAPH_DATA_START),
  getGraphDataSuccess: createAction(
    ServiceGraphDataActionKeys.GET_GRAPH_DATA_SUCCESS,
    (timestamp: number, graphData: any) => ({
      type: ServiceGraphDataActionKeys.GET_GRAPH_DATA_SUCCESS,
      timestamp: timestamp,
      graphData: decorateGraphData(graphData)
    })
  ),
  getGraphDataFailure: createAction(ServiceGraphDataActionKeys.GET_GRAPH_DATA_FAILURE, (error: any) => ({
    type: ServiceGraphDataActionKeys.GET_GRAPH_DATA_FAILURE,
    error: error
  })),
  cleanupGraphData: createAction(ServiceGraphDataActionKeys.CLEANUP_GRAPH_DATA),
  getOverviewGraphDataStart: createAction(ServiceGraphDataActionKeys.GET_OVERVIEW_GRAPH_DATA_START),
  getOverviewGraphDataSuccess: createAction(
    ServiceGraphDataActionKeys.GET_OVERVIEW_GRAPH_DATA_SUCCESS,
    (timestamp: number, graphData: any) => ({
      type: ServiceGraphDataActionKeys.GET_OVERVIEW_GRAPH_DATA_SUCCESS,
      timestamp: timestamp,
      graphData: decorateGraphData(graphData)
    })
  ),
  getOverviewGraphDataFailure: createAction(
    ServiceGraphDataActionKeys.GET_OVERVIEW_GRAPH_DATA_FAILURE,
    (error: any) => ({
      type: ServiceGraphDataActionKeys.GET_OVERVIEW_GRAPH_DATA_FAILURE,
      error: error
    })
  ),
  cleanupOverviewGraphData: createAction(ServiceGraphDataActionKeys.CLEANUP_OVERVIEW_GRAPH_DATA),
  handleLegend: createAction(ServiceGraphDataActionKeys.HANDLE_LEGEND),

  // action creator that performs the async request
  fetchGraphData: (namespace: Namespace, graphDuration: Duration) => {
    return dispatch => {
      dispatch(ServiceGraphDataActions.getGraphDataStart());
      const duration = graphDuration.value;
      const restParams = { duration: duration + 's' };
      API.getGraphElements(authentication(), namespace, restParams).then(
        response => {
          const responseData: any = response['data'];
          const graphData = responseData && responseData.elements ? responseData.elements : EMPTY_GRAPH_DATA;
          const timestamp = responseData && responseData.timestamp ? responseData.timestamp : 0;
          dispatch(ServiceGraphDataActions.getGraphDataSuccess(timestamp, graphData));
        },
        error => {
          let emsg: string;
          if (error.response && error.response.data && error.response.data.error) {
            emsg = 'Cannot load the graph: ' + error.response.data.error;
          } else {
            emsg = 'Cannot load the graph: ' + error.toString();
          }
          MessageCenter.add(emsg);
          dispatch(ServiceGraphDataActions.getGraphDataFailure(emsg));
        }
      );
    };
  },
  // action creator that performs the async request
  fetchOverviewGraphData: (graphDuration: Duration) => {
    return dispatch => {
      dispatch(ServiceGraphDataActions.getOverviewGraphDataStart());
      const duration = graphDuration.value;
      const restParams = { duration: duration + 's' };
      API.getOverviewGraphElements(authentication(), restParams).then(
        response => {
          const responseData: any = response['data'];
          const graphData = responseData && responseData.elements ? responseData.elements : EMPTY_GRAPH_DATA;
          graphData.nodes.forEach(n => {
            const health = n.data.health;
            if (health) {
              n.data.globalStatus = H.computeAggregatedHealth(health);
            }
          });
          const timestamp = responseData && responseData.timestamp ? responseData.timestamp : 0;
          dispatch(ServiceGraphDataActions.getOverviewGraphDataSuccess(timestamp, graphData));
        },
        error => {
          let emsg: string;
          if (error.response && error.response.data && error.response.data.error) {
            emsg = 'Cannot load the graph: ' + error.response.data.error;
          } else {
            emsg = 'Cannot load the graph: ' + error.toString();
          }
          console.log('OverviewGraphDataActions: ', emsg);
          MessageCenter.add(emsg);
          dispatch(ServiceGraphDataActions.getOverviewGraphDataFailure(emsg));
        }
      );
    };
  }
};
