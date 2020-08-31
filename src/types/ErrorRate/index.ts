import { getTrafficHealth } from './TrafficHealth';
import { getEdgeHealth } from './GraphEdgeStatus';
import { aggregate, calculateErrorRate, calculateStatus, sumRequests } from './ErrorRate';
import { DEFAULTCONF, getConfig } from './utils';

export { calculateErrorRate, DEFAULTCONF, getEdgeHealth, getTrafficHealth };

/*

Export for testing

*/
export const getConfigTEST = getConfig;
export const calculateStatusTEST = calculateStatus;
export const aggregateTEST = aggregate;
export const sumRequestsTEST = sumRequests;
