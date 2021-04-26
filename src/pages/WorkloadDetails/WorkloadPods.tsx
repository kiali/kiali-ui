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
  Title,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import PodStatus from './PodStatus';
import { style } from 'typestyle';
import { KialiIcon } from '../../config/KialiIcon';
import LocalTime from '../../components/Time/LocalTime';
import Labels from '../../components/Label/Labels';

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

const resourceListStyle = style({
  margin: '0px 0 11px 0',
  $nest: {
    '& > ul > li > span': {
      float: 'left',
      width: '125px',
      fontWeight: 700
    }
  }
});

const infoStyle = style({
  margin: '0px 5px 2px 10px',
  verticalAlign: '-4px !important'
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
      const podProperties = (
        <div key="properties-list" className={resourceListStyle}>
          <ul style={{ listStyleType: 'none' }}>
            <li>
              <span>Created</span>
              <div style={{ display: 'inline-block' }}>
                <LocalTime time={pod.createdAt} />
              </div>
            </li>
            <li>
              <span>Created By</span>
              <div style={{ display: 'inline-block' }}>
                {pod.createdBy && pod.createdBy.length > 0
                  ? pod.createdBy.map(ref => ref.name + ' (' + ref.kind + ')').join(', ')
                  : ''}
              </div>
            </li>
            <li>
              <span>Istio Init Container</span>
              <div style={{ display: 'inline-block' }}>
                {pod.istioInitContainers ? pod.istioInitContainers.map(c => `${c.image}`).join(', ') : ''}
              </div>
            </li>
            <li>
              <span>Istio Container</span>
              <div style={{ display: 'inline-block' }}>
                {pod.istioContainers ? pod.istioContainers.map(c => `${c.image}`).join(', ') : ''}
              </div>
            </li>
            <li>
              <span>Labels</span>
              <div style={{ display: 'inline-block' }}>
                <Labels labels={pod.labels} expanded={true} />
              </div>
            </li>
          </ul>
        </div>
      );

      rows.push({
        cells: [
          {
            title: (
              <span>
                {pod.name}
                <Tooltip
                  position={TooltipPosition.right}
                  content={<div style={{ textAlign: 'left' }}>{podProperties}</div>}
                >
                  <KialiIcon.Info className={infoStyle} />
                </Tooltip>
              </span>
            )
          },
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
