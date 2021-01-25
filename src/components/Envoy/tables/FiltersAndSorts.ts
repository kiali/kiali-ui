import { ActiveFilter, ActiveFiltersInfo } from '../../../types/Filters';
import { FilterSelected } from '../../Filters/StatefulFilters';
import { EnvoySummary } from '../../../types/IstioObjects';

export type FilterMethodMap = { [id: string]: (value, filter) => boolean };

export const defaultFilter = (value: EnvoySummary, filterMethods: FilterMethodMap): boolean => {
  const activeFilters: ActiveFiltersInfo = FilterSelected.getSelected();
  // If there is no active filters, show the entry
  if (activeFilters.filters.length === 0) {
    return true;
  }

  // Group filters by id
  const groupedFilters: ActiveFilter[][] = activeFilters.filters.reduce(
    (groupedFilters: ActiveFilter[][], filter: ActiveFilter): ActiveFilter[][] => {
      let filterGroup = groupedFilters[filter.id];
      if (!filterGroup) {
        filterGroup = [];
      }
      groupedFilters[filter.id] = filterGroup.concat(filter);
      return groupedFilters;
    },
    []
  );

  // Show entities that has a match in each filter group
  return groupedFilters.reduce((prevMatch: boolean, filters: ActiveFilter[]): boolean => {
    // There is at least one filter matching the item in the group
    return (
      prevMatch &&
      filters.some((filter: ActiveFilter) => {
        return filterMethods[filter.id](value, filter);
      })
    );
  }, true);
};
