import { createAction } from 'typesafe-actions';
import Namespace from '../types/Namespace';
import { Duration } from '../types/GraphFilter';
import * as API from '../services/Api';
import { authentication } from '../utils/Authentication';
import { MessageCenterActions } from './MessageCenterActions';
import { GraphDataActionKeys } from './GraphDataActionKeys';
import { GraphType, NodeParamsType } from '../types/Graph';

const EMPTY_GRAPH_DATA = { nodes: [], edges: [] };

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
      isUnused: undefined,
      isMTLS: undefined
    },
    nodes: {
      version: undefined,
      rate: undefined,
      rate3XX: undefined,
      rate4XX: undefined,
      rate5XX: undefined,
      hasCB: undefined,
      hasVS: undefined,
      isDead: undefined,
      isGroup: undefined,
      isRoot: undefined,
      isUnused: undefined,
      hasMissingSC: undefined,
      isOutside: undefined
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
export const GraphDataActions = {
  getGraphDataStart: createAction(GraphDataActionKeys.GET_GRAPH_DATA_START),
  getGraphDataSuccess: createAction(
    GraphDataActionKeys.GET_GRAPH_DATA_SUCCESS,
    (timestamp: number, graphData: any) => ({
      type: GraphDataActionKeys.GET_GRAPH_DATA_SUCCESS,
      timestamp: timestamp,
      graphData: decorateGraphData(graphData)
    })
  ),
  getGraphDataFailure: createAction(GraphDataActionKeys.GET_GRAPH_DATA_FAILURE, (error: any) => ({
    type: GraphDataActionKeys.GET_GRAPH_DATA_FAILURE,
    error: error
  })),
  handleLegend: createAction(GraphDataActionKeys.HANDLE_LEGEND),

  // action creator that performs the async request
  fetchGraphData: (
    namespace: Namespace,
    graphDuration: Duration,
    graphType: GraphType,
    injectServiceNodes: boolean,
    node?: NodeParamsType
  ) => {
    return dispatch => {
      dispatch(GraphDataActions.getGraphDataStart());
      const duration = graphDuration.value;
      let restParams = { duration: duration + 's', graphType: graphType, injectServiceNodes: injectServiceNodes };
      // TODO: this namespace should not be hardcoded
      if (namespace.name === 'istio-system') {
        restParams['includeIstio'] = true;
      }
      if (node) {
        return API.getNodeGraphElements(authentication(), namespace, node, restParams)
          .then(
            response => {
              const responseData: any = response['data'];
              const graphData = responseData && responseData.elements ? responseData.elements : EMPTY_GRAPH_DATA;
              const timestamp = responseData && responseData.timestamp ? responseData.timestamp : 0;
              dispatch(GraphDataActions.getGraphDataSuccess(timestamp, graphData));
            },
            error => {
              let emsg: string;
              if (error.response && error.response.data && error.response.data.error) {
                emsg = 'Cannot load the graph: ' + error.response.data.error;
              } else {
                emsg = 'Cannot load the graph: ' + error.toString();
              }
              dispatch(MessageCenterActions.addMessage(emsg));
              dispatch(GraphDataActions.getGraphDataFailure(emsg));
            }
          )
          .catch(err => {
            console.debug(API.getErrorMsg('Cannot load the graph: ', err));
          });
      }
      return API.getGraphElements(authentication(), namespace, restParams)
        .then(
          response => {
            const responseData: any = response['data'];
            const graphData = responseData && responseData.elements ? responseData.elements : EMPTY_GRAPH_DATA;
            const timestamp = responseData && responseData.timestamp ? responseData.timestamp : 0;
            dispatch(GraphDataActions.getGraphDataSuccess(timestamp, graphData));
          },
          error => {
            let emsg: string;
            if (error.response && error.response.data && error.response.data.error) {
              emsg = 'Cannot load the graph: ' + error.response.data.error;
            } else {
              emsg = 'Cannot load the graph: ' + error.toString();
            }
            dispatch(MessageCenterActions.addMessage(emsg));
            dispatch(GraphDataActions.getGraphDataFailure(emsg));
          }
        )
        .catch(err => {
          console.debug(API.getErrorMsg('Cannot load the graph: ', err));
        });
    };
  }
};
