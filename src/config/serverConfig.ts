import deepFreeze from 'deep-freeze';
import { DurationInSeconds } from '../types/Common';

export type IstioLabelKey = 'appLabelName' | 'versionLabelName';
export type Durations = { [key: number]: string };

export interface ServerConfig {
  istioNamespace: string;
  istioLabels: { [key in IstioLabelKey]: string };
  prometheus: {
    globalScrapeInterval?: DurationInSeconds;
    storageTsdbRetention?: DurationInSeconds;
  };
  webRoot?: string;
  durations: Durations;
}

const toDurations = (tupleArray: [number, string][]): Durations => {
  const obj = {};
  tupleArray.forEach(tuple => {
    obj[tuple[0]] = tuple[1];
  });
  return obj;
};

const computeValidDurations = (cfg: ServerConfig) => {
  const defaultDurations: [number, string][] = [
    [60, 'Last min'],
    [300, 'Last 5 min'],
    [600, 'Last 10 min'],
    [1800, 'Last 30 min'],
    [3600, 'Last hour'],
    [10800, 'Last 3 hours'],
    [21600, 'Last 6 hours'],
    [43200, 'Last 12 hours'],
    [86400, 'Last day'],
    [604800, 'Last 7 days'],
    [2592000, 'Last 30 days']
  ];
  if (cfg.prometheus.storageTsdbRetention) {
    const filtered = defaultDurations.filter(d => d[0] <= cfg.prometheus.storageTsdbRetention!);
    cfg.durations = toDurations(filtered);
  } else {
    cfg.durations = toDurations(defaultDurations);
  }
};

const tmpConfig: ServerConfig = process.env.TEST_RUNNER
  ? {
      istioNamespace: 'istio-system',
      istioLabels: {
        appLabelName: 'app',
        versionLabelName: 'version'
      },
      prometheus: {
        globalScrapeInterval: 15,
        storageTsdbRetention: 21600
      },
      durations: {}
    }
  : (window as any).serverConfig;
if (tmpConfig) {
  computeValidDurations(tmpConfig);
} else {
  console.error('serverConfig object is missing');
}
export const serverConfig: ServerConfig = deepFreeze(tmpConfig);
