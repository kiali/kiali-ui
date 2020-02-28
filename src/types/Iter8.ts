import { ResourcePermissions } from './Permissions';

export interface Iter8Info {
  enabled: boolean;
  permissions: ResourcePermissions;
}

export interface Iter8Experiment {
  name: string;
  phase: string;
  status: string;
  baseline: string;
  baselinePercentage: number;
  candidate: string;
  candidatePercentage: number;
  namespace: string;
}

export interface ExpId {
  namespace: string;
  name: string;
}

export interface Iter8ExpDetailsInfo {
  experimentItem: ExperimentItem;
  criterias: SuccessCriteria[];
}

export interface ExperimentItem {
  name: string;
  phase: string;
  status: string;
  labels?: { [key: string]: string };
  createdAt: string;
  resourceVersion: string;
  baseline: string;
  baselinePercentage: number;
  candidate: string;
  candidatePercentage: number;
  namespace: string;
}
export interface SuccessCriteria {
  name: string;
  criteria: Criteria;
  metric: Metric;
}
export interface Metric {
  absent_value: string;
  is_count: boolean;
  query_template: string;
  sample_size_template: string;
}
export interface Criteria {
  metric: string;
  tolerance: number;
  toleranceType: string;
  sampleSize: number;
  stopOnFailure: boolean;
}
