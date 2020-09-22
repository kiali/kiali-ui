import Namespace from './Namespace';
import { ServiceHealth } from './Health';
import { Validations, ObjectValidation } from './IstioObjects';
import { AdditionalItem } from './Workload';
import { BaseItem } from 'components/VirtualList/Config';

export interface ServiceList {
  namespace: Namespace;
  services: ServiceOverview[];
  validations: Validations;
}

export interface ServiceOverview extends BaseItem {
  istioSidecar: boolean;
  additionalDetailSample?: AdditionalItem;
  labels: { [key: string]: string };
}

export interface ServiceListItem extends ServiceOverview {
  healthPromise: Promise<ServiceHealth>;
  validation: ObjectValidation;
}
