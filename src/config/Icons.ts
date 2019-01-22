import deepFreeze from 'deep-freeze';

const icons = {
  ISTIO: {
    MISSING_SIDECAR: { type: 'pf', name: 'blueprint', ascii: '\ue915 ', color: 'red' },
    VIRTUALSERVICE: { type: 'fa', name: 'code-fork', ascii: '\uf126 ' },
    CIRCUIT_BREAKER: { type: 'fa', name: 'bolt', ascii: '\uf0e7 ' }
  },
  MENU: {
    OVERVIEW: 'TachometerAltIcon',
    GRAPH: 'TopologyIcon',
    APPLICATIONS: 'ApplicationsIcon',
    WORKLOADS: 'BundleIcon',
    SERVICES: 'ServiceIcon',
    ISTIO_CONFIG: 'PficonTemplateIcon',
    DISTRIBUTED_TRACING: 'PawIcon'
  }
};

export const ICONS = () => {
  return deepFreeze(icons) as typeof icons;
};
