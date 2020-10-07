import history from 'app/History';
import {
  ActiveFiltersInfo,
  ActiveFilter,
  LabelOperation,
  ID_LABEL_OPERATION,
  DEFAULT_LABEL_OPERATION,
  Filter,
  FilterDefinition,
  PromiseFilter,
  promiseFilter
} from 'types/Filters';
import { removeDuplicatesArray } from 'utils/Common';

export const getFiltersFromURL = (filterTypes: FilterDefinition[]): ActiveFiltersInfo => {
  const urlParams = new URLSearchParams(history.location.search);
  const activeFilters: ActiveFilter[] = [];
  filterTypes.forEach(filter => {
    urlParams.getAll(filter.id).forEach(value => {
      activeFilters.push({
        id: filter.id,
        title: filter.title,
        value: value
      });
    });
  });

  return {
    filters: activeFilters,
    op: (urlParams.get(ID_LABEL_OPERATION) as LabelOperation) || DEFAULT_LABEL_OPERATION
  };
};

export const setFiltersToURL = (filterTypes: FilterDefinition[], filters: ActiveFiltersInfo): ActiveFiltersInfo => {
  const urlParams = new URLSearchParams(history.location.search);
  filterTypes.forEach(type => {
    urlParams.delete(type.id);
  });
  // Remove manually the special Filter opLabel
  urlParams.delete('opLabel');
  const cleanFilters: ActiveFilter[] = [];

  filters.filters.forEach(activeFilter => {
    const filterType = filterTypes.find(filter => filter.id === activeFilter.id);
    if (!filterType) {
      return;
    }
    cleanFilters.push(activeFilter);
    urlParams.append(filterType.id, activeFilter.value);
  });
  urlParams.append(ID_LABEL_OPERATION, filters.op);
  // Resetting pagination when filters change
  history.push(history.location.pathname + '?' + urlParams.toString());
  return { filters: cleanFilters, op: filters.op || DEFAULT_LABEL_OPERATION };
};

export const filtersMatchURL = (filterTypes: FilterDefinition[], filters: ActiveFiltersInfo): boolean => {
  // This can probably be improved and/or simplified?
  const fromFilters: Map<string, string[]> = new Map<string, string[]>();
  filters.filters.forEach(activeFilter => {
    const existingValue = fromFilters.get(activeFilter.id) || [];
    fromFilters.set(activeFilter.id, existingValue.concat(activeFilter.value));
  });

  const fromURL: Map<string, string[]> = new Map<string, string[]>();
  const urlParams = new URLSearchParams(history.location.search);
  filterTypes.forEach(filter => {
    const values = urlParams.getAll(filter.id);
    if (values.length > 0) {
      const existing = fromURL.get(filter.id) || [];
      fromURL.set(filter.id, existing.concat(values));
    }
  });

  if (fromFilters.size !== fromURL.size) {
    return false;
  }
  let equalFilters = true;
  fromFilters.forEach((filterValues, filterName) => {
    const aux = fromURL.get(filterName) || [];
    equalFilters =
      equalFilters && filterValues.every(value => aux.includes(value)) && filterValues.length === aux.length;
  });

  return equalFilters;
};

export const getFilterSelectedValues = (filter: FilterDefinition, activeFilters: ActiveFiltersInfo): string[] => {
  const selected: string[] = activeFilters.filters
    .filter(activeFilter => activeFilter.id === filter.id)
    .map(activeFilter => activeFilter.value);
  return removeDuplicatesArray(selected);
};

export class GlobalFilters {
  static selectedFilters: ActiveFilter[] | undefined = undefined;
  static opSelected: LabelOperation;

  static init = (filterTypes: FilterDefinition[]) => {
    let active = GlobalFilters.getActive();
    if (!GlobalFilters.isInitialized()) {
      active = getFiltersFromURL(filterTypes);
      GlobalFilters.setActive(active);
    } else if (!filtersMatchURL(filterTypes, active)) {
      active = setFiltersToURL(filterTypes, active);
      GlobalFilters.setActive(active);
    }
    return active;
  };

  static reset = () => {
    GlobalFilters.selectedFilters = undefined;
  };

  static setActive = (activeFilters: ActiveFiltersInfo) => {
    GlobalFilters.selectedFilters = activeFilters.filters;
    GlobalFilters.opSelected = activeFilters.op;
  };

  static getActive = (): ActiveFiltersInfo => {
    return { filters: GlobalFilters.selectedFilters || [], op: GlobalFilters.opSelected || 'or' };
  };

  static isInitialized = () => {
    return GlobalFilters.selectedFilters !== undefined;
  };
}

export const runFilters = <T>(
  items: T[],
  filters: Filter<T>[],
  active: ActiveFiltersInfo = GlobalFilters.getActive()
) => {
  return filters.reduce((i, f) => runSingleFilter(i, f, active), items);
};

export const runSingleFilter = <T>(items: T[], filter: Filter<T>, active: ActiveFiltersInfo) => {
  const relatedActive = { filters: active.filters.filter(af => af.id === filter.id), op: active.op };
  if (relatedActive.filters.length) {
    return items.filter(item => filter.check(item, relatedActive));
  }
  return items;
};

export const runPromiseFilters = <T>(
  items: T[],
  filters: (PromiseFilter<T> | Filter<T>)[],
  active: ActiveFiltersInfo = GlobalFilters.getActive()
) => {
  return filters.reduce((previous, filter) => {
    return previous.then(items => runSinglePromiseFilter(items, promiseFilter(filter), active));
  }, Promise.resolve(items));
};

export const runSinglePromiseFilter = <T>(
  items: T[],
  filter: PromiseFilter<T>,
  active: ActiveFiltersInfo
): Promise<T[]> => {
  const relatedActive = { filters: active.filters.filter(af => af.id === filter.id), op: active.op };
  if (relatedActive.filters.length) {
    const promises = items.map(item => filter.checkAsync(item, active).then(result => ({ item: item, check: result })));
    return Promise.all(promises).then(results => results.filter(r => r.check).map(r => r.item));
  }
  return Promise.resolve(items);
};
