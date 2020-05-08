import { TextInputTypes } from '@patternfly/react-core';
import { LabelFilters } from '../components/Filters/LabelFilter';

// FilterValue maps a Patternfly property. Modify with care.
export interface FilterValue {
  id: string;
  title: string;
}

enum NonInputTypes {
  typeAhead = 'typeahead',
  select = 'select',
  label = 'label',
  nsLabel = 'nsLabel',
  opLabel = 'oplabel'
}

export const FilterTypes = {
  ...TextInputTypes,
  ...NonInputTypes
};

type FilterTypes = NonInputTypes | TextInputTypes;

// FilterType maps a Patternfly property. Modify with care.
export interface FilterType {
  id: string;
  title: string;
  placeholder: string;
  filterType: FilterTypes;
  customComponent?: any;
  action: string;
  filterValues: FilterValue[];
  loader?: () => Promise<FilterValue[]>;
}

export interface FilterTypeWithFilter<T> extends FilterType {
  filter: (items: T[], filters: ActiveFilter[]) => T[];
}

export const FILTER_ACTION_APPEND = 'append';
export const FILTER_ACTION_UPDATE = 'update';

export interface ActiveFilter {
  category: string;
  value: string;
}

// labelFilter common to lists

export const LabelFilter: FilterType = {
  id: 'label',
  title: 'Label',
  placeholder: 'Filter by Label',
  filterType: FilterTypes.label,
  customComponent: LabelFilters,
  action: FILTER_ACTION_APPEND,
  filterValues: []
};

export const OpLabelFilter: FilterType = {
  id: 'opLabel',
  title: 'Operation Label',
  placeholder: 'Sort op',
  filterType: FilterTypes.opLabel,
  customComponent: undefined,
  action: FILTER_ACTION_UPDATE,
  filterValues: [{ id: 'or', title: 'or' }, { id: 'and', title: 'and' }]
};
