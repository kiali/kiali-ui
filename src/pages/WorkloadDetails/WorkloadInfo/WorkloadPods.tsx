import * as React from 'react';
import { ObjectValidation, Pod } from '../../../types/IstioObjects';
import { Card, CardBody, EmptyState, EmptyStateBody,
  EmptyStateVariant,
  EmptyStateIcon, Grid, GridItem, Title, Tooltip } from '@patternfly/react-core';
import { ICell, IRow, Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import { css } from '@patternfly/react-styles';
import { ConfigIndicator } from '../../../components/ConfigValidation/ConfigIndicator';
import Labels from '../../../components/Label/Labels';
import { icons } from '../../../config';
import { CubesIcon } from '@patternfly/react-icons';

const textCenter = () => ({ textCenter: true });
const classNames = (...classNames: string[]) => () => ({
  className: css(...classNames)
});

type WorkloadPodsProps = {
  namespace: string;
  workloadName: string;
  pods: Pod[];
  validations: { [key: string]: ObjectValidation };
};

type WorkloadPodsState = {
  columns: ICell[];
  rows: IRow[];
};

class WorkloadPods extends React.Component<WorkloadPodsProps, WorkloadPodsState> {
  constructor(props: WorkloadPodsProps) {
    super(props);

    this.state = {
      columns: this.columns(),
      rows: this.rows()
    }
  }
  columns() {
    return [
      {title: 'Status', transforms: [textCenter],
        cellTransforms: [textCenter]},
      {title: 'Name', transforms: [textCenter], columnTransforms: [classNames('pf-m-width-20')], cellTransforms: [textCenter]},
      {title: 'Created at', transforms: [textCenter], columnTransforms: [classNames('pf-m-width-20')], cellTransforms: [textCenter]},
      {title: 'Labels', transforms: [textCenter],
        columnTransforms: [classNames('pf-m-width-50')],
        cellTransforms: [textCenter]},
      {title: 'Phase', transforms: [textCenter], cellTransforms: [textCenter]}
    ];
  }

  renderStatus(status: string) {
    const state = icons.phase[status];
    return (
      <Tooltip content={<>{status}</>}>
        {React.createElement(state.icon, {style: {color:state.color}})}
      </Tooltip>
    )
  };

  renderInformation (pod: Pod) {
    const columns: string[] = [
      'Created by',
      'Istio Init Containers',
      'Istio Containers'
    ];
    const rows = [{
      cells: [
        pod.createdBy && pod.createdBy.length > 0 ? pod.createdBy.map(ref => ref.name + ' (' + ref.kind + ')').join(', ') : '',
        pod.istioInitContainers ? pod.istioInitContainers.map(c => `${c.image}`).join(', ') : '',
        pod.istioContainers ? pod.istioContainers.map(c => `${c.image}`).join(', ') : ''
      ]
    }];
    return (
      <Table variant={TableVariant.compact} aria-label={"list_pods"} onCollapse={this.onCollapse}  cells={columns} rows={rows}>
        <TableHeader/>
        <TableBody />
      </Table>
    );
  };

  noPods(): IRow[] {
    return [{
      cells: [
        {title:
          <EmptyState variant={EmptyStateVariant.full}>
            <EmptyStateIcon icon={CubesIcon} />
            <Title headingLevel="h5" size="lg">
              No Pods found
            </Title>
            <EmptyStateBody>
              No pods found for workload {this.props.workloadName}
            </EmptyStateBody>
          </EmptyState>,
          props: {colSpan: 5}}
      ]
    }];
  }

  rows(): IRow[] {
    if ((this.props.pods || []).length === 0) { return this.noPods()}
    let rows: IRow[] = [];
    (this.props.pods || []).map((pod, podIdx) => {
      const validations: ObjectValidation[] = [];
      if (this.props.validations[pod.name]) {
        validations.push(this.props.validations[pod.name]);
      }
      rows.push({
        isOpen: false,
        cells: [
          {
            title: <ConfigIndicator id={podIdx + '-config-validation'} validations={validations} definition={true}/>
          },
          { title: pod.name },
          { title: new Date(pod.createdAt).toLocaleString() },
          { title: <Labels key={'labels' + podIdx} labels={pod.labels}/> },
          { title: this.renderStatus(pod.status) }
        ]
      });
      rows.push({
        parent: rows.length - 1,
        cells: [
          { title: this.renderInformation(pod) },
        ]
      });
      return rows;
    });

    return rows;
  }

  onCollapse = (_, rowKey, isOpen) => {
    const { rows } = this.state;
    rows[rowKey].isOpen = isOpen;
    this.setState({
      rows
    });
  }

  render() {

    const { columns, rows } = this.state;
    return (
      <Grid>
        <GridItem span={12}>
          <Card>
            <CardBody>
            <Table variant={TableVariant.compact} aria-label={"list_pods"} onCollapse={this.onCollapse}  cells={columns} rows={rows}>
              <TableHeader/>
              <TableBody />
            </Table>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    );
  }
}

export default WorkloadPods;
