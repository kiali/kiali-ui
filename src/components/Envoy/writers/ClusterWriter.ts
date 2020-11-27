import { SummaryWriter, SummaryWriterRenderer } from './BaseWriter';
import { ICell, sortable } from '@patternfly/react-table';

interface ClusterSummary {
  service_fqdn: string;
  port: number;
  subset: string;
  direction: string;
  type: number;
  destination_rule: string;
}

export class ClusterWriter implements SummaryWriter {
  summaries: ClusterSummary[];
  sortingIndex: number;
  sortingDirection: string;

  constructor(summaries: ClusterSummary[]) {
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
      { title: 'Service FQDN', transforms: [sortable] },
      { title: 'Port', transforms: [sortable] },
      { title: 'Subset', transforms: [sortable] },
      { title: 'Direction', transforms: [sortable] },
      { title: 'Type', transforms: [sortable] },
      { title: 'DestinationRule', transforms: [sortable] }
    ];
  }

  rows(): string[][] {
    return this.summaries
      .map((summary: ClusterSummary) => {
        return [
          summary.service_fqdn,
          summary.port.toString(),
          summary.subset,
          summary.direction,
          summary.type.toString(),
          summary.destination_rule,
        ];
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

export const ClusterSummaryWriter = SummaryWriterRenderer<ClusterWriter>();
