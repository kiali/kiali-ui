import { SummaryTable, SummaryTableRenderer } from './BaseTable';
import { ICell, ISortBy, sortable, SortByDirection } from '@patternfly/react-table';
import { ClusterSummary } from '../../../types/IstioObjects';
import { ActiveFilter, ActiveFiltersInfo, FILTER_ACTION_UPDATE, FilterType, FilterTypes } from '../../../types/Filters';
import { FilterSelected } from '../../Filters/StatefulFilters';

const filterToColumn = {
  fqdn: 0,
  port: 1,
  subset: 2,
  direction: 3
};

export class ClusterTable implements SummaryTable {
  summaries: ClusterSummary[];
  sortingIndex: number;
  sortingDirection: 'asc' | 'desc';

  constructor(summaries: ClusterSummary[], sortBy: ISortBy) {
    this.summaries = summaries;
    this.sortingIndex = sortBy.index || 0;
    this.sortingDirection = sortBy.direction || SortByDirection.asc;
  }

  availableFilters = (): FilterType[] => {
    return [
      {
        id: 'fqdn',
        title: 'FQDN',
        placeholder: 'FQDN',
        filterType: FilterTypes.text,
        action: FILTER_ACTION_UPDATE,
        filterValues: []
      },
      {
        id: 'port',
        title: 'Port',
        placeholder: 'Port',
        filterType: FilterTypes.text,
        action: FILTER_ACTION_UPDATE,
        filterValues: []
      },
      {
        id: 'subset',
        title: 'Subset',
        placeholder: 'Subset',
        filterType: FilterTypes.text,
        action: FILTER_ACTION_UPDATE,
        filterValues: []
      },
      {
        id: 'direction',
        title: 'Direction',
        placeholder: 'Direction',
        filterType: FilterTypes.select,
        action: FILTER_ACTION_UPDATE,
        filterValues: [
          { id: 'inbound', title: 'inbound' },
          { id: 'outbound', title: 'outbound' },
          { id: '-', title: '-' }
        ]
      }
    ];
  };

  head = (): ICell[] => {
    return [
      { title: 'Service FQDN', transforms: [sortable] },
      { title: 'Port', transforms: [sortable] },
      { title: 'Subset', transforms: [sortable] },
      { title: 'Direction', transforms: [sortable] },
      { title: 'Type', transforms: [sortable] },
      { title: 'DestinationRule', transforms: [sortable] }
    ];
  };

  resource = (): string => 'clusters';

  setSorting = (columnIndex: number, direction: 'asc' | 'desc') => {
    this.sortingIndex = columnIndex;
    this.sortingDirection = direction;
  };

  sortBy = (): ISortBy => {
    return {
      index: this.sortingIndex,
      direction: this.sortingDirection || 'asc'
    };
  };

  rows(): (string | number)[][] {
    return this.summaries
      .map((summary: ClusterSummary): (string | number)[] => {
        return [
          summary.service_fqdn,
          summary.port || '-',
          summary.subset || '-',
          summary.direction || '-',
          summary.type,
          summary.destination_rule
        ];
      })
      .filter((value: (string | number)[]) => {
        const activeFilters: ActiveFiltersInfo = FilterSelected.getSelected();
        if (activeFilters.filters.length === 0) {
          return true;
        }
        return activeFilters.filters.reduce((acc: boolean, filter: ActiveFilter) => {
          const row: number = filterToColumn[filter.id];
          let match: boolean = true;
          if (row !== undefined) {
            match = value[row].toString().includes(filter.value);
          }
          return acc && match;
        }, true);
      })
      .sort((a: any[], b: any[]) => {
        if (this.sortingDirection === 'asc') {
          return a[this.sortingIndex] < b[this.sortingIndex] ? -1 : a[this.sortingIndex] > b[this.sortingIndex] ? 1 : 0;
        } else {
          return a[this.sortingIndex] > b[this.sortingIndex] ? -1 : a[this.sortingIndex] < b[this.sortingIndex] ? 1 : 0;
        }
      });
  }
}

export const ClusterSummaryTable = SummaryTableRenderer<ClusterTable>();
