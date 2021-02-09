import _ from 'lodash';

import { ServerConfig } from '../types/ServerConfig';
import { parseHealthConfig } from './HealthConfig';
import { store } from 'store/ConfigStore';
import { UserSettingsActions } from 'actions/UserSettingsActions';
import { config } from 'config';
import Namespace from 'types/Namespace';
import { NamespaceActions } from 'actions/NamespaceAction';

export type Durations = { [key: number]: string };

export type ComputedServerConfig = ServerConfig & {
  durations: Durations;
};

export const humanDurations = (config: ComputedServerConfig, prefix?: string, suffix?: string) =>
  _.mapValues(config.durations, v => _.reject([prefix, v, suffix], _.isEmpty).join(' '));

const toDurations = (tupleArray: [number, string][]): Durations => {
  const obj = {};
  tupleArray.forEach(tuple => {
    obj[tuple[0]] = tuple[1];
  });
  return obj;
};

const durationsTuples: [number, string][] = [
  [60, '1m'],
  [300, '5m'],
  [600, '10m'],
  [1800, '30m'],
  [3600, '1h'],
  [10800, '3h'],
  [21600, '6h'],
  [43200, '12h'],
  [86400, '1d'],
  [604800, '7d'],
  [2592000, '30d']
];

const computeValidDurations = (cfg: ComputedServerConfig) => {
  let filtered = durationsTuples;
  if (cfg.prometheus.storageTsdbRetention) {
    // Make sure we'll keep at least one item
    if (cfg.prometheus.storageTsdbRetention <= durationsTuples[0][0]) {
      filtered = [durationsTuples[0]];
    } else {
      filtered = durationsTuples.filter(d => d[0] <= cfg.prometheus.storageTsdbRetention!);
    }
  }
  cfg.durations = toDurations(filtered);
};

// Set some defaults. Mainly used in tests, because
// these will be overwritten on user login.
let serverConfig: ComputedServerConfig = {
  healthConfig: {
    rate: []
  },
  installationTag: 'Kiali Console',
  istioAnnotations: {
    istioInjectionAnnotation: 'sidecar.istio.io/inject'
  },
  istioIdentityDomain: 'svc.cluster.local',
  istioNamespace: 'istio-system',
  istioComponentNamespaces: new Map<string, string>(),
  istioLabels: {
    appLabelName: 'app',
    injectionLabelName: 'istio-injection',
    versionLabelName: 'version'
  },
  kialiFeatureFlags: {
    istioInjectionAction: true
  },
  prometheus: {
    globalScrapeInterval: 15,
    storageTsdbRetention: 21600
  },
  durations: {}
};
computeValidDurations(serverConfig);
export { serverConfig };

export const toValidDuration = (duration: number): number => {
  // Check if valid
  if (serverConfig.durations[duration]) {
    return duration;
  }
  // Get closest duration
  for (let i = durationsTuples.length - 1; i >= 0; i--) {
    if (duration > durationsTuples[i][0]) {
      return durationsTuples[i][0];
    }
  }
  return durationsTuples[0][0];
};

export const setServerConfig = (svcConfig: ServerConfig) => {
  serverConfig = {
    ...svcConfig,
    durations: {}
  };
  serverConfig.healthConfig = svcConfig.healthConfig
    ? parseHealthConfig(svcConfig.healthConfig)
    : serverConfig.healthConfig;

  computeValidDurations(serverConfig);

  // apply configured UI Defaults
  const uiDefaults = serverConfig.kialiFeatureFlags.uiDefaults;
  if (uiDefaults) {
    // Duration (aka metricsPerRefresh)
    if (uiDefaults.metricsPerRefresh) {
      const validDurations = humanDurations(serverConfig, '', '');
      let metricsPerRefresh = 0;
      for (const [key, value] of Object.entries(validDurations)) {
        if (value === uiDefaults.metricsPerRefresh) {
          metricsPerRefresh = Number(key);
          break;
        }
      }
      if (metricsPerRefresh > 0) {
        store.dispatch(UserSettingsActions.setDuration(metricsPerRefresh));
        console.debug(`Setting UI Default: metricsPerRefresh [${uiDefaults.metricsPerRefresh}=${metricsPerRefresh}s]`);
      } else {
        console.debug(`Ignoring invalid UI Default: metricsPerRefresh [${uiDefaults.metricsPerRefresh}]`);
      }
    }

    // Refresh Interval
    let refreshInterval = -1;
    if (uiDefaults.refreshInterval) {
      for (const [key, value] of Object.entries(config.toolbar.refreshInterval)) {
        if (value.endsWith(uiDefaults.refreshInterval)) {
          refreshInterval = Number(key);
          break;
        }
      }
      if (refreshInterval >= 0) {
        store.dispatch(UserSettingsActions.setRefreshInterval(refreshInterval));
        console.debug(`Setting UI Default: refreshInterval [${uiDefaults.refreshInterval}=${refreshInterval}ms]`);
      } else {
        console.debug(`Ignoring invalid UI Default: refreshInterval [${uiDefaults.refreshInterval}]`);
      }
    }

    // Selected Namespaces
    if (uiDefaults.namespaces && uiDefaults.namespaces.length > 0) {
      const namespaces = store.getState().namespaces.items;
      const namespaceNames: string[] = namespaces ? namespaces.map(ns => ns.name) : [];
      const activeNamespaces: Namespace[] = [];

      for (const name of uiDefaults.namespaces) {
        if (namespaceNames.includes(name)) {
          activeNamespaces.push({ name: name } as Namespace);
        } else {
          console.debug(`Ignoring invalid UI Default: namespace [${name}]`);
        }
      }
      if (activeNamespaces.length > 0) {
        store.dispatch(NamespaceActions.setActiveNamespaces(activeNamespaces));
        console.log(`Setting UI Default: namespaces ${JSON.stringify(activeNamespaces.map(ns => ns.name))}`);
      }
    }
  }
};

export const isIstioNamespace = (namespace: string): boolean => {
  if (namespace === serverConfig.istioNamespace) {
    return true;
  }
  return serverConfig.istioComponentNamespaces
    ? Object.values(serverConfig.istioComponentNamespaces).includes(namespace)
    : false;
};
