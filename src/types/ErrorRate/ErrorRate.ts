import { getRequestErrorsStatus, HEALTHY, NA, RATIO_NA, RequestHealth, RequestType, ThresholdStatus } from '../Health';
import { RateHealthConfig, ToleranceConfig } from '../ServerConfig';
import { checkExpr, emptyRate, getConfig, getDefaultConfig } from './utils';
import { ErrorRatio, Rate, RequestTolerance } from './types';

// Sum the inbound and outbound request for calculate the global status
export const sumRequests = (inbound: RequestType, outbound: RequestType): RequestType => {
  let result: RequestType = inbound;
  for (let [protocol, req] of Object.entries(outbound)) {
    if (!Object.keys(result).includes(protocol)) {
      result[protocol] = {};
    }
    for (let [code, rate] of Object.entries(req)) {
      if (!Object.keys(result[protocol]).includes(code)) {
        result[protocol][code] = 0;
      }
      result[protocol][code] += rate;
    }
  }
  return result;
};

const getAggregate = (
  requests: RequestHealth,
  conf: RateHealthConfig
): { global: RequestTolerance[]; inbound: RequestTolerance[]; outbound: RequestTolerance[] } => {
  // Get all tolerances where direction is inbound
  const inboundTolerances = conf?.tolerance.filter(tol => checkExpr(tol.direction, 'inbound'));
  // Get all tolerances where direction is outbound
  const outboundTolerances = conf?.tolerance.filter(tol => checkExpr(tol.direction, 'outbound'));

  return {
    global: aggregate(sumRequests(requests.inbound, requests.outbound), conf.tolerance),
    inbound: aggregate(requests.inbound, inboundTolerances),
    outbound: aggregate(requests.outbound, outboundTolerances)
  };
};

export const calculateErrorRate = (
  ns: string,
  name: string,
  kind: string,
  requests: RequestHealth
): { errorRatio: ErrorRatio; config: RateHealthConfig | undefined } => {
  // Get the first configuration that match with the case
  const conf = getConfig(ns, name, kind);
  // Get aggregate
  let status = getAggregate(requests, conf);
  const globalStatus = calculateStatus(status.global);
  if (globalStatus.status.status !== HEALTHY) {
    return {
      errorRatio: {
        global: globalStatus,
        inbound: calculateStatus(status.inbound),
        outbound: calculateStatus(status.outbound)
      },
      config: conf
    };
  }
  const result = {
    errorRatio: {
      global: globalStatus,
      inbound: calculateStatus(status.inbound),
      outbound: calculateStatus(status.outbound)
    },
    config: conf
  };
  // The status is healthy go to check the code errors and calculate them
  const confDefault = getDefaultConfig();
  status = getAggregate(requests, confDefault);
  const inboundDefault = calculateStatus(status.inbound);
  const outboundDefault = calculateStatus(status.outbound);
  result.errorRatio.inbound.status.value = inboundDefault.status.value;
  result.errorRatio.outbound.status.value = outboundDefault.status.value;

  // In that case we want to keep values
  return result;
};

export const calculateStatus = (
  requestsTolerances: RequestTolerance[]
): { status: ThresholdStatus; protocol: string; toleranceConfig?: ToleranceConfig } => {
  let result: { status: ThresholdStatus; protocol: string; toleranceConfig?: ToleranceConfig } = {
    status: {
      value: RATIO_NA,
      status: NA
    },
    protocol: '',
    toleranceConfig: undefined
  };

  for (let reqTol of Object.values(requestsTolerances)) {
    for (let [protocol, rate] of Object.entries(reqTol.requests)) {
      const tolerance =
        reqTol.tolerance && checkExpr(reqTol!.tolerance!.protocol, protocol) ? reqTol.tolerance : undefined;
      // Calculate the status for the tolerance provided
      const auxStatus = getRequestErrorsStatus((rate as Rate).errorRatio, tolerance);

      // Check the priority of the status
      if (auxStatus.status.priority > result.status.status.priority) {
        result.status = auxStatus;
        result.protocol = protocol;
        result.toleranceConfig = reqTol.tolerance;
      }
    }
  }
  return result;
};

export const generateRateForTolerance = (
  tol: RequestTolerance,
  requests: { [key: string]: { [key: string]: number } }
) => {
  for (let [protocol, req] of Object.entries(requests)) {
    if (checkExpr(tol!.tolerance!.protocol, protocol)) {
      for (let [code, value] of Object.entries(req)) {
        if (!Object.keys(tol.requests).includes(protocol)) {
          tol.requests[protocol] = emptyRate();
        }
        (tol.requests[protocol] as Rate).requestRate += Number(value);
        if (checkExpr(tol!.tolerance!.code, code)) {
          (tol.requests[protocol] as Rate).errorRate += Number(value);
        }
      }
    }
    if (Object.keys(tol.requests).includes(protocol)) {
      if ((tol.requests[protocol] as Rate).requestRate === 0) {
        (tol.requests[protocol] as Rate).errorRatio = -1;
      } else {
        (tol.requests[protocol] as Rate).errorRatio =
          (tol.requests[protocol] as Rate).errorRate / (tol.requests[protocol] as Rate).requestRate;
      }
    }
  }
};

// Aggregate the results
export const aggregate = (request: RequestType, tolerances?: ToleranceConfig[]): RequestTolerance[] => {
  let result: RequestTolerance[] = [];
  if (request && tolerances) {
    for (let tol of Object.values(tolerances)) {
      let newReqTol: RequestTolerance = { tolerance: tol, requests: {} };
      generateRateForTolerance(newReqTol, request);
      result.push(newReqTol);
    }
  }
  return result;
};
