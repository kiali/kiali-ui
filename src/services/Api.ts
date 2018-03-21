import axios from 'axios';
import { config } from '../config';
import moment from 'moment';
import queryString from 'query-string';

const auth = (user: string, pass: string) => {
  return {
    username: user,
    password: pass
  };
};

let newRequest = (method: string, url: string, queryParams: any, data: any) => {
  return new Promise((resolve, reject) => {
    console.log(url);
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

export const GetStatus = () => {
  return newRequest('get', '/api/status', {}, {});
};

export const GetNamespaces = () => {
  return newRequest('get', `/api/namespaces`, {}, {});
};

export const GetServices = (namespace: String) => {
  return newRequest('get', `/api/namespaces/${namespace}/services`, {}, {});
};

export const getServiceMetrics = (namespace: String, service: String, params: any) => {
  return newRequest('get', `/api/namespaces/${namespace}/services/${service}/metrics`, params, {});
};

export const getGrafanaInfo = () => {
  return newRequest('get', `/api/grafana`, {}, {});
};

export const GetGraphElements = (namespace: String, params: any) => {
  return newRequest('get', `/api/namespaces/${namespace}/graph`, params, {});
};

export const GetServiceDetail = (namespace: String, service: String) => {
  return newRequest('get', `/api/namespaces/${namespace}/services/${service}`, {}, {});
};

const DEFAULT_JAEGER_API_ROOT = '/jaeger/';
const DEFAULT_DEPENDENCY_LOOKBACK = moment.duration(1, 'weeks').asMilliseconds();

export const JAEGER_API = {
  apiRoot: DEFAULT_JAEGER_API_ROOT,
  fetchTrace(id: string) {
    return newRequest('get', `${this.apiRoot}traces/${id}`, null, null);
  },
  searchTraces(query: any) {
    return newRequest('get', `${this.apiRoot}traces?${queryString.stringify(query)}`, null, null);
  },
  fetchServices() {
    return newRequest('get', `${this.apiRoot}services`, null, null);
  },
  fetchServiceOperations(serviceName: string) {
    return newRequest('get', `${this.apiRoot}services/${encodeURIComponent(serviceName)}/operations`, null, null);
  },
  fetchDependencies(endTs: number = new Date().getTime(), lookback: number = DEFAULT_DEPENDENCY_LOOKBACK) {
    return newRequest('get', `${this.apiRoot}dependencies`, { endTs, lookback }, null);
  }
};
