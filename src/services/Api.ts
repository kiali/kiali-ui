import axios, { AxiosError } from 'axios';
import Namespace from '../types/Namespace';
import MetricsOptions from '../types/MetricsOptions';
import { Metrics } from '../types/Metrics';
import { IstioConfigDetails } from '../types/IstioConfigDetails';
import { IstioConfigList } from '../types/IstioConfigListComponent';
import { WorkloadNamespaceResponse } from '../types/Workload';
import { Deployment, NamespaceValidations, Validations } from '../types/IstioObjects';
import { ServiceDetailsInfo } from '../types/ServiceInfo';
import JaegerInfo from '../types/JaegerInfo';
import GrafanaInfo from '../types/GrafanaInfo';
import { AppHealth, ServiceHealth, WorkloadHealth, NamespaceAppHealth, NamespaceWorkloadHealth } from '../types/Health';
import { ServiceList } from '../types/ServiceListComponent';
import { AppList } from '../types/AppList';

interface Response<T> {
  data: T;
}

/**  Headers Definitions */

const loginHeaders = { 'X-Auth-Type-Kiali-UI': '1' };
const authHeader = (auth: string) => ({ Authorization: auth });

/**  Helpers to Requests */

const getHeaders = (auth?: string) => {
  if (auth === undefined) {
    return { ...loginHeaders };
  }
  return { ...loginHeaders, ...authHeader(auth) };
};

const basicAuth = (username: string, password: string) => {
  return { username: username, password: password };
};

let newRequest = <T>(method: string, url: string, queryParams: any, data: any, auth?: string) => {
  return new Promise<Response<T>>((resolve, reject) => {
    axios({
      method: method,
      url: url,
      data: data,
      headers: getHeaders(auth),
      params: queryParams
    })
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/** Requests */
export const login = (username: string, password: string) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: '/api/token',
      headers: getHeaders(),
      auth: basicAuth(username, password)
    })
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getStatus = () => {
  return newRequest('get', '/api/status', {}, {});
};

export const getNamespaces = (auth: string): Promise<Response<Namespace[]>> => {
  return newRequest('get', `/api/namespaces`, {}, {}, auth);
};

export const getNamespaceMetrics = (auth: string, namespace: String, params: any): Promise<Response<Metrics>> => {
  return newRequest('get', `/api/namespaces/${namespace}/metrics`, params, {}, auth);
};

export const getIstioConfig = (
  auth: string,
  namespace: String,
  objects: String[]
): Promise<Response<IstioConfigList>> => {
  let params = objects && objects.length > 0 ? { objects: objects.join(',') } : {};
  return newRequest('get', `/api/namespaces/${namespace}/istio`, params, {}, auth);
};

export const getIstioConfigDetail = (
  auth: string,
  namespace: String,
  objectType: String,
  object: String
): Promise<Response<IstioConfigDetails>> => {
  return newRequest('get', `/api/namespaces/${namespace}/istio/${objectType}/${object}`, {}, {}, auth);
};

export const getServices = (auth: string, namespace: String): Promise<Response<ServiceList>> => {
  return newRequest('get', `/api/namespaces/${namespace}/services`, {}, {}, auth);
};

export const getServiceMetrics = (
  auth: string,
  namespace: String,
  service: String,
  params: MetricsOptions
): Promise<Response<Metrics>> => {
  return newRequest('get', `/api/namespaces/${namespace}/services/${service}/metrics`, params, {}, auth);
};

export const getApps = (auth: string, namespace: String): Promise<Response<AppList>> => {
  return newRequest('get', `/api/namespaces/${namespace}/apps`, {}, {}, auth);
};

export const getAppMetrics = (
  auth: string,
  namespace: String,
  app: String,
  params: MetricsOptions
): Promise<Response<Metrics>> => {
  return newRequest('get', `/api/namespaces/${namespace}/apps/${app}/metrics`, params, {}, auth);
};

export const getWorkloadMetrics = (
  auth: string,
  namespace: String,
  workload: String,
  params: MetricsOptions
): Promise<Response<Metrics>> => {
  return newRequest('get', `/api/namespaces/${namespace}/workloads/${workload}/metrics`, params, {}, auth);
};

export const getServiceHealth = (
  auth: string,
  namespace: String,
  service: String,
  durationSec: number
): Promise<ServiceHealth> => {
  const params = durationSec ? { rateInterval: String(durationSec) + 's' } : {};
  return newRequest('get', `/api/namespaces/${namespace}/services/${service}/health`, params, {}, auth).then(response =>
    ServiceHealth.fromJson(response.data, durationSec)
  );
};

export const getAppHealth = (auth: string, namespace: String, app: String, durationSec: number): Promise<AppHealth> => {
  const params = durationSec ? { rateInterval: String(durationSec) + 's' } : {};
  return newRequest('get', `/api/namespaces/${namespace}/apps/${app}/health`, params, {}, auth).then(response =>
    AppHealth.fromJson(response.data, durationSec)
  );
};

export const getWorkloadHealth = (
  auth: string,
  namespace: String,
  workload: String,
  durationSec: number
): Promise<WorkloadHealth> => {
  const params = durationSec ? { rateInterval: String(durationSec) + 's' } : {};
  return newRequest('get', `/api/namespaces/${namespace}/workloads/${workload}/health`, params, {}, auth).then(
    response => WorkloadHealth.fromJson(response.data, durationSec)
  );
};

export const getNamespaceAppHealth = (
  auth: string,
  namespace: String,
  durationSec: number
): Promise<NamespaceAppHealth> => {
  const params: any = {
    type: 'app'
  };
  if (durationSec) {
    params.rateInterval = String(durationSec) + 's';
  }
  return newRequest('get', `/api/namespaces/${namespace}/health`, params, {}, auth).then(response => {
    const ret: NamespaceAppHealth = {};
    Object.keys(response.data).forEach(k => {
      ret[k] = AppHealth.fromJson(response.data[k], durationSec);
    });
    return ret;
  });
};

export const getNamespaceWorkloadHealth = (
  auth: string,
  namespace: String,
  durationSec: number
): Promise<NamespaceWorkloadHealth> => {
  const params: any = {
    type: 'workload'
  };
  if (durationSec) {
    params.rateInterval = String(durationSec) + 's';
  }
  return newRequest('get', `/api/namespaces/${namespace}/health`, params, {}, auth).then(response => {
    const ret: NamespaceWorkloadHealth = {};
    Object.keys(response.data).forEach(k => {
      ret[k] = WorkloadHealth.fromJson(response.data[k], durationSec);
    });
    return ret;
  });
};

export const getGrafanaInfo = (auth: string): Promise<Response<GrafanaInfo>> => {
  return newRequest('get', `/api/grafana`, {}, {}, auth);
};

export const getJaegerInfo = (auth: string): Promise<Response<JaegerInfo>> => {
  return newRequest('get', `/api/jaeger`, {}, {}, auth);
};

export const getGraphElements = (auth: string, namespace: Namespace, params: any) => {
  return newRequest('get', `/api/namespaces/${namespace.name}/graph`, params, {}, auth);
};

export const getServiceDetail = (auth: string, namespace: String, service: String): Promise<ServiceDetailsInfo> => {
  return newRequest('get', `/api/namespaces/${namespace}/services/${service}`, {}, {}, auth).then(
    (r: Response<ServiceDetailsInfo>) => {
      const info: ServiceDetailsInfo = r.data;
      info.istioSidecar = info.istioSidecar;
      if (info.health) {
        // Default rate interval in backend = 600s
        info.health = ServiceHealth.fromJson(info.health, 600);
      }
      return info;
    }
  );
};

export const getServiceValidations = (
  auth: string,
  namespace: String,
  service: String
): Promise<Response<Validations>> => {
  return newRequest('get', `/api/namespaces/${namespace}/services/${service}/istio_validations`, {}, {}, auth);
};

export const getNamespaceValidations = (auth: string, namespace: String): Promise<Response<NamespaceValidations>> => {
  return newRequest('get', `/api/namespaces/${namespace}/istio_validations`, {}, {}, auth);
};

export const getIstioConfigValidations = (
  auth: string,
  namespace: String,
  objectType: String,
  object: String
): Promise<Response<Validations>> => {
  return newRequest(
    'get',
    `/api/namespaces/${namespace}/istio/${objectType}/${object}/istio_validations`,
    {},
    {},
    auth
  );
};

export const getWorkloads = (auth: string, namespace: String): Promise<Response<WorkloadNamespaceResponse>> => {
  return newRequest('get', `/api/namespaces/${namespace}/workloads`, {}, {}, auth);
};

export const getWorkload = (auth: string, namespace: String, name: String): Promise<Response<Deployment>> => {
  return newRequest('get', `/api/namespaces/${namespace}/workloads/${name}`, {}, {}, auth);
};

export const getWorkloadValidations = (
  auth: string,
  namespace: String,
  workload: String
): Promise<Response<Validations>> => {
  return newRequest('get', `/api/namespaces/${namespace}/workloads/${workload}/istio_validations`, {}, {}, auth);
};

export const getErrorMsg = (msg: string, error: AxiosError) => {
  let errorMessage = msg;
  if (error && error.response && error.response.data && error.response.data['error']) {
    errorMessage = `${msg} Error: [ ${error.response.data['error']} ]`;
  }
  return errorMessage;
};
