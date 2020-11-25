import { RateHealthConfig, RegexConfig, ToleranceConfig } from '../ServerConfig';
import { serverConfig } from '../../config';
import { ResponseDetail, Responses } from '../Graph';
import { RequestHealth, RequestType } from '../Health';
import { Rate, RequestTolerance } from './types';
import { generateRateForTolerance } from './ErrorRate';
import { generateRateForGraphTolerance } from './GraphEdgeStatus';

export const emptyRate = (): Rate => {
  return { requestRate: 0, errorRate: 0, errorRatio: 0 };
};

export const DEFAULTCONF = {
  http: new RegExp('^[4|5]\\d\\d$'),
  grpc: new RegExp('^[1-9]$|^1[0-6]$'),
  degraded: 10,
  failure: 20,
  protocol: new RegExp('.*'),
  direction: new RegExp('.*')
};

const requestsErrorRateCode = (requests: RequestType): number => {
  const rate: Rate = emptyRate();
  for (let [protocol, req] of Object.entries(requests)) {
    for (let [code, value] of Object.entries(req)) {
      rate.requestRate += value;
      if (Object.keys(DEFAULTCONF).includes(protocol) && DEFAULTCONF[protocol].test(code)) {
        rate.errorRate += value;
      }
    }
  }
  return rate.requestRate === 0 ? -1 : (rate.errorRate / rate.requestRate) * 100;
};

export const getErrorCodeRate = (requests: RequestHealth): { inbound: number; outbound: number } => {
  return { inbound: requestsErrorRateCode(requests.inbound), outbound: requestsErrorRateCode(requests.outbound) };
};

/*
Cached this method to avoid use regexp in next calculations to improve performance
+ it's cached for config.
-   We can't cached this for annotations because are mutable
 */
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

// Cache the configuration to avoid multiple calls to regExp
export let configCache: { [key: string]: RateHealthConfig } = {};

export const getRateHealthConfigBy = (ns: string, name: string, kind: string): RateHealthConfig => {
  const key = ns + '_' + kind + '_' + name;
  // If we have the configuration cached then return it
  if (configCache[key]) {
    return configCache[key];
  }
  if (serverConfig.healthConfig && serverConfig.healthConfig.rate) {
    for (let rate of serverConfig.healthConfig.rate) {
      if (checkExpr(rate.namespace, ns) && checkExpr(rate.name, name) && checkExpr(rate.kind, kind)) {
        configCache[key] = rate;
        return rate;
      }
    }
  }
  return serverConfig.healthConfig.rate[serverConfig.healthConfig.rate.length - 1];
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

export const getRateHealthConfig = (ns: string, name: string, kind: string, config?: string): ToleranceConfig[] => {
  if (config && config !== '') {
    const tolerances: ToleranceConfig[] = [];
    for (var cad of config.split(';')) {
      tolerances.push(parseAnnotation(cad));
    }

    return tolerances;
  }
  return getRateHealthConfigBy(ns, name, kind).tolerance;
};

const isNumber = (value: string | number): boolean => {
  return value != null && value !== '' && !isNaN(Number(value.toString()));
};

export const parseAnnotation = (tolerance: string): ToleranceConfig => {
  const cads = tolerance.split(',');
  var code = cads[0];
  var degraded = DEFAULTCONF.degraded;
  var failure = DEFAULTCONF.failure;
  var protocol = DEFAULTCONF.protocol;
  var direction = DEFAULTCONF.direction;
  cads.splice(0, 1); // Remove code value

  var len = cads.length;
  // More information ?
  if (len > 0) {
    // Check other parameters
    if (isNumber(cads[0])) {
      // Defined degraded and maybe failure
      degraded = Number(cads[0]);
      if (len > 1 && isNumber(cads[1])) {
        // Defined failure too
        failure = Number(cads[1]);
        cads.splice(0, 2);
      } else {
        cads.splice(0, 1);
      }
      len = cads.length;
    }
    if (len > 0) {
      // Defined Protocol or direction
      if (len > 1) {
        direction = new RegExp(cads[1]);
      }
      protocol = new RegExp(cads[0]);
    }
  }
  const regex = code.toLowerCase().replace('x', '\\d');
  return {
    code: new RegExp(regex),
    degraded: degraded,
    failure: failure,
    protocol: protocol,
    direction: direction
  };
};
