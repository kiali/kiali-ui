import { TextInputTypes } from '@patternfly/react-core';
import { HEALTHY, DEGRADED, FAILURE, NA, Health } from 'types/Health';

// FilterValue maps a Patternfly property. Modify with care.
export interface FilterValue {
  id: string;
  title: string;
}

enum NonInputTypes {
  typeAhead = 'typeahead',
  select = 'select',
  label = 'label',
  nsLabel = 'nsLabel'
}

export const FilterTypes = {
  ...TextInputTypes,
  ...NonInputTypes
};

type FilterTypes = NonInputTypes | TextInputTypes;

// FilterDefinition maps a Patternfly property. Modify with care.
export interface FilterDefinition {
  id: string;
  title: string;
  placeholder: string;
  filterType: FilterTypes;
  action: string;
  filterValues: FilterValue[];
  loader?: () => Promise<FilterValue[]>;
}

export type Filter<T> = FilterDefinition & {
  check: (item: T, active: ActiveFiltersInfo) => boolean;
};

export type PromiseFilter<T> = FilterDefinition & {
  checkAsync: (item: T, active: ActiveFiltersInfo) => Promise<boolean>;
};

export const promiseFilter = <T>(filter: Filter<T> | PromiseFilter<T>): PromiseFilter<T> => {
  return (filter as PromiseFilter<T>).checkAsync !== undefined
    ? (filter as PromiseFilter<T>)
    : { ...filter, checkAsync: (items, active) => Promise.resolve((filter as Filter<T>).check(items, active)) };
};

export const FILTER_ACTION_APPEND = 'append';
export const FILTER_ACTION_UPDATE = 'update';

export interface ActiveFilter {
  id: string;
  title: string;
  value: string;
}

export type LabelOperation = 'and' | 'or';
export const ID_LABEL_OPERATION = 'opLabel';
export const DEFAULT_LABEL_OPERATION: LabelOperation = 'or';

export interface ActiveFiltersInfo {
  filters: ActiveFilter[];
  op: LabelOperation;
}

///////////////////
// Some constants

export const presenceValues: FilterValue[] = [
  {
    id: 'present',
    title: 'Present'
  },
  {
    id: 'notpresent',
    title: 'Not Present'
  }
];

export const presenceCheck = (filter: ActiveFilter, value: boolean) => {
  return filter.value === (value ? 'Present' : 'Not Present');
};

export const istioSidecarFilter: Filter<{ istioSidecar: boolean }> = {
  id: 'istiosidecar',
  title: 'Istio Sidecar',
  placeholder: 'Filter by IstioSidecar Validation',
  filterType: FilterTypes.select,
  action: FILTER_ACTION_UPDATE,
  filterValues: presenceValues,
  check: (item, active) => active.filters.some(f => presenceCheck(f, item.istioSidecar))
};

export const healthFilter: PromiseFilter<{ healthPromise: Promise<Health> }> = {
  id: 'health',
  title: 'Health',
  placeholder: 'Filter by Health',
  filterType: FilterTypes.select,
  action: FILTER_ACTION_APPEND,
  filterValues: [
    {
      id: HEALTHY.name,
      title: HEALTHY.name
    },
    {
      id: DEGRADED.name,
      title: DEGRADED.name
    },
    {
      id: FAILURE.name,
      title: FAILURE.name
    },
    {
      id: 'na',
      title: NA.name
    }
  ],
  checkAsync: (item, active) =>
    item.healthPromise.then(h => active.filters.some(f => f.value === h.getGlobalStatus().name))
};
