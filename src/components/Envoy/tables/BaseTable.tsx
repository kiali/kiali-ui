import * as React from 'react';
import { ICell, ISortBy, SortByDirection, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { ClusterSummaryTable, ClusterTable } from './ClusterTable';
import { RouteSummaryTable, RouteTable } from './RouteTable';
import { ListenerSummaryTable, ListenerTable } from './ListenerTable';
import { EnvoyProxyDump } from '../../../types/IstioObjects';
import { StatefulFilters } from '../../Filters/StatefulFilters';
import { ActiveFiltersInfo, FilterType } from '../../../types/Filters';

export interface SummaryTable {
  head: () => ICell[];
  rows: () => (string | number)[][];
  setSorting: (columnIndex: number, direction: string) => void;
  availableFilters: () => FilterType[];
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
        <>
          <StatefulFilters initialFilters={this.props.writer.availableFilters()} onFilterChange={(active: ActiveFiltersInfo): void => {console.log(active);}} />
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
        </>
      );
    }
  };
}

export const SummaryTableBuilder = (resource: string, config: EnvoyProxyDump) => {
  let writerComp, writerProps;

  switch (resource) {
    case 'clusters':
      writerComp = ClusterSummaryTable;
      writerProps = new ClusterTable(config.clusters || []);
      break;
    case 'listeners':
      writerComp = ListenerSummaryTable;
      writerProps = new ListenerTable(config.listeners || []);
      break;
    case 'routes':
      writerComp = RouteSummaryTable;
      writerProps = new RouteTable(config.routes || []);
      break;
  }
  return [writerComp, writerProps];
};
