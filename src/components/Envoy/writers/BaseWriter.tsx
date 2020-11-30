import * as React from 'react';
import { ICell, ISortBy, SortByDirection, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { ClusterSummaryWriter, ClusterWriter } from './ClusterWriter';
import { RouteSummaryWriter, RouteWriter } from './RouteWriter';
import { ListenerSummaryWriter, ListenerWriter } from './ListenerWriter';

export interface SummaryWriter {
  head: () => ICell[];
  rows: () => string[][];
  setSorting: (columnIndex: number, direction: string) => void;
}

export function SummaryWriterRenderer<T extends SummaryWriter>() {
  interface SummaryWriterProps<T> {
    writer: T;
  }

  interface SummaryWriterState {
    sortBy: ISortBy;
  }

  return class SummaryWriter extends React.Component<SummaryWriterProps<T>, SummaryWriterState> {
    constructor(props) {
      super(props);
      this.state = {
        sortBy: {
          direction: SortByDirection.asc,
          index: 0
        }
      };
    }

    onSort = (_: React.MouseEvent, columnIndex: number, sortByDirection: SortByDirection) => {
      this.props.writer.setSorting(columnIndex, sortByDirection);
      this.setState({
        sortBy: {
          direction: sortByDirection,
          index: columnIndex
        }
      });
    };

    render() {
      return (
        <Table
          aria-label="Sortable Table"
          cells={this.props.writer.head()}
          rows={this.props.writer.rows()}
          sortBy={this.state.sortBy}
          onSort={this.onSort}
        >
          <TableHeader />
          <TableBody />
        </Table>
      );
    }
  };
}

export const SummaryWriterBuilder = (resource: string, config: any) => {
  let writerComp, writerProps;

  switch (resource) {
    case 'clusters':
      writerComp = ClusterSummaryWriter;
      writerProps = new ClusterWriter(config);
      break;
    case 'routes':
      writerComp = RouteSummaryWriter;
      writerProps = new RouteWriter(config);
      break;
    case 'listeners':
      writerComp = ListenerSummaryWriter;
      writerProps = new ListenerWriter(config);
      break;
  }
  return [writerComp, writerProps];
};
