import { SummaryTable, SummaryTableRenderer } from './BaseTable';
import { ICell, ISortBy, sortable } from '@patternfly/react-table';
import { ListenerSummary } from '../../../types/IstioObjects';
import { ActiveFilter, FILTER_ACTION_APPEND, FilterType, FilterTypes } from '../../../types/Filters';
import { SortField } from '../../../types/SortFilters';
import Namespace from '../../../types/Namespace';
import { defaultFilter } from '../../../helpers/EnvoyHelpers';

export class ListenerTable implements SummaryTable {
  summaries: ListenerSummary[];
  sortingIndex: number;
  sortingDirection: 'asc' | 'desc';
  namespaces: Namespace[];

  constructor(summaries: ListenerSummary[], sortBy: ISortBy, namespaces: Namespace[]) {
    this.summaries = summaries;
    this.sortingIndex = sortBy.index || 0;
    this.sortingDirection = sortBy.direction || 'asc';
    this.namespaces = namespaces;
  }

  availableFilters = (): FilterType[] => {
    return [
      {
        id: 'address',
        title: 'Address',
        placeholder: 'Address',
        filterType: FilterTypes.text,
        action: FILTER_ACTION_APPEND,
        filterValues: []
      },
      {
        id: 'port',
        title: 'Port',
        placeholder: 'Port',
        filterType: FilterTypes.text,
        action: FILTER_ACTION_APPEND,
        filterValues: []
      },
      {
        id: 'match',
        title: 'Match',
        placeholder: 'Match',
        filterType: FilterTypes.text,
        action: FILTER_ACTION_APPEND,
        filterValues: []
      },
      {
        id: 'destination',
        title: 'Destination',
        placeholder: 'Destination',
        filterType: FilterTypes.text,
        action: FILTER_ACTION_APPEND,
        filterValues: []
      }
    ];
  };

  filterMethods = (): { [filter_id: string]: (summary, activeFilter) => boolean } => {
    return {
      address: (entry: ListenerSummary, filter: ActiveFilter): boolean => {
        return entry.address.includes(filter.value);
      },
      port: (entry: ListenerSummary, filter: ActiveFilter): boolean => {
        return entry.port.toString().includes(filter.value);
      },
      match: (entry: ListenerSummary, filter: ActiveFilter): boolean => {
        return entry.match.includes(filter.value);
      },
      destination: (entry: ListenerSummary, filter: ActiveFilter): boolean => {
        return entry.destination.includes(filter.value);
      }
    };
  };

  sortFields = (): SortField<ListenerSummary>[] => {
    return [
      {
        id: 'address',
        title: 'Address',
        isNumeric: false,
        param: 'addess',
        compare: (a, b) => {
          return a.address.localeCompare(b.address);
        }
      },
      {
        id: 'port',
        title: 'Port',
        isNumeric: true,
        param: 'port',
        compare: (a, b) => {
          return a.port - b.port;
        }
      },
      {
        id: 'match',
        title: 'Match',
        isNumeric: false,
        param: 'match',
        compare: (a, b) => {
          return a.match.localeCompare(b.match);
        }
      },
      {
        id: 'destination',
        title: 'Destination',
        isNumeric: false,
        param: 'destination',
        compare: (a, b) => {
          return a.destination.localeCompare(b.destination);
        }
      }
    ];
  };

  head = (): ICell[] => {
    return [
      { title: 'Address', transforms: [sortable] },
      { title: 'Port', transforms: [sortable] },
      { title: 'Match', transforms: [sortable] },
      { title: 'Destination', transforms: [sortable] }
    ];
  };

  resource = (): string => 'listeners';

  setSorting = (columnIndex: number, direction: 'asc' | 'desc') => {
    this.sortingDirection = direction;
    this.sortingIndex = columnIndex;
  };

  sortBy = (): ISortBy => {
    return {
      index: this.sortingIndex,
      direction: this.sortingDirection
    };
  };

  rows(): (string | number)[][] {
    return this.summaries
      .filter((value: ListenerSummary) => {
        return defaultFilter(value, this.filterMethods());
      })
      .sort((a: ListenerSummary, b: ListenerSummary) => {
        const sortField = this.sortFields().find((value: SortField<ListenerSummary>): boolean => {
          return value.id === this.sortFields()[this.sortingIndex].id;
        });
        return this.sortingDirection === 'asc' ? sortField!.compare(a, b) : sortField!.compare(b, a);
      })
      .map((summary: ListenerSummary) => {
        return [summary.address, summary.port, summary.match, summary.destination];
      });
  }
}

export const ListenerSummaryTable = SummaryTableRenderer<ListenerTable>();
