import * as React from 'react';
import { ObjectValidation, Pod } from '../../../types/IstioObjects';
import { Card, CardBody, Grid, GridItem, Tooltip } from '@patternfly/react-core';
import { ICell, IRow, Table, TableHeader, TableBody, TableVariant, classNames, textCenter } from '@patternfly/react-table';
import { ConfigIndicator } from '../../../components/ConfigValidation/ConfigIndicator';
import Labels from '../../../components/Label/Labels';
import { icons } from '../../../config';

type WorkloadPodsProps = {
  namespace: string;
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

  renderExtraInformation
  rows() {
    let rows: IRow[] = [];
    (this.props.pods || []).map((pod, podIdx) => {
      const validations: ObjectValidation[] = [];
      if (this.props.validations[pod.name]) {
        validations.push(this.props.validations[pod.name]);
      }
      rows.push({
        isOpen: false,
        cells :[
          { title : <ConfigIndicator id={podIdx + '-config-validation'} validations={validations} definition={true} />},
          { title : pod.name},
          { title : new Date(pod.createdAt).toLocaleString()},
          { title : <Labels key={'labels' + podIdx} labels={pod.labels} />},
          { title : this.renderStatus(pod.status)}
        ]});
      rows.push({
        parent: rows.length - 1,
        cells: [
          { title : <>Created by {pod.createdBy && pod.createdBy.length > 0
              ? pod.createdBy.map(ref => ref.name + ' (' + ref.kind + ')').join(', ')
              : ''} Istio Init Containers : {pod.istioInitContainers ? pod.istioInitContainers.map(c => `${c.image}`).join(', ') : ''} Istio Containers : {pod.istioContainers ? pod.istioContainers.map(c => `${c.image}`).join(', ') : ''}</>},
        ]
      });
      return;
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
