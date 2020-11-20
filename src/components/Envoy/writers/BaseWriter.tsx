import * as React from 'react';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import { ClusterSummaryWriter, ClusterWriter } from './ClusterWriter';
import { RouteSummaryWriter, RouteWriter } from './RouteWriter';

export interface SummaryWriter {
  head: () => string[];
  rows: () => string[][];
}

export function SummaryWriterRenderer <T extends SummaryWriter>() {
  interface SummaryWriterProps<T> {
    writer: T;
  }

  return (
    class SummaryWriter extends React.Component<SummaryWriterProps<T>> {
      render() {
        return (
          <Table aria-label="Sortable Table" cells={this.props.writer.head()} rows={this.props.writer.rows()}>
            <TableHeader />
            <TableBody />
          </Table>
        );
      }
    }
  );
}

export const SummaryWriterBuilder = (resource: string, config: any) => {
  let writerComp, writerProps;

  switch (resource) {
    case "clusters":
      writerComp = ClusterSummaryWriter;
      writerProps = new ClusterWriter(config);
      break;
    case "routes":
      writerComp = RouteSummaryWriter;
      writerProps = new RouteWriter(config);
      break;
  }
  return [writerComp, writerProps]
};
