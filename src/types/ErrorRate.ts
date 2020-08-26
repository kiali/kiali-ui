import { NA, RequestHealth } from './Health';
import { RateHealthConfig, RegexConfig, ToleranceConfig } from './ServerConfig';
import { serverConfig } from '../config/ServerConfig';
import { ascendingThresholdCheck, ThresholdStatus, getRequestErrorsStatus, RATIO_NA, RequestType } from './Health';
import {
  DecoratedGraphEdgeData,
  DecoratedGraphNodeData,
  ProtocolWithTraffic,
  ResponseDetail,
  Responses
} from './Graph';
import { TrafficItem } from '../components/Details/DetailedTrafficList';
import { Direction } from '../types/MetricsOptions';

export interface ErrorRatio {
  global: { status: ThresholdStatus; protocol?: string };
  inbound: { status: ThresholdStatus; protocol?: string };
  outbound: { status: ThresholdStatus; protocol?: string };
}

export interface Rate {
  requestRate: number;
  errorRate: number;
  errorRatio: number;
}

const checkExpr = (value: RegexConfig | undefined, testV: string): boolean => {
  let reg = value;
  if (!reg) {
    return true;
  }
  if (typeof value === 'string') {
    reg = new RegExp(value);
  }
  return (reg as RegExp).test(testV);
};

const getConfig = (ns: string, name: string, kind: string): RateHealthConfig | undefined => {
  if (serverConfig.healthConfig && serverConfig.healthConfig.rate) {
    for (let rate of serverConfig.healthConfig.rate) {
      if (checkExpr(rate.namespace, ns) && checkExpr(rate.name, name) && checkExpr(rate.kind, kind)) {
        return rate;
      }
    }
  }
  return undefined;
};

const sumRequests = (inbound: RequestType, outbound: RequestType): RequestType => {
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

interface RequestToleranceGraph {
  tolerance?: ToleranceConfig;
  requests: { [key: string]: number };
}

interface RequestTolerance {
  tolerance?: ToleranceConfig;
  requests: { [key: string]: Rate };
}

export const calculateErrorRate = (
  ns: string,
  name: string,
  kind: string,
  requests: RequestHealth
): { errorRatio: ErrorRatio; config: RateHealthConfig | undefined } => {
  // Get the first configuration that match with the case
  const conf = getConfig(ns, name, kind);
  // Get all tolerances where direction is inbound
  const inboundTolerances = conf?.tolerance.filter(tol => checkExpr(tol.direction, 'inbound'));
  const inbound = aggregate(requests.inbound, inboundTolerances);
  // Get all tolerances where direction is outbound
  const outboundTolerances = conf?.tolerance.filter(tol => checkExpr(tol.direction, 'outbound'));
  const outbound = aggregate(requests.outbound, outboundTolerances);
  // Calculate global
  const global = aggregate(sumRequests(requests.inbound, requests.outbound), conf?.tolerance);

  return {
    errorRatio: {
      global: calculateStatus(global),
      inbound: calculateStatus(inbound),
      outbound: calculateStatus(outbound)
    },
    config: conf
  };
};

const calculateStatus = (requestsTolerances: RequestTolerance[]): { status: ThresholdStatus; protocol: string } => {
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
      const auxStatus = getRequestErrorsStatus(rate.errorRatio, tolerance);
      if (auxStatus.status.priority > result.status.status.priority) {
        result.status = auxStatus;
        result.protocol = protocol;
        result.toleranceConfig = reqTol.tolerance;
      }
    }
  }
  return result;
};

const generateRateForTolerance = (tol: RequestTolerance, requests: { [key: string]: { [key: string]: number } }) => {
  for (let [protocol, req] of Object.entries(requests)) {
    if (tol.tolerance) {
      if (checkExpr(tol!.tolerance!.protocol, protocol)) {
        for (let [code, value] of Object.entries(req)) {
          if (!Object.keys(tol.requests).includes(protocol)) {
            tol.requests[protocol] = emptyRate();
          }
          tol.requests[protocol].requestRate += Number(value);
          if (checkExpr(tol!.tolerance!.code, code)) {
            tol.requests[protocol].errorRate += Number(value);
          }
        }
      }
    }
    if (Object.keys(tol.requests).includes(protocol)) {
      if (tol.requests[protocol].requestRate === 0) {
        tol.requests[protocol].errorRatio = -1;
      } else {
        tol.requests[protocol].errorRatio = tol.requests[protocol].errorRate / tol.requests[protocol].requestRate;
      }
    }
  }
};

const aggregate = (request: RequestType, tolerances?: ToleranceConfig[]): RequestTolerance[] => {
  let result: RequestTolerance[] = [];
  if (request) {
    if (tolerances) {
      for (let tol of Object.values(tolerances)) {
        let newReqTol: RequestTolerance = { tolerance: tol, requests: {} };
        generateRateForTolerance(newReqTol, request);
        result.push(newReqTol);
      }
    } else {
      const emptyRequest: { [key: string]: Rate } = {};
      for (let protocol of Object.keys(request)) {
        emptyRequest[protocol] = emptyRate();
      }
      let newReqTol: RequestTolerance = { tolerance: undefined, requests: emptyRequest };
      generateRateForTolerance(newReqTol, request);
      result.push(newReqTol);
    }
  }
  return result;
};

const emptyRate = (): Rate => {
  return { requestRate: 0, errorRate: 0, errorRatio: 0 };
};

// Graph Edge

export const getEdgeHealth = (
  edge: DecoratedGraphEdgeData,
  source: DecoratedGraphNodeData,
  target: DecoratedGraphNodeData
): ThresholdStatus => {
  // We need to check the configuration for item A outbound requests and configuration of B for inbound requests
  const configSource = getConfig(source.namespace, source[source.nodeType], source.nodeType);
  const configTarget = getConfig(target.namespace, target[target.nodeType], target.nodeType);

  // If there is not tolerances with this configuration we'll use defaults
  const tolerancesSource = configSource?.tolerance.filter(tol => checkExpr(tol.direction, 'outbound'));
  const tolerancesTarget = configTarget?.tolerance.filter(tol => checkExpr(tol.direction, 'inbound'));

  // Calculate aggregate
  const outboundEdge = aggregateGraph(transformEdgeResponses(edge.responses, edge.protocol), tolerancesSource);
  const inboundEdge = aggregateGraph(transformEdgeResponses(edge.responses, edge.protocol), tolerancesTarget);

  // Calculate status
  const outboundEdgeStatus = calculateStatusGraph(outboundEdge);
  const inboundEdgeStatus = calculateStatusGraph(inboundEdge);

  // Keep status with more priority
  return outboundEdgeStatus.status.status.priority > inboundEdgeStatus.status.status.priority
    ? outboundEdgeStatus.status
    : inboundEdgeStatus.status;
};

const transformEdgeResponses = (requests: Responses, protocol: string): RequestType => {
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

const aggregateGraph = (request: RequestType, tolerances?: ToleranceConfig[]): RequestToleranceGraph[] => {
  let result: RequestToleranceGraph[] = [];
  if (request) {
    if (tolerances) {
      for (let tol of Object.values(tolerances)) {
        let newReqTol: RequestToleranceGraph = { tolerance: tol, requests: {} };
        generateRateForGraphTolerance(newReqTol, request);
        result.push(newReqTol);
      }
    } else {
      const emptyRequest: { [key: string]: number } = {};
      for (let protocol of Object.keys(request)) {
        emptyRequest[protocol] = 0;
      }
      let newReqTol: RequestToleranceGraph = { tolerance: undefined, requests: emptyRequest };
      generateRateForGraphTolerance(newReqTol, request);
      result.push(newReqTol);
    }
  }
  return result;
};

const generateRateForGraphTolerance = (tol: RequestToleranceGraph, requests: RequestType) => {
  for (let [protocol, req] of Object.entries(requests)) {
    if (tol.tolerance) {
      if (checkExpr(tol!.tolerance!.protocol, protocol)) {
        for (let [code, value] of Object.entries(req)) {
          if (!Object.keys(tol.requests).includes(protocol)) {
            tol.requests[protocol] = 0;
          }
          if (checkExpr(tol!.tolerance!.code, code)) {
            tol.requests[protocol] += value;
          }
        }
      }
    }
  }
};

const calculateStatusGraph = (
  requestsTolerances: RequestToleranceGraph[]
): { status: ThresholdStatus; protocol: string } => {
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
      if (tolerance) {
        let thresholds = {
          degraded: tolerance.degraded,
          failure: tolerance.failure,
          unit: '%'
        };
        const auxStatus = ascendingThresholdCheck(rate, thresholds);
        if (auxStatus.status.priority > result.status.status.priority) {
          result.status = auxStatus;
          result.protocol = protocol;
          result.toleranceConfig = reqTol.tolerance;
        }
      }
    }
  }
  return result;
};

/*
Get Status for Detailed Traffic
 */

export const getTrafficHealth = (item: TrafficItem, direction: Direction): ThresholdStatus => {
  const config = getConfig(item.node.namespace, item.node.name, item.node.type);
  const tolerances = config?.tolerance.filter(tol => checkExpr(tol.direction, direction));
  const traffic = item.traffic as ProtocolWithTraffic;
  const aggregate = aggregateGraph(transformEdgeResponses(traffic.responses, traffic.protocol), tolerances);
  return calculateStatusGraph(aggregate).status;
};

/*
 Export for tests
*/
export const getConfigTEST = getConfig;
export const calculateStatusTEST = calculateStatus;
export const aggregateTEST = aggregate;
export const sumRequestsTEST = sumRequests;
