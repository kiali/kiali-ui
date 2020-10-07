import { FILTER_ACTION_APPEND, istioSidecarFilter, healthFilter, Filter } from '../../types/Filters';
import { AppListItem } from '../../types/AppList';
import { SortField } from '../../types/SortFilters';
import { WithAppHealth } from '../../types/Health';
import { hasMissingSidecar } from '../../components/VirtualList/Config';
import { TextInputTypes } from '@patternfly/react-core';
import { compareHealth } from 'utils/Compare';
import { labelFilter } from 'helpers/LabelFilterHelper';

export const sortFields: SortField<AppListItem>[] = [
  {
    id: 'namespace',
    title: 'Namespace',
    isNumeric: false,
    param: 'ns',
    compare: (a, b) => a.namespace.localeCompare(b.namespace) || a.name.localeCompare(b.name)
  },
  {
    id: 'appname',
    title: 'App Name',
    isNumeric: false,
    param: 'wn',
    compare: (a, b) => a.name.localeCompare(b.name)
  },
  {
    id: 'details',
    title: 'Details',
    isNumeric: false,
    param: 'is',
    compare: (a, b) => {
      // First sort by missing sidecar
      const aSC = hasMissingSidecar(a) ? 1 : 0;
      const bSC = hasMissingSidecar(b) ? 1 : 0;
      if (aSC !== bSC) {
        return aSC - bSC;
      }
      // Finally by name
      return a.name.localeCompare(b.name);
    }
  },
  {
    id: 'health',
    title: 'Health',
    isNumeric: false,
    param: 'he',
    compare: (a, b) => compareHealth('app', a, b)
  }
];

const appNameFilter: Filter<AppListItem> = {
  id: 'appname',
  title: 'App Name',
  placeholder: 'Filter by App Name',
  filterType: TextInputTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: [],
  check: (item, active) => active.filters.some(f => item.name.includes(f.value))
};

export const availableFilters = [appNameFilter, istioSidecarFilter, healthFilter, labelFilter];

/** Sort Method */

export const sortAppsItems = (
  unsorted: AppListItem[],
  sortField: SortField<AppListItem>,
  isAscending: boolean
): Promise<AppListItem[]> => {
  if (sortField.title === 'Health') {
    // In the case of health sorting, we may not have all health promises ready yet
    // So we need to get them all before actually sorting
    const allHealthPromises: Promise<WithAppHealth<AppListItem>>[] = unsorted.map(item => {
      return item.healthPromise.then((health): WithAppHealth<AppListItem> => ({ ...item, health }));
    });
    return Promise.all(allHealthPromises).then(arr => {
      return arr.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
    });
  }
  const sorted = unsorted.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
  return Promise.resolve(sorted);
};
