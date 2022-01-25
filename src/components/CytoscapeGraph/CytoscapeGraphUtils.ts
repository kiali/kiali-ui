import * as LayoutDictionary from './graphs/LayoutDictionary';
import {
  CytoscapeGlobalScratchData,
  CytoscapeGlobalScratchNamespace,
  DecoratedGraphEdgeData,
  DecoratedGraphNodeData,
  Layout
} from '../../types/Graph';
import * as Cy from 'cytoscape';

export const CyEdge = {
  destPrincipal: 'destPrincipal',
  grpc: 'grpc',
  grpcErr: 'grpcErr',
  grpcNoResponse: 'grpcNoResponse',
  grpcPercentErr: 'grpcPercentErr',
  grpcPercentReq: 'grpcPercentReq',
  hasTraffic: 'hasTraffic',
  http: 'http',
  http3xx: 'http3xx',
  http4xx: 'http4xx',
  http5xx: 'http5xx',
  httpNoResponse: 'httpNoResponse',
  httpPercentErr: 'httpPercentErr',
  httpPercentReq: 'httpPercentReq',
  id: 'id',
  isMTLS: 'isMTLS',
  protocol: 'protocol',
  responses: 'responses',
  responseTime: 'responseTime',
  sourcePrincipal: 'sourcePrincipal',
  tcp: 'tcp',
  throughput: 'throughput'
};

export const CyEdgeResponses = {
  flags: 'flags',
  hosts: 'hosts'
};

export const CyNode = {
  aggregate: 'aggregate',
  aggregateValue: 'aggregateValue',
  app: 'app',
  cluster: 'cluster',
  destServices: 'destServices',
  grpcIn: 'grpcIn',
  grpcInErr: 'grpcInErr',
  grpcInNoResponse: 'grpcInNoResponse',
  grpcOut: 'grpcOut',
  hasCB: 'hasCB',
  hasFaultInjection: 'hasFaultInjection',
  hasMirroring: 'hasMirroring',
  hasMissingSC: 'hasMissingSC',
  hasRequestRouting: 'hasRequestRouting',
  hasRequestTimeout: 'hasRequestTimeout',
  hasTCPTrafficShifting: 'hasTCPTrafficShifting',
  hasTrafficShifting: 'hasTrafficShifting',
  hasVS: 'hasVS',
  hasWorkloadEntry: 'hasWorkloadEntry',
  health: 'health',
  healthStatus: 'healthStatus',
  httpIn: 'httpIn',
  httpIn3xx: 'httpIn3xx',
  httpIn4xx: 'httpIn4xx',
  httpIn5xx: 'httpIn5xx',
  httpInNoResponse: 'httpInNoResponse',
  httpOut: 'httpOut',
  id: 'id',
  isBox: 'isBox',
  isDead: 'isDead',
  isIdle: 'isIdle',
  isInaccessible: 'isInaccessible',
  isIstio: 'isIstio',
  isMisconfigured: 'isMisconfigured',
  isOutside: 'isOutside',
  isRoot: 'isRoot',
  isServiceEntry: 'isServiceEntry',
  namespace: 'namespace',
  nodeType: 'nodeType',
  rank: 'rank',
  service: 'service',
  tcpIn: 'tcpIn',
  tcpOut: 'tcpOut',
  version: 'version',
  workload: 'workload'
};

export const ZoomOptions = {
  fitPadding: 25,
  maxZoom: 2.5
};

export const safeFit = (cy: Cy.Core, centerElements?: Cy.Collection) => {
  cy.fit(centerElements, ZoomOptions.fitPadding);
  if (cy.zoom() > ZoomOptions.maxZoom) {
    cy.zoom(ZoomOptions.maxZoom);
    !!centerElements && !!centerElements.length ? cy.center(centerElements) : cy.center();
  }
  // 'kiali-fit' is a custom event that we emit allowing us to reset cytoscapeGraph.customViewport
  cy.emit('kiali-fit');
};

// IMPORTANT! Layouts should be performed while zoom-handling is being ignored:
//   - call cy.emit('kiali-zoomignore', [true]) at some point prior to this call
//   - call cy.emit('kiali-zoomignore', [false]) in the promise handler
export const runLayout = (cy: Cy.Core, layout: Layout): Promise<any> => {
  // generate all labels so the layout algorithm can take them into consideration
  refreshLabels(cy, true);

  const layoutOptions = LayoutDictionary.getLayout(layout);
  let promise: Promise<any>;
  let cyLayout: Cy.Layouts;
  if (cy.nodes('$node > node').length > 0) {
    // if there is any parent (i.e. box) node, run the box-layout
    cyLayout = cy.layout({
      ...layoutOptions,
      name: 'box-layout',
      appBoxLayout: 'dagre',
      defaultLayout: layout.name
    });
  } else {
    cyLayout = cy.layout(layoutOptions);
  }
  promise = cyLayout.promiseOn('layoutstop');
  cyLayout.run();
  return promise;
};

// This ahould be called to ensure labels are up to date on-screen.  It may be needed to ensure cytoscape
// displays up-to-date labels, even if the label content has not changed.
// Note: the leaf-to-root approach here should mirror what is done in GraphStyles.ts#htmlNodeLabels()
export const refreshLabels = (cy: Cy.Core, force: boolean) => {
  const scratch = cy.scratch(CytoscapeGlobalScratchNamespace);
  if (force) {
    if (scratch) {
      cy.scratch(CytoscapeGlobalScratchNamespace, { ...scratch, forceLabels: true } as CytoscapeGlobalScratchData);
    }
  }

  // update labeles from leaf to node (i.e. inside out with respect to nested boxing).  This (in theory) ensures
  // that outer nodes will always be able to incorporate inner nodes' true bounding-box (one adjusted for the label).
  let nodes = cy.nodes('[^isBox]:visible');
  while (nodes.length > 0) {
    (cy as any).nodeHtmlLabel().updateNodeLabel(nodes);
    nodes = nodes.parents();
  }

  if (force) {
    if (scratch) {
      cy.scratch(CytoscapeGlobalScratchNamespace, { ...scratch, forceLabels: false } as CytoscapeGlobalScratchData);
    }
  }
};

export const decoratedEdgeData = (ele: Cy.EdgeSingular): DecoratedGraphEdgeData => {
  return ele.data();
};

export const decoratedNodeData = (ele: Cy.NodeSingular): DecoratedGraphNodeData => {
  return ele.data();
};

export const isCore = (target: Cy.NodeSingular | Cy.EdgeSingular | Cy.Core): target is Cy.Core => {
  return !('cy' in target);
};

export const isNode = (target: Cy.NodeSingular | Cy.EdgeSingular | Cy.Core): target is Cy.NodeSingular => {
  return !isCore(target) && target.isNode();
};

export const isEdge = (target: Cy.NodeSingular | Cy.EdgeSingular | Cy.Core): target is Cy.EdgeSingular => {
  return !isCore(target) && target.isEdge();
};
