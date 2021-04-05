import * as React from 'react';
import {
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  EmptyStateIcon,
  Text,
  TextVariants,
  Title
} from '@patternfly/react-core';
import { ICell, IRow, Table, TableHeader, TableBody, TableVariant, cellWidth } from '@patternfly/react-table';
import { BundleIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { WorkloadOverview } from '../../../types/ServiceInfo';
import LocalTime from '../../../components/Time/LocalTime';
import MissingSidecar from '../../../components/MissingSidecar/MissingSidecar';
import Labels from '../../../components/Label/Labels';
import { style } from 'typestyle';

interface ServiceInfoWorkloadProps {
  namespace: string;
  service: string;
  istioSidecar: boolean;
  workloads?: WorkloadOverview[];
}

const titleStyle = style({
  margin: '15px 0 11px 0'
});

class ServiceWorkload extends React.Component<ServiceInfoWorkloadProps> {
  columns(): ICell[] {
    // TODO: Casting 'as ITransforms' because @patternfly/react-table@2.22.19 has a typing bug. Remove the casting when PF fixes it.
    // https://github.com/patternfly/patternfly-next/issues/2373
    return [
      { title: 'Name', transforms: [cellWidth(10) as any] },
      { title: 'Type' },
      { title: 'Labels' },
      { title: 'Created at' },
      { title: 'Resource version' }
    ];
  }

  overviewLink(workload: WorkloadOverview) {
    return (
      <span>
        <Link
          to={`/namespaces/${this.props.namespace}/workloads/${workload.name}`}
          key={'ServiceWorkloadItem_' + this.props.namespace + '_' + workload.name}
        >
          <Text component={TextVariants.p}>
            {workload.name}{' '}
            {!workload.istioSidecar && (
              <MissingSidecar namespace={this.props.namespace} style={{ marginLeft: '10px' }} tooltip={true} />
            )}
          </Text>
        </Link>
      </span>
    );
  }

  noWorkloads(): IRow[] {
    return [
      {
        cells: [
          {
            title: (
              <EmptyState variant={EmptyStateVariant.full}>
                <EmptyStateIcon icon={BundleIcon} />
                <Title headingLevel="h5" size="lg">
                  No Workloads {!this.props.istioSidecar && ' and Istio Sidecar '} found
                </Title>
                <EmptyStateBody>
                  No workloads {!this.props.istioSidecar && ' and istioSidecar '} found for service {this.props.service}
                </EmptyStateBody>
              </EmptyState>
            ),
            props: { colSpan: 5 }
          }
        ]
      }
    ];
  }

  rows(): IRow[] {
    if ((this.props.workloads || []).length === 0) {
      return this.noWorkloads();
    }
    let rows: IRow[] = [];
    (this.props.workloads || []).map(workload => {
      rows.push({
        cells: [
          { title: this.overviewLink(workload) },
          { title: workload.type },
          { title: <Labels labels={workload.labels} /> },
          { title: <LocalTime time={workload.createdAt} /> },
          { title: workload.resourceVersion }
        ]
      });
      return rows;
    });
    return rows;
  }

  renderOld() {
    return (
      <Card>
        <CardBody>
          <Table
            variant={TableVariant.compact}
            aria-label={'list_workloads'}
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

  /*
            (this.props.workloads || []).map(workload => {
            return
          rows.push({
            cells: [
              { title: this.overviewLink(workload) },
              { title: workload.type },
              { title: <Labels labels={workload.labels} /> },
              { title: <LocalTime time={workload.createdAt} /> },
              { title: workload.resourceVersion }
            ]
          });

   */

  render() {
    return (
      <Card>
        <CardBody>
          <Title headingLevel="h3" size="lg" className={titleStyle}>
            Services
          </Title>
          {(this.props.workloads || []).map(workload => {
            return <div>{this.overviewLink(workload)}</div>;
          })}
        </CardBody>
      </Card>
    );
  }
}

export default ServiceWorkload;
