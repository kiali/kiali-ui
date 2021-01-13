import { SummaryTable, SummaryTableRenderer } from './BaseTable';
import { ICell, ISortBy, sortable } from '@patternfly/react-table';
import { ListenerSummary } from '../../../types/IstioObjects';
import { FILTER_ACTION_APPEND, FilterType, FilterTypes } from '../../../types/Filters';

export class ListenerTable implements SummaryTable {
  summaries: ListenerSummary[];
  sortingIndex: number;
  sortingDirection: 'asc' | 'desc';

  constructor(summaries: ListenerSummary[], sortBy: ISortBy) {
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

  head = (): ICell[] => {
    return [
      { title: 'Address', transforms: [sortable] },
      { title: 'Port', transforms: [sortable] },
      { title: 'Match', transforms: [sortable] },
      { title: 'Destination', transforms: [sortable] }
    ];
  };

  availableFilters = (): FilterType[] => {
    return [
      {
        id: 'address',
        title: 'Address',
        placeholder: 'Address',
        filterType: FilterTypes.text,
        action: FILTER_ACTION_APPEND,
        filterValues: []
      }
    ];
  };

  rows(): (string | number)[][] {
    return this.summaries
      .map((summary: ListenerSummary) => {
        return [summary.address, summary.port, summary.match, summary.destination];
      })
      .sort((a: (string | number)[], b: (string | number)[]) => {
        if (this.sortingDirection === 'asc') {
          return a[this.sortingIndex] < b[this.sortingIndex] ? -1 : a[this.sortingIndex] > b[this.sortingIndex] ? 1 : 0;
        } else {
          return a[this.sortingIndex] > b[this.sortingIndex] ? -1 : a[this.sortingIndex] < b[this.sortingIndex] ? 1 : 0;
        }
      });
  }
}

export const ListenerSummaryTable = SummaryTableRenderer<ListenerTable>();
