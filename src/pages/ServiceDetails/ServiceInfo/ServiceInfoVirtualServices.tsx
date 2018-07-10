import * as React from 'react';
import { Col, Icon, OverlayTrigger, Popover, Row, Table } from 'patternfly-react';
import * as resolve from 'table-resolver';
import { Link } from 'react-router-dom';
import {
  EditorLink,
  globalChecks,
  ObjectValidation,
  severityToColor,
  severityToIconName,
  validationToSeverity,
  VirtualService
} from '../../../types/ServiceInfo';
import './ServiceInfoVirtualServices.css';
import LocalTime from '../../../components/Time/LocalTime';

interface ServiceInfoVirtualServicesProps extends EditorLink {
  virtualServices?: VirtualService[];
  validations: { [key: string]: ObjectValidation };
}

class ServiceInfoVirtualServices extends React.Component<ServiceInfoVirtualServicesProps> {
  headerFormat = (label, { column }) => <Table.Heading className={column.property}>{label}</Table.Heading>;
  cellFormat = (value, { column }) => {
    const props = column.cell.props;
    const className = props ? props.align : '';

    return <Table.Cell className={className}>{value}</Table.Cell>;
  };

  constructor(props: ServiceInfoVirtualServicesProps) {
    super(props);
  }

  columns() {
    return {
      columns: [
        {
          property: 'status',
          header: {
            label: 'Status',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat],
            props: {
              align: 'text-center'
            }
          }
        },
        {
          property: 'name',
          header: {
            label: 'Name',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat]
          }
        },
        {
          property: 'createdAt',
          header: {
            label: 'Created at',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat]
          }
        },
        {
          property: 'resourceVersion',
          header: {
            label: 'Resource version',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat]
          }
        }
      ]
    };
  }

  validation(virtualService: VirtualService): ObjectValidation {
    return this.props.validations[virtualService.name];
  }

  globalStatus(vs: VirtualService, idx: number) {
    let validation = this.validation(vs);
    let checks = globalChecks(validation);
    let severity = validationToSeverity(validation);
    let iconName = severityToIconName(severity);
    let color = severityToColor(severity);
    let message = checks.map(check => check.message).join(',');
    console.log(color);

    if (!message.length) {
      if (validation && !validation.valid) {
        message = 'Not all checks passed!';
      }
    }

    if (message.length) {
      return (
        <OverlayTrigger
          placement={'right'}
          overlay={this.infotipContent(message, idx)}
          trigger={['hover', 'focus']}
          rootClose={false}
        >
          <Icon type="pf" name={iconName} />
        </OverlayTrigger>
      );
    } else {
      return '';
    }
  }

  infotipContent(message: string, idx: number) {
    return <Popover id={idx + '-weight-tooltip'}>{message}</Popover>;
  }

  showYaml(virtualService: VirtualService) {
    return (
      <Row>
        <Col xs={4}>{virtualService.resourceVersion}</Col>
        <Col xs={8} className="text-right">
          <Link to={this.props.editorLink + '?virtualservice=' + virtualService.name}>View YAML</Link>
        </Col>
      </Row>
    );
  }

  rows() {
    return (this.props.virtualServices || []).map((virtualService, vsIdx) => ({
      id: vsIdx,
      status: this.globalStatus(virtualService, vsIdx),
      name: virtualService.name,
      createdAt: <LocalTime time={virtualService.createdAt} />,
      resourceVersion: this.showYaml(virtualService)
    }));
  }

  renderTable() {
    return (
      <Table.PfProvider columns={this.columns().columns} striped={true} bordered={true} hover={true} dataTable={true}>
        <Table.Header headerRows={resolve.headerRows(this.columns())} />
        <Table.Body rows={this.rows()} rowKey="id" />
      </Table.PfProvider>
    );
  }

  render() {
    return (
      <Row className="card-pf-body">
        <Col xs={12}>{this.renderTable()}</Col>
      </Row>
    );
  }
}

export default ServiceInfoVirtualServices;
