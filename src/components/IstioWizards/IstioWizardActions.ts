import { TLSStatus } from '../../types/TLSStatus';
import { WorkloadOverview } from '../../types/ServiceInfo';
import { WorkloadWeight } from './WeightedRouting';
import { Rule } from './MatchingRouting/Rules';
import { SuspendedRoute } from './SuspendTraffic';
import {
  DestinationRule,
  DestinationWeight,
  HTTPMatchRequest,
  HTTPRoute,
  VirtualService
} from '../../types/IstioObjects';
import { serverConfig } from '../../config';

export const WIZARD_WEIGHTED_ROUTING = 'create_weighted_routing';
export const WIZARD_MATCHING_ROUTING = 'create_matching_routing';
export const WIZARD_SUSPEND_TRAFFIC = 'suspend_traffic';

export const WIZARD_TITLES = {
  [WIZARD_WEIGHTED_ROUTING]: 'Create Weighted Routing',
  [WIZARD_MATCHING_ROUTING]: 'Create Matching Routing',
  [WIZARD_SUSPEND_TRAFFIC]: 'Suspend Traffic'
};

export type WizardProps = {
  show: boolean;
  type: string;
  namespace: string;
  serviceName: string;
  tlsStatus?: TLSStatus;
  workloads: WorkloadOverview[];
  onClose: (changed: boolean) => void;
};

export type WizardState = {
  showWizard: boolean;
  workloads: WorkloadWeight[];
  rules: Rule[];
  suspendedRoutes: SuspendedRoute[];
  valid: boolean;
  mtlsMode: string;
  tlsModified: boolean;
  loadBalancer: string;
  lbModified: boolean;
};

const SERVICE_UNAVAILABLE = 503;

const buildHTTPMatchRequest = (matches: string[]): HTTPMatchRequest[] => {
  const matchRequests: HTTPMatchRequest[] = [];
  const matchHeaders: HTTPMatchRequest = { headers: {} };
  // Headers are grouped
  matches
    .filter(match => match.startsWith('headers'))
    .forEach(match => {
      // match follows format:  headers [<header-name>] <op> <value>
      const i0 = match.indexOf('[');
      const j0 = match.indexOf(']');
      const headerName = match.substring(i0 + 1, j0).trim();
      const i1 = match.indexOf(' ', j0 + 1);
      const j1 = match.indexOf(' ', i1 + 1);
      const op = match.substring(i1 + 1, j1).trim();
      const value = match.substring(j1 + 1).trim();
      matchHeaders.headers![headerName] = { [op]: value };
    });
  if (Object.keys(matchHeaders.headers || {}).length > 0) {
    matchRequests.push(matchHeaders);
  }
  // Rest of matches
  matches
    .filter(match => !match.startsWith('headers'))
    .forEach(match => {
      // match follows format: <name> <op> <value>
      const i = match.indexOf(' ');
      const j = match.indexOf(' ', i + 1);
      const name = match.substring(0, i).trim();
      const op = match.substring(i + 1, j).trim();
      const value = match.substring(j + 1).trim();
      matchRequests.push({
        [name]: {
          [op]: value
        }
      });
    });
  return matchRequests;
};

export const createIstioTraffic = (wProps: WizardProps, wState: WizardState): [DestinationRule, VirtualService] => {
  const wkdNameVersion: { [key: string]: string } = {};

  // DestinationRule from the labels
  const wizardDR: DestinationRule = {
    metadata: {
      namespace: wProps.namespace,
      name: wProps.serviceName
    },
    spec: {
      host: wProps.serviceName,
      subsets: wProps.workloads.map(workload => {
        // Using version
        const versionLabelName = serverConfig.istioLabels.versionLabelName;
        const versionValue = workload.labels![versionLabelName];
        const labels: { [key: string]: string } = {};
        labels[versionLabelName] = versionValue;
        // Populate helper table workloadName -> version
        wkdNameVersion[workload.name] = versionValue;
        return {
          name: versionValue,
          labels: labels
        };
      })
    }
  };

  const wizardVS: VirtualService = {
    metadata: {
      namespace: wProps.namespace,
      name: wProps.serviceName
    },
    spec: {}
  };

  switch (wProps.type) {
    case WIZARD_WEIGHTED_ROUTING: {
      // VirtualService from the weights
      wizardVS.spec = {
        hosts: [wProps.serviceName],
        http: [
          {
            route: wState.workloads.map(workload => {
              return {
                destination: {
                  host: wProps.serviceName,
                  subset: wkdNameVersion[workload.name]
                },
                weight: workload.weight
              };
            })
          }
        ]
      };
      break;
    }
    case WIZARD_MATCHING_ROUTING: {
      // VirtualService from the routes
      wizardVS.spec = {
        hosts: [wProps.serviceName],
        http: wState.rules.map(rule => {
          const httpRoute: HTTPRoute = {};
          httpRoute.route = [];
          for (let iRoute = 0; iRoute < rule.routes.length; iRoute++) {
            const destW: DestinationWeight = {
              destination: {
                host: wProps.serviceName,
                subset: wkdNameVersion[rule.routes[iRoute]]
              }
            };
            destW.weight = Math.floor(100 / rule.routes.length);
            if (iRoute === 0) {
              destW.weight = destW.weight + (100 % rule.routes.length);
            }
            httpRoute.route.push(destW);
          }

          if (rule.matches.length > 0) {
            httpRoute.match = buildHTTPMatchRequest(rule.matches);
          }
          return httpRoute;
        })
      };
      break;
    }
    case WIZARD_SUSPEND_TRAFFIC: {
      // VirtualService from the suspendedRoutes
      const httpRoute: HTTPRoute = {
        route: []
      };
      // Let's use the # os suspended notes to create weights
      const totalRoutes = wState.suspendedRoutes.length;
      const closeRoutes = wState.suspendedRoutes.filter(s => s.suspended).length;
      const openRoutes = totalRoutes - closeRoutes;
      let firstValue = true;
      // If we have some suspended routes, we need to use weights
      if (closeRoutes < totalRoutes) {
        for (let i = 0; i < wState.suspendedRoutes.length; i++) {
          const suspendedRoute = wState.suspendedRoutes[i];
          const destW: DestinationWeight = {
            destination: {
              host: wProps.serviceName,
              subset: wkdNameVersion[suspendedRoute.workload]
            }
          };
          if (suspendedRoute.suspended) {
            // A suspended route has a 0 weight
            destW.weight = 0;
          } else {
            destW.weight = Math.floor(100 / openRoutes);
            // We need to adjust the rest
            if (firstValue) {
              destW.weight += 100 % openRoutes;
              firstValue = false;
            }
          }
          httpRoute.route!.push(destW);
        }
      } else {
        // All routes are suspended, so we use an fault/abort rule
        httpRoute.route = [
          {
            destination: {
              host: wProps.serviceName
            }
          }
        ];
        httpRoute.fault = {
          abort: {
            httpStatus: SERVICE_UNAVAILABLE,
            percentage: {
              value: 100
            }
          }
        };
      }
      wizardVS.spec = {
        hosts: [wProps.serviceName],
        http: [httpRoute]
      };
      break;
    }
    default:
      console.log('Unrecognized type');
  }

  if (wState.tlsModified || wState.lbModified) {
    wizardDR.spec.trafficPolicy = {};
    if (wState.tlsModified) {
      wizardDR.spec.trafficPolicy.tls = {
        mode: wState.mtlsMode
      };
    }
    if (wState.lbModified) {
      wizardDR.spec.trafficPolicy.loadBalancer = {
        simple: wState.loadBalancer
      };
    }
  }
  return [wizardDR, wizardVS];
};
