import { SummaryWriter, SummaryWriterRenderer } from './BaseWriter';
import { ICell, sortable } from '@patternfly/react-table';

interface RouteSummary {
  name: string;
  domains: string;
  match: string;
  virtual_service: string;
}

export class RouteWriter implements SummaryWriter {
  summaries: RouteSummary[];
  sortingIndex: number;
  sortingDirection: string;

  constructor(summaries: RouteSummary[]) {
    this.summaries = summaries;
    this.sortingIndex = 0;
    this.sortingDirection = 'asc';
  }

  setSorting = (columnIndex: number, direction: string) => {
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

  rows(): string[][] {
    return this.summaries
      .map((summary: RouteSummary) => {
        return [summary.name, summary.domains, summary.match, summary.virtual_service];
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

export const RouteSummaryWriter = SummaryWriterRenderer<RouteWriter>();
