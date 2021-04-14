import * as React from 'react';
import { ObjectValidation, Pod } from '../../types/IstioObjects';
import { cellWidth, ICell, IRow, Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title
} from '@patternfly/react-core';
import PodStatus from './PodStatus';
import { style } from 'typestyle';

type WorkloadPodsProps = {
  namespace: string;
  workload: string;
  pods: Pod[];
  validations: { [key: string]: ObjectValidation };
};

const emtpytStyle = style({
  padding: '0 0 0 0',
  margin: '0 0 0 0'
});

class WorkloadPods extends React.Component<WorkloadPodsProps> {
  columns(): ICell[] {
    // TODO: Casting 'as any' because @patternfly/react-table@2.22.19 has a typing bug. Remove the casting when PF fixes it.
    // https://github.com/patternfly/patternfly-next/issues/2373
    return [{ title: 'Name' }, { title: 'Status', transforms: [cellWidth(10) as any] }];
  }

  noPods(): IRow[] {
    return [
      {
        cells: [
          {
            title: (
              <EmptyState variant={EmptyStateVariant.small} className={emtpytStyle}>
                <EmptyStateBody className={emtpytStyle}>No Pods in workload {this.props.workload}</EmptyStateBody>
              </EmptyState>
            ),
            props: { colSpan: 2 }
          }
        ]
      }
    ];
  }

  rows(): IRow[] {
    if ((this.props.pods || []).length === 0) {
      return this.noPods();
    }

    let rows: IRow[] = [];
    (this.props.pods || []).map((pod, _podIdx) => {
      let validation: ObjectValidation = {} as ObjectValidation;
      if (this.props.validations[pod.name]) {
        validation = this.props.validations[pod.name];
      }

      rows.push({
        cells: [
          { title: <>{pod.name}</> },
          {
            title: (
              <>
                <PodStatus proxyStatus={pod.proxyStatus} checks={validation.checks} />
              </>
            )
          }
        ]
      });
      return rows;
    });

    return rows;
  }

  render() {
    return (
      <Card isCompact={true}>
        <CardHeader>
          <Title headingLevel="h5" size="lg">
            Pods
          </Title>
        </CardHeader>
        <CardBody>
          <Table
            variant={TableVariant.compact}
            aria-label={'list_workloads_pods'}
            cells={this.columns()}
            rows={this.rows()}
            // This style is declared on _overrides.scss
            className="table"
          >
            <TableHeader />
            <TableBody />
          </Table>
        </CardBody>
      </Card>
    );
  }
}

export default WorkloadPods;
