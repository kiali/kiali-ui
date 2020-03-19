import Namespace from './Namespace';
import { ServiceHealth } from './Health';
import { Validations, ObjectValidation } from './IstioObjects';
import { AdditionalItem } from './Workload';

export interface ServiceList {
  namespace: Namespace;
  services: ServiceOverview[];
  validations: Validations;
}

export interface ServiceOverview {
  name: string;
  istioSidecar: boolean;
  additionalDetailSample?: AdditionalItem;
  labels: { [key: string]: string };
}

export interface ServiceListItem extends ServiceOverview {
  namespace: string;
  healthPromise: Promise<ServiceHealth>;
  validation: ObjectValidation;
}
