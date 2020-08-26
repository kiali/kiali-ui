import * as E from '../ErrorRate';
import { serverConfig, setServerConfig } from '../../config/ServerConfig';
import { serverRateConfig } from '../__testData__/ErrorRateConfig';
import * as H from '../../types/Health';

describe('getConfig', () => {
  beforeAll(() => {
    setServerConfig(serverRateConfig);
  });
  describe('getConfig', () => {
    it('should return rate object or undefined', () => {
      expect(E.getConfigTEST('bookinfo', 'reviews', 'app')).toBeDefined();
      expect(typeof E.getConfigTEST('bookinfo', 'reviews', 'app')).toBe('object');
      expect(E.getConfigTEST('bookinfo', 'reviews', 'app')).toBe(serverConfig.healthConfig!.rate[0]);

      expect(E.getConfigTEST('bookinfo', 'error-rev-iews', 'app')).toBe(serverConfig.healthConfig!.rate[1]);
      expect(E.getConfigTEST('bookinfo', 'reviews', 'workloadss')).toBe(serverConfig.healthConfig!.rate[1]);
      expect(E.getConfigTEST('istio-system', 'reviews', 'workload')).toBe(serverConfig.healthConfig!.rate[1]);
    });
  });
  describe('sumRequests', () => {
    it('should aggregate the requests', () => {
      const inBound = {
        http: {
          '200': 2,
          '401': 1,
          '500': 0.5
        }
      };

      const outBound = {
        http: {
          '200': 5,
          '401': 3,
          '500': 0.6
        },
        grpc: {
          '1': 3,
          '2': 2,
          '3': 0.667
        }
      };

      const result = E.sumRequestsTEST(inBound, outBound);

      expect(result['http']['200']).toBe(7);
      expect(result['grpc']['2']).toBe(2);
      expect(result['grpc']['3']).toBe(0.667);
      expect(result['http']['500']).toBe(1.1);
    });
  });
  describe('calculateStatus', () => {
    it('Should return Failure', () => {
      const requests = {
        requests: {
          http: {
            requestRate: 2,
            errorRate: 1,
            errorRatio: 0.5
          },
          grpc: {
            requestRate: 3,
            errorRate: 2,
            errorRatio: 0.667
          }
        },
        tolerance: {
          code: new RegExp('4dd'),
          degraded: 20,
          failure: 30,
          protocol: new RegExp('http'),
          direction: new RegExp('inbound')
        }
      };
      const tolerance = {
        code: new RegExp('4dd'),
        degraded: 20,
        failure: 30,
        protocol: new RegExp('http'),
        direction: new RegExp('inbound')
      };
      requests.tolerance = tolerance;

      expect(E.calculateStatusTEST([requests])).toStrictEqual({
        protocol: 'http',
        status: {
          value: 50,
          status: H.FAILURE,
          violation: '50.00%>=30%'
        },
        toleranceConfig: tolerance
      });

      // With healthConfigs check priority
      const requestsPriority1 = {
        requests: {
          http: {
            requestRate: 2,
            errorRate: 1,
            errorRatio: 0.5
          }
        },
        tolerance: {
          code: new RegExp('4dd'),
          degraded: 40,
          failure: 100,
          protocol: new RegExp('http'),
          direction: new RegExp('inbound')
        }
      };
      const requestsPriority0 = {
        requests: {
          grpc: {
            requestRate: 3,
            errorRate: 2,
            errorRatio: 0.667
          }
        },
        tolerance: {
          code: new RegExp('3'),
          degraded: 1,
          failure: 3,
          protocol: new RegExp('grpc'),
          direction: new RegExp('inbound')
        }
      };
      expect(E.calculateStatusTEST([requestsPriority1, requestsPriority0])).toStrictEqual({
        protocol: 'grpc',
        status: {
          value: 66.7,
          status: H.FAILURE,
          violation: '66.70%>=3%'
        },
        toleranceConfig: requestsPriority0.tolerance
      });
    });
  });
  describe('aggregate', () => {
    it('should aggregate the requests', () => {
      const requests = {
        http: {
          '501': 3,
          '404': 2,
          '200': 4,
          '100': 1
        },
        grpc: {
          '1': 3,
          '16': 2
        }
      };

      let result = E.aggregateTEST(requests, serverRateConfig.healthConfig.rate[1].tolerance);
      let requestsResult = result[0].requests;
      expect(requestsResult['http'].requestRate).toBe(10);
      expect(requestsResult['http'].errorRate).toBe(3);
      requestsResult = result[1].requests;
      expect(requestsResult['grpc'].requestRate).toBe(5);
      expect(requestsResult['grpc'].errorRate).toBe(5);

      result = E.aggregateTEST(requests, [
        {
          code: new RegExp('200'),
          protocol: new RegExp('http'),
          direction: new RegExp('inbound'),
          failure: 2,
          degraded: 1
        },
        {
          code: new RegExp('16'),
          protocol: new RegExp('grpc'),
          direction: new RegExp('inbound'),
          failure: 2,
          degraded: 1
        }
      ]);

      const requestsTolerance1 = result[0].requests;

      expect(requestsTolerance1['http'].requestRate).toBe(10);
      expect(requestsTolerance1['http'].errorRate).toBe(4);

      expect(requestsTolerance1['grpc']).toBeUndefined();

      const requestsTolerance2 = result[1].requests;

      expect(requestsTolerance2['http']).toBeUndefined();

      expect(requestsTolerance2['grpc'].requestRate).toBe(5);
      expect(requestsTolerance2['grpc'].errorRate).toBe(2);
    });
  });
});
