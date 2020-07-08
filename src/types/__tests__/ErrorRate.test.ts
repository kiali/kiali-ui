import * as E from '../ErrorRate';
import { serverConfig, setServerConfig } from '../../config/ServerConfig';
import { serverRateConfig, tolerancesDefault } from '../__testData__/ErrorRateConfig';
import * as H from '../../types/Health';

describe('check regexProtocol', () => {
  it('should work for GRPC', () => {
    const protocol = 'grpc';
    expect(Object.keys(E.regexProtocol).includes(protocol)).toEqual(true);

    expect(E.regexProtocol[protocol].test('1')).toEqual(true);
    expect(E.regexProtocol[protocol].test('16')).toEqual(true);
    expect(E.regexProtocol[protocol].test('10')).toEqual(true);
    expect(E.regexProtocol[protocol].test('6')).toEqual(true);

    expect(E.regexProtocol[protocol].test('400')).toEqual(false);
    expect(E.regexProtocol[protocol].test('200')).toEqual(false);
  });

  it('should work for http', () => {
    const protocol = 'http';
    expect(Object.keys(E.regexProtocol).includes(protocol)).toEqual(true);

    expect(E.regexProtocol[protocol].test('400')).toEqual(true);
    expect(E.regexProtocol[protocol].test('500')).toEqual(true);
    expect(E.regexProtocol[protocol].test('404')).toEqual(true);

    expect(E.regexProtocol[protocol].test('16')).toEqual(false);
    expect(E.regexProtocol[protocol].test('6')).toEqual(false);
    expect(E.regexProtocol[protocol].test('200')).toEqual(false);
  });
});

describe('ensure there is a default configuration', () => {
  it('should exist a configuration', () => {
    const rate = serverConfig.healthConfig!.rate;
    expect(rate).toBeDefined();
    const allMatch = new RegExp('.*');
    expect(rate.length).toBe(1);
    expect(rate[0].tolerance.length).toBe(2);
    expect(rate[0].tolerance).toStrictEqual(tolerancesDefault);
    expect(rate[0].namespace).toStrictEqual(allMatch);
    expect(rate[0].kind).toStrictEqual(allMatch);
    expect(rate[0].name).toStrictEqual(allMatch);
  });
});

describe('getConfig', () => {
  beforeAll(() => {
    setServerConfig(serverRateConfig);
  });
  describe('getConfig', () => {
    it('should return rate object or undefined', () => {
      expect(E.getConfigTEST('bookinfo', 'reviews', 'app')).toBeDefined();
      expect(typeof E.getConfigTEST('bookinfo', 'reviews', 'app')).toBe('object');
      expect(E.getConfigTEST('bookinfo', 'reviews', 'app')).toBe(serverConfig.healthConfig!.rate[0]);

      expect(E.getConfigTEST('bookinfo', 'error-rev-iews', 'app')).toBeUndefined();
      expect(E.getConfigTEST('bookinfo', 'reviews', 'workloadss')).toBeUndefined();
      expect(E.getConfigTEST('istio-system', 'reviews', 'workload')).toBeUndefined();
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
      requests.tolerance = {
        code: new RegExp('4dd'),
        degraded: 80,
        failure: 70,
        protocol: new RegExp('http'),
        direction: new RegExp('inbound')
      };
      const requests2 = requests;
      const toleranceGRPC = {
        code: new RegExp('4dd'),
        degraded: 1,
        failure: 3,
        protocol: new RegExp('grpc'),
        direction: new RegExp('inbound')
      };
      requests2.tolerance = toleranceGRPC;
      expect(E.calculateStatusTEST([requests, requests2])).toStrictEqual({
        protocol: 'grpc',
        status: {
          value: 66.7,
          status: H.FAILURE,
          violation: '66.70%>=3%'
        },
        toleranceConfig: toleranceGRPC
      });
    });
  });
  describe('aggregate', () => {
    it('should aggregate the requests', () => {
      const requests = {
        http: {
          '404': 2,
          '200': 3,
          '100': 1
        },
        grpc: {
          '1': 3,
          '16': 2
        }
      };

      let result = E.aggregateTEST(requests);
      const requestsResult = result[0].requests;
      expect(requestsResult['http'].requestRate).toBe(6);
      expect(requestsResult['http'].errorRate).toBe(2);

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

      expect(requestsTolerance1['http'].requestRate).toBe(6);
      expect(requestsTolerance1['http'].errorRate).toBe(3);

      expect(requestsTolerance1['grpc']).toBeUndefined();

      const requestsTolerance2 = result[1].requests;

      expect(requestsTolerance2['http']).toBeUndefined();

      expect(requestsTolerance2['grpc'].requestRate).toBe(5);
      expect(requestsTolerance2['grpc'].errorRate).toBe(2);
    });
  });
});
