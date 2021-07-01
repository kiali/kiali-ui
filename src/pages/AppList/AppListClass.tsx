import { AppList, AppListItem } from '../../types/AppList';
import * as API from '../../services/Api';

export const getAppItems = (data: AppList, rateInterval: number): AppListItem[] => {
  if (data.applications) {
    return data.applications.map(app => ({
      namespace: data.namespace.name,
      name: app.name,
      istioSidecar: app.istioSidecar,
      healthPromise: API.getAppHealth(data.namespace.name, app.name, rateInterval, app.istioSidecar),
      labels: app.labels,
      virtualServices: app.virtualServices,
      destinationRules: app.destinationRules,
      gateways: app.gateways,
      authorizationPolicies: app.authorizationPolicies,
      peerAuthentications: app.peerAuthentications,
      sidecars: app.sidecars,
      requestAuthentications: app.requestAuthentications,
      envoyFilters: app.envoyFilters
    }));
  }
  return [];
};
