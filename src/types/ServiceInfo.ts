import { ServiceHealth } from './Health';
import {
  DestinationRules,
  ObjectCheck,
  ObjectValidation,
  Pod,
  Port,
  Validations,
  VirtualServices
} from './IstioObjects';
import { TLSStatus } from './TLSStatus';
import { icons } from '../config';
import { IconType } from '@patternfly/react-icons/dist/js/createIcon';

export interface Endpoints {
  addresses?: EndpointAddress[];
  ports?: Port[];
}

interface EndpointAddress {
  ip: string;
  kind?: string;
  name?: string;
}

export interface WorkloadOverview {
  name: string;
  type: string;
  istioSidecar: boolean;
  labels?: { [key: string]: string };
  resourceVersion: string;
  createdAt: string;
}

// Istio Sidecar

export const hasIstioSidecar = (pods?: Pod[]) => {
  if (pods) {
    return pods.find(pod => pod.istioContainers != null) !== undefined;
  }
  return false;
};

export interface ApiDocumentation {
  type: string;
  hasSpec: boolean;
}

export interface Service {
  type: string;
  name: string;
  createdAt: string;
  resourceVersion: string;
  ip: string;
  ports?: Port[];
  externalName: string;
  labels?: { [key: string]: string };
  selectors?: { [key: string]: string };
}

export interface ServiceDetailsInfo {
  service: Service;
  endpoints?: Endpoints[];
  istioSidecar: boolean;
  virtualServices: VirtualServices;
  destinationRules: DestinationRules;
  health?: ServiceHealth;
  workloads?: WorkloadOverview[];
  namespaceMTLS?: TLSStatus;
  errorTraces?: number;
  validations: Validations;
  apiDocumentation: ApiDocumentation;
}

const higherThan = [
  'error-warning',
  'error-improvement',
  'error-correct',
  'warning-improvement',
  'warning-correct',
  'improvement-correct'
];


export const severityToIconName = (severity: string): IconType => {
  let iconName = icons.health.severity[severity].icon;
  if (!iconName) {
    iconName = icons.health.severity.correct.icon;
  }
  return iconName;
};

export const severityToColor = (severity: string): string => {
  let color = icons.health.severity[severity].color;
  if (!color) {
    color = 'black';
  }
  return color;
};

export const higherSeverity = (a: string, b: string): boolean => {
  return higherThan.includes(a + '-' + b);
};

export const highestSeverity = (checks: ObjectCheck[]): string => {
  let severity = 'correct';

  checks.forEach(check => {
    if (higherSeverity(check.severity, severity)) {
      severity = check.severity;
    }
  });

  return severity;
};

const numberOfChecks = (type: string, object: ObjectValidation) =>
  (object && object.checks ? object.checks : []).filter(i => i.severity === type).length;

export const validationToSeverity = (object: ObjectValidation): string => {
  const warnChecks = numberOfChecks('warning', object);
  const errChecks = numberOfChecks('error', object);

  return object && object.valid
    ? 'correct'
    : object && !object.valid && errChecks > 0
    ? 'error'
    : object && !object.valid && warnChecks > 0
    ? 'warning'
    : 'correct';
};

export const checkForPath = (object: ObjectValidation | undefined, path: string): ObjectCheck[] => {
  if (!object || !object.checks) {
    return [];
  }

  const check = object.checks.filter(item => {
    return item.path === path;
  });

  return check;
};

export const globalChecks = (object: ObjectValidation): ObjectCheck[] => {
  return checkForPath(object, '');
};
