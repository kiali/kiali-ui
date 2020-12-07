import deepFreeze from 'deep-freeze';
import { UNIT_TIME, MILLISECONDS } from '../types/Common';

// We assume this is always defined in the .env file
const documentationUrl = process.env.REACT_APP_KIALI_DOC_URL!;

const conf = {
  /** Configuration related with session */
  session: {
    /** TimeOut Session remain for warning user default 1 minute */
    timeOutforWarningUser: 1 * UNIT_TIME.MINUTE * MILLISECONDS
  },
  /** Toolbar Configuration */
  toolbar: {
    /** Duration default in 1 minute */
    defaultDuration: 1 * UNIT_TIME.MINUTE,
    /** By default refresh is 15 seconds */
    defaultRefreshInterval: 15 * MILLISECONDS,
    /** Time Range default in 10 minutes **/
    defaultTimeRange: {
      rangeDuration: 10 * UNIT_TIME.MINUTE
    },
    /** Options in refresh */
    refreshInterval: {
      0: 'Pause',
      10000: 'Every 10s',
      15000: 'Every 15s',
      30000: 'Every 30s',
      60000: 'Every 1m',
      300000: 'Every 5m',
      900000: 'Every 15m'
    },
    /** Graphs layouts types */
    graphLayouts: {
      cola: 'Cola',
      'cose-bilkent': 'Cose',
      dagre: 'Dagre'
    }
  },
  /** About Tracing Configuration*/
  tracing: {
    configuration: {
      limitResults: {
        20: 20,
        50: 50,
        100: 100,
        200: 200,
        300: 300,
        400: 400,
        500: 500
      },
      statusCode: {
        none: 'none',
        200: '200',
        400: '400',
        401: '401',
        403: '403',
        404: '404',
        405: '405',
        408: '408',
        500: '500',
        502: '502',
        503: '503',
        504: '504'
      }
    }
  },
  /** About dialog configuration */
  about: {
    project: {
      url: 'https://github.com/kiali',
      icon: 'RepositoryIcon',
      linkText: 'Find us on GitHub'
    },
    website: {
      url: 'https://www.kiali.io', // Without www, we get an SSL error
      icon: 'HomeIcon',
      linkText: 'Visit our web page'
    }
  },
  /** */
  documentation: {
    url: documentationUrl
  },
  /**  Login configuration */
  login: {
    headers: {
      'X-Auth-Type-Kiali-UI': '1'
    }
  },
  /** API configuration */
  api: {
    urls: {
      aggregateGraphElements: (namespace: string, aggregate: string, aggregateValue: string) =>
        `api/namespaces/${namespace}/aggregates/${aggregate}/${aggregateValue}/graph`,
      aggregateByServiceGraphElements: (
        namespace: string,
        aggregate: string,
        aggregateValue: string,
        service: string
      ) => `api/namespaces/${namespace}/aggregates/${aggregate}/${aggregateValue}/${service}/graph`,
      aggregateMetrics: (namespace: string, aggregate: string, aggregateValue: string) =>
        `api/namespaces/${namespace}/aggregates/${aggregate}/${aggregateValue}/metrics`,
      authenticate: 'api/authenticate',
      authInfo: 'api/auth/info',
      apps: (namespace: string) => `api/namespaces/${namespace}/apps`,
      app: (namespace: string, app: string) => `api/namespaces/${namespace}/apps/${app}`,
      appGraphElements: (namespace: string, app: string, version?: string) => {
        const baseUrl = `api/namespaces/${namespace}/applications/${app}`;
        const hasVersion = version && version !== 'unknown';
        const versionSuffixed = hasVersion ? `${baseUrl}/versions/${version}` : baseUrl;
        return `${versionSuffixed}/graph`;
      },
      appHealth: (namespace: string, app: string) => `api/namespaces/${namespace}/apps/${app}/health`,
      appMetrics: (namespace: string, app: string) => `api/namespaces/${namespace}/apps/${app}/metrics`,
      appDashboard: (namespace: string, app: string) => `api/namespaces/${namespace}/apps/${app}/dashboard`,
      appSpans: (namespace: string, app: string) => `api/namespaces/${namespace}/apps/${app}/spans`,
      clusters: 'api/clusters',
      serviceSpans: (namespace: string, service: string) => `api/namespaces/${namespace}/services/${service}/spans`,
      workloadSpans: (namespace: string, workload: string) => `api/namespaces/${namespace}/workloads/${workload}/spans`,
      customDashboard: (namespace: string, template: string) =>
        `api/namespaces/${namespace}/customdashboard/${template}`,
      grafana: 'api/grafana',
      istioConfig: (namespace: string) => `api/namespaces/${namespace}/istio`,
      istioConfigCreate: (namespace: string, objectType: string) => `api/namespaces/${namespace}/istio/${objectType}`,
      istioConfigDetail: (namespace: string, objectType: string, object: string) =>
        `api/namespaces/${namespace}/istio/${objectType}/${object}`,
      iter8: `api/iter8`,
      iter8Metrics: 'api/iter8/metrics',
      iter8Experiments: `api/iter8/experiments`,
      iter8ExperimentsByNamespace: (namespace: string) => `api/iter8/namespaces/${namespace}/experiments`,
      iter8Experiment: (namespace: string, name: string) => `api/iter8/namespaces/${namespace}/experiments/${name}`,
      iter8ExperimentYAML: (namespace: string, name: string) =>
        `api/iter8/namespaces/${namespace}/experiments/${name}/yaml`,
      iter8ExperimentUpdate: (namespace: string, name: string) =>
        `api/iter8/namespaces/${namespace}/experiments/${name}`,
      istioPermissions: 'api/istio/permissions',
      jaeger: 'api/jaeger',
      appTraces: (namespace: string, app: string) => `api/namespaces/${namespace}/apps/${app}/traces`,
      serviceTraces: (namespace: string, svc: string) => `api/namespaces/${namespace}/services/${svc}/traces`,
      workloadTraces: (namespace: string, wkd: string) => `api/namespaces/${namespace}/workloads/${wkd}/traces`,
      jaegerErrorTraces: (namespace: string, app: string) => `api/namespaces/${namespace}/apps/${app}/errortraces`,
      jaegerTrace: (idTrace: string) => `api/traces/${idTrace}`,
      logout: 'api/logout',
      metricsStats: 'api/stats/metrics',
      namespaces: 'api/namespaces',
      namespace: (namespace: string) => `api/namespaces/${namespace}`,
      namespacesGraphElements: `api/namespaces/graph`,
      namespaceHealth: (namespace: string) => `api/namespaces/${namespace}/health`,
      namespaceMetrics: (namespace: string) => `api/namespaces/${namespace}/metrics`,
      namespaceTls: (namespace: string) => `api/namespaces/${namespace}/tls`,
      namespaceValidations: (namespace: string) => `api/namespaces/${namespace}/validations`,
      meshTls: () => 'api/mesh/tls',
      istioStatus: () => 'api/istio/status',
      pod: (namespace: string, pod: string) => `api/namespaces/${namespace}/pods/${pod}`,
      podLogs: (namespace: string, pod: string) => `api/namespaces/${namespace}/pods/${pod}/logs`,
      podEnvoyProxy: (namespace: string, pod: string) => `api/namespaces/${namespace}/pods/${pod}/config_dump`,
      podEnvoyProxyResourceEntries: (namespace: string, pod: string, resource: string) =>
        `api/namespaces/${namespace}/pods/${pod}/config_dump/${resource}`,
      serverConfig: `api/config`,
      services: (namespace: string) => `api/namespaces/${namespace}/services`,
      service: (namespace: string, service: string) => `api/namespaces/${namespace}/services/${service}`,
      serviceGraphElements: (namespace: string, service: string) =>
        `api/namespaces/${namespace}/services/${service}/graph`,
      serviceHealth: (namespace: string, service: string) => `api/namespaces/${namespace}/services/${service}/health`,
      serviceMetrics: (namespace: string, service: string) => `api/namespaces/${namespace}/services/${service}/metrics`,
      serviceDashboard: (namespace: string, service: string) =>
        `api/namespaces/${namespace}/services/${service}/dashboard`,
      status: 'api/status',
      workloads: (namespace: string) => `api/namespaces/${namespace}/workloads`,
      workload: (namespace: string, workload: string) => `api/namespaces/${namespace}/workloads/${workload}`,
      workloadGraphElements: (namespace: string, workload: string) =>
        `api/namespaces/${namespace}/workloads/${workload}/graph`,
      workloadHealth: (namespace: string, workload: string) =>
        `api/namespaces/${namespace}/workloads/${workload}/health`,
      workloadMetrics: (namespace: string, workload: string) =>
        `api/namespaces/${namespace}/workloads/${workload}/metrics`,
      workloadDashboard: (namespace: string, workload: string) =>
        `api/namespaces/${namespace}/workloads/${workload}/dashboard`
    }
  }
};

export const config = deepFreeze(conf) as typeof conf;
