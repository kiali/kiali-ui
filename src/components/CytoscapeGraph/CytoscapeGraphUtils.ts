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

// Note that this call is typically prefixed with cy.emit('kiali-zoomignore', [true]), and
// when the promise resolves then call cy.emit('kiali-zoomignore', [false])
export const runLayout = (cy: Cy.Core, layout: Layout): Promise<any> => {
  // Using the extension, force labels prior to the layout, so that the layout can take the lebel space into consideration
  // Do this from leaf-to-root
  const scratch = cy.scratch(CytoscapeGlobalScratchNamespace);
  if (scratch) {
    cy.scratch(CytoscapeGlobalScratchNamespace, { ...scratch, forceLabels: true } as CytoscapeGlobalScratchData);
  }
  let nodes = cy.nodes('[^isBox]:visible');
  while (nodes.length > 0) {
    (cy as any).nodeHtmlLabel().updateNodeLabel(nodes);
    nodes = nodes.parents();
  }
  if (scratch) {
    cy.scratch(CytoscapeGlobalScratchNamespace, { ...scratch, forceLabels: false } as CytoscapeGlobalScratchData);
  }

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
  console.log('runLayout');
  cyLayout.run();
  return promise;
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
