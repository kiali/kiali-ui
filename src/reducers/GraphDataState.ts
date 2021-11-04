import { GraphState } from '../store/Store';
import { GraphType, TrafficRate } from '../types/Graph';
import { DagreGraph } from '../components/CytoscapeGraph/graphs/DagreGraph';
import graphSettingsSlice from '../pages/Graph/GraphToolbar/graphSettingsSlice';

export const INITIAL_GRAPH_STATE: GraphState = {
  graphDefinition: null,
  layout: DagreGraph.getLayout(),
  node: undefined,
  summaryData: null,
  toolbar: {
    boxByCluster: false,
    boxByNamespace: false,
    compressOnHide: true,
    edgeLabels: [],
    findValue: '',
    graphType: GraphType.VERSIONED_APP,
    hideValue: '',
    showFindHelp: false,
    showIdleEdges: false,
    showIdleNodes: false,
    showLegend: false,
    showMissingSidecars: true,
    showOperationNodes: false,
    showSecurity: false,
    showServiceNodes: true,
    showTrafficAnimation: false,
    showVirtualServices: true,
    trafficRates: [
      TrafficRate.GRPC_GROUP,
      TrafficRate.GRPC_REQUEST,
      TrafficRate.HTTP_GROUP,
      TrafficRate.HTTP_REQUEST,
      TrafficRate.TCP_GROUP,
      TrafficRate.TCP_SENT
    ]
  },
  updateTime: 0
};

export default graphSettingsSlice;
