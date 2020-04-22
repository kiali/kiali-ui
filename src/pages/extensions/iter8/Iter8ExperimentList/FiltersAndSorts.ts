import { ActiveFilter, FILTER_ACTION_APPEND, FilterType } from '../../../../types/Filters';
import { SortField } from '../../../../types/SortFilters';
import { Iter8Experiment } from '../../../../types/Iter8';
import { TextInputTypes } from '@patternfly/react-core';
import { getFilterSelectedValues } from '../../../../components/Filters/CommonFilters';

// Place Holder, not quite finished yet. Or if filter is needed, and how to use the common filters?

export const sortFields: SortField<Iter8Experiment>[] = [
  {
    id: 'namespace',
    title: 'Namespace',
    isNumeric: false,
    param: 'ns',
    compare: (a, b) => {
      let sortValue = a.namespace.localeCompare(b.namespace);
      if (sortValue === 0) {
        sortValue = a.name.localeCompare(b.name);
      }
      return sortValue;
    }
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
    param: 'is',
    compare: (a, b) => a.name.localeCompare(b.name)
  },
  {
    id: 'candidate',
    title: 'Candidate',
    isNumeric: false,
    param: 'is',
    compare: (a, b) => a.name.localeCompare(b.name)
  }
];

const filterByTargetService = (items: Iter8Experiment[], names: string[]): Iter8Experiment[] => {
  return items.filter(item => {
    let targetServiceFiltered = true;
    if (names.length > 0) {
      targetServiceFiltered = false;
      for (let i = 0; i < names.length; i++) {
        if (item.targetService.includes(names[i])) {
          targetServiceFiltered = true;
          break;
        }
      }
    }
    return targetServiceFiltered;
  });
};

const filterByBaseline = (items: Iter8Experiment[], names: string[]): Iter8Experiment[] => {
  return items.filter(item => {
    let baselineFiltered = true;
    if (names.length > 0) {
      baselineFiltered = false;
      for (let i = 0; i < names.length; i++) {
        if (item.baseline.includes(names[i])) {
          baselineFiltered = true;
          break;
        }
      }
    }
    return baselineFiltered;
  });
};

const filterByCandidate = (items: Iter8Experiment[], names: string[]): Iter8Experiment[] => {
  return items.filter(item => {
    let candidateFiltered = true;
    if (names.length > 0) {
      candidateFiltered = false;
      for (let i = 0; i < names.length; i++) {
        if (item.candidate.includes(names[i])) {
          candidateFiltered = true;
          break;
        }
      }
    }
    return candidateFiltered;
  });
};

export const filterBy = (iter8Experiment: Iter8Experiment[], filters: ActiveFilter[]): Iter8Experiment[] => {
  let ret = iter8Experiment;

  const targetServiceSelected = getFilterSelectedValues(targetServiceFilter, filters);
  if (targetServiceSelected.length > 0) {
    ret = filterByTargetService(ret, targetServiceSelected);
  }

  const baselineSelected = getFilterSelectedValues(baselineFilter, filters);
  if (baselineSelected.length > 0) {
    ret = filterByBaseline(ret, baselineSelected);
  }

  // We may have to perform a second round of filtering, using data fetched asynchronously (health)
  // If not, exit fast
  const candidateSelected = getFilterSelectedValues(candidateFilter, filters);
  if (candidateSelected.length > 0) {
    return filterByCandidate(ret, candidateSelected);
  }
  return ret;
};

const targetServiceFilter: FilterType = {
  id: 'targetService',
  title: 'Service',
  placeholder: 'Filter by Servicet Name',
  filterType: TextInputTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: []
};

const baselineFilter: FilterType = {
  id: 'baselin',
  title: 'Baseline',
  placeholder: 'Filter by Baseline Name',
  filterType: TextInputTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: []
};
const candidateFilter: FilterType = {
  id: 'candidate',
  title: 'Candidate',
  placeholder: 'Filter by Candidate Name',
  filterType: TextInputTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: []
};
export const availableFilters: FilterType[] = [targetServiceFilter, baselineFilter, candidateFilter];

/** Sort Method */

export const sortAppsItems = (
  unsorted: Iter8Experiment[],
  sortField: SortField<Iter8Experiment>,
  isAscending: boolean
): Promise<Iter8Experiment[]> => {
  const sorted = unsorted.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
  return Promise.resolve(sorted);
};
