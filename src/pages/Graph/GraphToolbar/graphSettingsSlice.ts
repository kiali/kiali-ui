import {
  EdgeLabelMode,
  GraphType,
  TrafficRate,
  GraphDefinition,
  NodeParamsType,
  Layout,
  SummaryData
} from '../../../types/Graph';
import { DagreGraph } from '../../../components/CytoscapeGraph/graphs/DagreGraph';
import { GraphState } from '../../../store/Store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const INITIAL_GRAPH_STATE: Readonly<GraphState> = {
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

export const graphSettingsSlice = createSlice({
  name: 'graph',
  initialState: INITIAL_GRAPH_STATE,
  reducers: {
    boxByClusterToggled: state => {
      state.toolbar.boxByCluster = !state.toolbar.boxByCluster;
    },
    boxByNamespaceToggled: state => {
      state.toolbar.boxByNamespace = !state.toolbar.boxByNamespace;
    },
    compressOnHideToggled: state => {
      state.toolbar.compressOnHide = !state.toolbar.compressOnHide;
    },
    findHelpToggled: state => {
      state.toolbar.showFindHelp = !state.toolbar.showFindHelp;
    },
    showVirtualServicesToggled: state => {
      state.toolbar.showVirtualServices = !state.toolbar.showVirtualServices;
    },
    showMissingSidecarsToggled: state => {
      state.toolbar.showMissingSidecars = !state.toolbar.showMissingSidecars;
    },
    showSecurityToggled: state => {
      state.toolbar.showSecurity = !state.toolbar.showSecurity;
    },
    showIdleEdgesToggled: state => {
      state.toolbar.showIdleEdges = !state.toolbar.showIdleEdges;
    },
    showIdleNodesToggled: state => {
      state.toolbar.showIdleNodes = !state.toolbar.showIdleNodes;
    },
    showLegendToggled: state => {
      state.toolbar.showLegend = !state.toolbar.showLegend;
    },
    operationNodesToggled: state => {
      state.toolbar.showOperationNodes = !state.toolbar.showOperationNodes;
      // TODO: This should be handled in GraphPage.ComponentDidUpdate (Init graph on type change)
      state.summaryData = null;
    },
    showServiceNodesToggled: state => {
      state.toolbar.showServiceNodes = !state.toolbar.showServiceNodes;
      // TODO: This should be handled in GraphPage.ComponentDidUpdate (Init graph on type change)
      state.summaryData = null;
    },
    trafficAnimationToggled: state => {
      state.toolbar.showTrafficAnimation = !state.toolbar.showTrafficAnimation;
    },
    namespaceChanged: state => {
      state.summaryData = null;
    },
    graphDefinitionUpdated(state, action: PayloadAction<GraphDefinition | null>) {
      state.graphDefinition = action.payload;
    },
    // TODO: Update paylod with correct type
    layoutUpdated(state, action: PayloadAction<Layout>) {
      state.layout = action.payload;
    },
    nodeUpdated(state, action: PayloadAction<NodeParamsType | undefined>) {
      state.node = action.payload;
      state.summaryData = null;
    },
    updateTimeUpdated(state, action: PayloadAction<number>) {
      state.updateTime = action.payload;
    },
    summaryDataUpdated(state, action: PayloadAction<SummaryData>) {
      state.summaryData = {
        summaryType: action.payload.summaryType,
        summaryTarget: action.payload.summaryTarget
      };
    },
    setEdgeLabels(state, action: PayloadAction<EdgeLabelMode[]>) {
      state.toolbar.edgeLabels = action.payload;
    },
    setFindValue(state, action: PayloadAction<string>) {
      state.toolbar.findValue = action.payload;
    },
    setGraphType(state, action: PayloadAction<GraphType>) {
      state.toolbar.graphType = action.payload;
      const isServiceGraph = action.payload === GraphType.SERVICE;
      state.toolbar.showOperationNodes = isServiceGraph ? false : state.toolbar.showOperationNodes;
      state.toolbar.showServiceNodes = isServiceGraph ? false : state.toolbar.showServiceNodes;
      // TODO: This should be handled in GraphPage.ComponentDidUpdate (Init graph on type change)
      state.summaryData = null;
    },
    setHideValue(state, action: PayloadAction<string>) {
      state.toolbar.hideValue = action.payload;
    },
    setIdleNodes(state, action: PayloadAction<boolean>) {
      state.toolbar.showIdleNodes = action.payload;
    },
    setTrafficRates(state, action: PayloadAction<TrafficRate[]>) {
      state.toolbar.trafficRates = action.payload;
    },
    resetSettings: state => {
      state.toolbar = INITIAL_GRAPH_STATE.toolbar;
    }
  }
});

export const {
  boxByClusterToggled,
  boxByNamespaceToggled,
  compressOnHideToggled,
  findHelpToggled,
  showVirtualServicesToggled,
  showMissingSidecarsToggled,
  showSecurityToggled,
  showIdleEdgesToggled,
  showIdleNodesToggled,
  showLegendToggled,
  operationNodesToggled,
  showServiceNodesToggled,
  trafficAnimationToggled,
  namespaceChanged,
  graphDefinitionUpdated,
  layoutUpdated,
  nodeUpdated,
  updateTimeUpdated,
  summaryDataUpdated,
  setEdgeLabels,
  setFindValue,
  setGraphType,
  setHideValue,
  setIdleNodes,
  resetSettings,
  setTrafficRates
} = graphSettingsSlice.actions;

export default graphSettingsSlice.reducer;
