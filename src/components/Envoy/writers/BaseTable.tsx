import * as React from 'react';
import { ICell, ISortBy, SortByDirection, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { ClusterTable } from './ClusterTable';
import { RouteTable } from './RouteTable';
import { ListenerTable } from './ListenerTable';
import { ClusterSummaryTable } from './ClusterTable';
import { ListenerSummaryTable } from './ListenerTable';
import { RouteSummaryTable } from './RouteTable';

export interface SummaryTable {
  head: () => ICell[];
  rows: () => (string | number)[][];
  setSorting: (columnIndex: number, direction: string) => void;
}

export function SummaryTableRenderer<T extends SummaryTable>() {
  interface SummaryTableProps<T> {
    writer: T;
  }

  interface SummaryTableState {
    sortBy: ISortBy;
  }

  return class SummaryTable extends React.Component<SummaryTableProps<T>, SummaryTableState> {
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

export const SummaryTableBuilder = (resource: string, config: any) => {
  let writerComp, writerProps;

  switch (resource) {
    case 'clusters':
      writerComp = ClusterSummaryTable;
      writerProps = new ClusterTable(config);
      break;
    case 'routes':
      writerComp = RouteSummaryTable;
      writerProps = new RouteTable(config);
      break;
    case 'listeners':
      writerComp = ListenerSummaryTable;
      writerProps = new ListenerTable(config);
      break;
  }
  return [writerComp, writerProps];
};
