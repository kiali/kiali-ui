import { SummaryTable, SummaryTableRenderer } from './BaseTable';
import { ICell, ISortBy, sortable } from '@patternfly/react-table';
import { RouteSummary } from '../../../types/IstioObjects';
import { ActiveFilter, ActiveFiltersInfo, FILTER_ACTION_UPDATE, FilterType, FilterTypes } from '../../../types/Filters';
import { FilterSelected } from '../../Filters/StatefulFilters';

const filterToColumn = {
  name: 0,
  domains: 1
};

export class RouteTable implements SummaryTable {
  summaries: RouteSummary[];
  sortingIndex: number;
  sortingDirection: 'asc' | 'desc';

  constructor(summaries: RouteSummary[], sortBy: ISortBy) {
    this.summaries = summaries;
    this.sortingIndex = sortBy.index || 0;
    this.sortingDirection = sortBy.direction || 'asc';
  }

  sortBy = (): ISortBy => {
    return {
      index: this.sortingIndex,
      direction: this.sortingDirection
    };
  };

  setSorting = (columnIndex: number, direction: 'asc' | 'desc') => {
    this.sortingDirection = direction;
    this.sortingIndex = columnIndex;
  };

  head(): ICell[] {
    return [
      { title: 'Name', transforms: [sortable] },
      { title: 'Domains', transforms: [sortable] },
      { title: 'Match', transforms: [sortable] },
      { title: 'Virtual Service', transforms: [sortable] }
    ];
  }

  availableFilters = (): FilterType[] => {
    return [
      {
        id: 'name',
        title: 'Name',
        placeholder: 'Name',
        filterType: FilterTypes.text,
        action: FILTER_ACTION_UPDATE,
        filterValues: []
      },
      {
        id: 'domains',
        title: 'Domains',
        placeholder: 'Domains',
        filterType: FilterTypes.text,
        action: FILTER_ACTION_UPDATE,
        filterValues: []
      }
    ];
  };

  rows(): string[][] {
    return this.summaries
      .map((summary: RouteSummary) => {
        return [summary.name, summary.domains, summary.match, summary.virtual_service];
      })
      .filter((value: (string | number)[]) => {
        const activeFilters: ActiveFiltersInfo = FilterSelected.getSelected();
        if (activeFilters.filters.length === 0) {
          return true;
        }
        return activeFilters.filters.reduce((acc: boolean, filter: ActiveFilter) => {
          const row: number = filterToColumn[filter.id];
          let match: boolean = true;
          if(row !== undefined) {
            match = value[row].toString().includes(filter.value);
          }
          return acc && match;
        }, true);
      })
      .sort((a: string[], b: string[]) => {
        if (this.sortingDirection === 'asc') {
          return a[this.sortingIndex] < b[this.sortingIndex] ? -1 : a[this.sortingIndex] > b[this.sortingIndex] ? 1 : 0;
        } else {
          return a[this.sortingIndex] > b[this.sortingIndex] ? -1 : a[this.sortingIndex] < b[this.sortingIndex] ? 1 : 0;
        }
      });
  }
}

export const RouteSummaryTable = SummaryTableRenderer<RouteTable>();
