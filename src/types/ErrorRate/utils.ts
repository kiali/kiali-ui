import { RateHealthConfig, RegexConfig, ToleranceConfig } from '../ServerConfig';
import { serverConfig } from '../../config';
import { ResponseDetail, Responses } from '../Graph';
import { RequestType } from '../Health';
import { Rate, RequestTolerance } from './types';
import { generateRateForTolerance } from './ErrorRate';
import { generateRateForGraphTolerance } from './GraphEdgeStatus';

export const emptyRate = (): Rate => {
  return { requestRate: 0, errorRate: 0, errorRatio: 0 };
};

export const checkExpr = (value: RegexConfig | undefined, testV: string): boolean => {
  let reg = value;
  if (!reg) {
    return true;
  }
  if (typeof value === 'string') {
    reg = new RegExp(value);
  }
  return (reg as RegExp).test(testV);
};

export const getConfig = (ns: string, name: string, kind: string): RateHealthConfig | undefined => {
  if (serverConfig.healthConfig && serverConfig.healthConfig.rate) {
    for (let rate of serverConfig.healthConfig.rate) {
      if (checkExpr(rate.namespace, ns) && checkExpr(rate.name, name) && checkExpr(rate.kind, kind)) {
        return rate;
      }
    }
  }
  return undefined;
};

export const getDefaultConfig = (): RateHealthConfig | undefined => {
  return serverConfig.healthConfig && serverConfig.healthConfig.rate
    ? serverConfig.healthConfig.rate[serverConfig.healthConfig.rate.length - 1]
    : undefined;
};

/*
For Responses object like { "200": { flags: { "-": 1.2, "XXX": 3.1}, hosts: ...} } Transform to RequestType

Return object like:  {"http": { "200": 4.3}}
*/
export const transformEdgeResponses = (requests: Responses, protocol: string): RequestType => {
  const prot: { [key: string]: number } = {};
  const result: RequestType = {};
  result[protocol] = prot;

  for (let [code, responseDetail] of Object.entries(requests)) {
    const percentRate = Object.values((responseDetail as ResponseDetail).flags).reduce(
      (acc, value) => acc + Number(value)
    );
    result[protocol][code] = Number(percentRate);
  }

  return result;
};

/*
 For requests type like { "http": { "200": 3.2, "501": 2.3 } ...} and a Tolerance Configuration to apply calculate the RequestToleranceGraph[]

 Return an array object where each item is a type RequestToleranceGraph by tolerance configuration passed by parameter

 Sample:

 [{
  tolerance: TOLERANCE CONFIGURATION,
  requests: {"http": 4.3}
 }]
 where this requests are the sum of rates where match the tolerance configuration.

*/
export const aggregate = (
  request: RequestType,
  tolerances?: ToleranceConfig[],
  graph: boolean = false
): RequestTolerance[] => {
  let result: RequestTolerance[] = [];
  if (request && tolerances) {
    for (let tol of Object.values(tolerances)) {
      let newReqTol: RequestTolerance = { tolerance: tol, requests: {} };
      graph ? generateRateForGraphTolerance(newReqTol, request) : generateRateForTolerance(newReqTol, request);
      result.push(newReqTol);
    }
  }
  return result;
};