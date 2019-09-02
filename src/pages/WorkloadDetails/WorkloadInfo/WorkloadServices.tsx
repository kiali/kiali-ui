import * as React from 'react';
import { Port, Service } from '../../../types/IstioObjects';
import { Table, TableHeader, TableBody, TableVariant, classNames, textCenter } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import LocalTime from '../../../components/Time/LocalTime';
import Labels from '../../../components/Label/Labels';
import { Card, CardBody, Grid, GridItem } from '@patternfly/react-core';

type WorkloadServicesProps = {
  services: Service[];
  namespace: string;
};

type WorkloadServicesState = {};

class WorkloadServices extends React.Component<WorkloadServicesProps, WorkloadServicesState> {
  constructor(props: WorkloadServicesProps) {
    super(props);
    this.state = {};
  }

  columns() {
    return [
      {title: 'Name', transforms: [textCenter], columnTransforms: [classNames('pf-m-width-10')], cellTransforms: [textCenter]},
      {title: 'Created at', transforms: [textCenter], columnTransforms: [classNames('pf-m-width-10')], cellTransforms: [textCenter]},
      {title: 'Type', transforms: [textCenter], columnTransforms: [classNames('pf-m-width-10')], cellTransforms: [textCenter]},
      {title: 'Labels', transforms: [textCenter],
        columnTransforms: [classNames('pf-m-width-30')],
        cellTransforms: [textCenter]},
      {title: 'Resource Version', transforms: [textCenter], columnTransforms: [classNames('pf-m-width-20')], cellTransforms: [textCenter]},
      {title: 'Ip', transforms: [textCenter], columnTransforms: [classNames('pf-m-width-20')], cellTransforms: [textCenter]},
      {title: 'Ports', transforms: [textCenter], columnTransforms: [classNames('pf-m-width-10')], cellTransforms: [textCenter]}
    ];
  }

  overviewLink(service: Service) {
    return (
      <Link
        to={`/namespaces/${this.props.namespace}/services/${service.name}`}
        key={'WorkloadServiceItem_' + this.props.namespace + '_' + service.name}
      >
        {service.name}
      </Link>
    );
  }

  renderPorts(ports: Port[]) {
    return (
      <ul style={{ listStyleType: 'none' }}>
        {(ports || []).map((port, i) => (
          <li key={'port_' + i}>
            {port.protocol} {port.name} ({port.port})
          </li>
        ))}
      </ul>
    );
  }

  rows() {
    return (this.props.services || []).map((service, vsIdx) => {
      return {
        cells: [
          { title: this.overviewLink(service) },
          { title: <LocalTime time={service.createdAt}/> },
          { title: service.type },
          { title: <Labels key={'pod_' + vsIdx} labels={service.labels}/> },
          { title: service.resourceVersion },
          { title: service.ip },
          { title: this.renderPorts(service.ports || []) }
        ]
      }
    });
  }
  render() {
    return (
      <Grid>
        <GridItem span={12}>
          <Card>
            <CardBody>
              <Table variant={TableVariant.compact} aria-label={"list_services"} cells={this.columns()} rows={this.rows()}>
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

export default WorkloadServices;
