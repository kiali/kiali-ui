'use strict';

const api: any = jest.genMockFromModule('../Api');

let mockServiceMetricsData: any = Object.create({});

const setMockMetricsData = (data: any) => {
  mockServiceMetricsData = data;
};

const getServiceMetrics = (namespace: String, service: String, params: any) => {
  return Promise.resolve({ data: mockServiceMetricsData });
};

// TODO create a setter to define returned data
const getGrafanaInfo = () => {
  return Promise.resolve({});
};

api.__setMockMetricsData = setMockMetricsData;
api.getServiceMetrics = getServiceMetrics;
api.getGrafanaInfo = getGrafanaInfo;

module.exports = api;
