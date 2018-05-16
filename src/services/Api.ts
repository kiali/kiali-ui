import axios, { AxiosError } from 'axios';
import { config } from '../config';
import Namespace from '../types/Namespace';
import MetricsOptions from '../types/MetricsOptions';
import ServiceListOptions from '../types/ServiceListOptions';

const auth = (user: string, pass: string) => {
  return {
    username: user,
    password: pass
  };
};

let newRequest = (method: string, url: string, queryParams: any, data: any) => {
  return new Promise((resolve, reject) => {
    axios({
      method: method,
      url: url,
      data: data,
      headers: {},
      params: queryParams,
      auth: auth(config().backend.user, config().backend.password)
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

export const getNamespaces = () => {
  return newRequest('get', `/api/namespaces`, {}, {});
};

export const getNamespaceMetrics = (namespace: String, params: any) => {
  return newRequest('get', `/api/namespaces/${namespace}/metrics`, params, {});
};

export const getIstioRules = (namespace: String) => {
  return newRequest('get', `/api/namespaces/${namespace}/rules`, {}, {});
};

export const getServices = (namespace: String, params?: ServiceListOptions) => {
  return newRequest('get', `/api/namespaces/${namespace}/services`, params, {});
};

export const getServiceMetrics = (namespace: String, service: String, params: MetricsOptions) => {
  return newRequest('get', `/api/namespaces/${namespace}/services/${service}/metrics`, params, {});
};

export const getServiceHealth = (namespace: String, service: String) => {
  return newRequest('get', `/api/namespaces/${namespace}/services/${service}/health`, {}, {});
};

export const getGrafanaInfo = () => {
  return newRequest('get', `/api/grafana`, {}, {});
};

export const getJaegerInfo = () => {
  return newRequest('get', `/api/jaeger`, {}, {});
};

export const getGraphElements = (namespace: Namespace, params: any) => {
  return newRequest('get', `/api/namespaces/${namespace.name}/graph`, params, {});
};

export const getServiceDetail = (namespace: String, service: String) => {
  return newRequest('get', `/api/namespaces/${namespace}/services/${service}`, {}, {});
};

export const getServiceValidations = (namespace: String, service: String) => {
  return newRequest('get', `/api/namespaces/${namespace}/services/${service}/istio_validations`, {}, {});
};

export const getIstioRuleDetail = (namespace: String, rule: String) => {
  return newRequest('get', `/api/namespaces/${namespace}/rules/${rule}`, {}, {});
};

export const getErrorMsg = (msg: string, error: AxiosError) => {
  let errorMessage = msg;
  if (error && error.response && error.response.data && error.response.data['error']) {
    errorMessage = `${msg} Error: [ ${error.response.data['error']} ]`;
  }
  return errorMessage;
};
