import { SummaryWriter, SummaryWriterRenderer } from './BaseWriter';
import { ICell, sortable } from '@patternfly/react-table';

interface ListenerSummary {
  address: string;
  port: string;
  match: string;
  destination: string;
}

export class ListenerWriter implements SummaryWriter {
  summaries: ListenerSummary[];
  sortingIndex: number;
  sortingDirection: string;

  constructor(summaries: ListenerSummary[]) {
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
      { title: 'Address', transforms: [sortable] },
      { title: 'Port', transforms: [sortable] },
      { title: 'Match', transforms: [sortable] },
      { title: 'Destination', transforms: [sortable] }
    ];
  }

  rows(): string[][] {
    return this.summaries
      .map((summary: ListenerSummary) => {
        return [summary.address, summary.port, summary.match, summary.destination];
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

export const ListenerSummaryWriter = SummaryWriterRenderer<ListenerWriter>();
