import { TextInputTypes } from '@patternfly/react-core';
import { FILTER_ACTION_APPEND, FilterTypes, Filter } from 'types/Filters';
import { SortField } from 'types/SortFilters';
import { Iter8Experiment } from 'types/Iter8';

export const sortFields: SortField<Iter8Experiment>[] = [
  {
    id: 'namespace',
    title: 'Namespace',
    isNumeric: false,
    param: 'ns',
    compare: (a, b) => a.namespace.localeCompare(b.namespace) || a.name.localeCompare(b.name)
  },
  {
    id: 'name',
    title: 'Name',
    isNumeric: false,
    param: 'wn',
    compare: (a, b) => a.name.localeCompare(b.name)
  },
  {
    id: 'phase',
    title: 'Phase',
    isNumeric: false,
    param: 'is',
    compare: (a, b) => a.name.localeCompare(b.name)
  },
  {
    id: 'baseline',
    title: 'Baseline',
    isNumeric: false,
    param: 'is', // !! same as phase?
    compare: (a, b) => a.name.localeCompare(b.name)
  },
  {
    id: 'candidate',
    title: 'Candidate',
    isNumeric: false,
    param: 'is', // !! same as phase?
    compare: (a, b) => a.name.localeCompare(b.name)
  }
];

// !! candidateFilter has no effect?

const targetServiceFilter: Filter<Iter8Experiment> = {
  id: 'targetService',
  title: 'Service',
  placeholder: 'Filter by Service Name',
  filterType: TextInputTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: [],
  check: (item, active) => active.filters.some(f => item.targetService.includes(f.value))
};

const baselineFilter: Filter<Iter8Experiment> = {
  id: 'baselin',
  title: 'Baseline',
  placeholder: 'Filter by Baseline Name',
  filterType: TextInputTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: [],
  check: (item, active) => active.filters.some(f => item.baseline.name.includes(f.value))
};
const candidateFilter: Filter<Iter8Experiment> = {
  id: 'candidate',
  title: 'Candidate',
  placeholder: 'Filter by Candidate Name',
  filterType: TextInputTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: [],
  // NOT SURE OF THAT ONE
  check: (item, active) => active.filters.some(f => item.candidates.some(c => c.name.includes(f.value)))
};

export const phaseFilter: Filter<Iter8Experiment> = {
  id: 'phase',
  title: 'Phase',
  placeholder: 'Filter by Phase',
  filterType: FilterTypes.select,
  action: FILTER_ACTION_APPEND,
  filterValues: [
    {
      id: 'Initializing',
      title: 'Initializing'
    },
    {
      id: 'Progressing',
      title: 'Progressing'
    },
    {
      id: 'Pause',
      title: 'Pause'
    },
    {
      id: 'Completed',
      title: 'Completed'
    }
  ],
  check: (item, active) => active.filters.some(f => item.phase.includes(f.value))
};
export const availableFilters: Filter<Iter8Experiment>[] = [
  targetServiceFilter,
  baselineFilter,
  candidateFilter,
  phaseFilter
];

/** Sort Method */

export const sortAppsItems = (
  unsorted: Iter8Experiment[],
  sortField: SortField<Iter8Experiment>,
  isAscending: boolean
): Promise<Iter8Experiment[]> => {
  const sorted = unsorted.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
  return Promise.resolve(sorted);
};
