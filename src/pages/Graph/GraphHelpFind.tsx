import * as React from 'react';
import Draggable from 'react-draggable';
import {
  Button,
  Icon,
  Nav,
  NavItem,
  TabContainer,
  TabContent,
  TabPane,
  Table,
  TablePfProvider
} from 'patternfly-react';
import * as resolve from 'table-resolver';

export interface GraphHelpFindProps {
  onClose: () => void;
  className?: string;
}

export default class GraphHelpFind extends React.Component<GraphHelpFindProps> {
  headerFormat = (label, { column }) => <Table.Heading className={column.property}>{label}</Table.Heading>;
  cellFormat = (value, { column }) => {
    const props = column.cell.props;
    const className = props ? props.align : '';

    return <Table.Cell className={className}>{value}</Table.Cell>;
  };

  constructor(props: GraphHelpFindProps) {
    super(props);
  }

  edgeColumns = () => {
    return {
      columns: [
        {
          property: 'c',
          header: {
            label: 'Expression',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat],
            props: {
              align: 'text-left'
            }
          }
        }
      ]
    };
  };

  exampleColumns = () => {
    return {
      columns: [
        {
          property: 'e',
          header: {
            label: 'Expression',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat],
            props: {
              align: 'text-left'
            }
          }
        },
        {
          property: 'd',
          header: {
            label: 'Description',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat],
            props: {
              align: 'text-left'
            }
          }
        }
      ]
    };
  };

  nodeColumns = () => {
    return {
      columns: [
        {
          property: 'c',
          header: {
            label: 'Expression',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat],
            props: {
              align: 'text-left'
            }
          }
        }
      ]
    };
  };

  operatorColumns = () => {
    return {
      columns: [
        {
          property: 'o',
          header: {
            label: 'Operator',
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
          property: 'd',
          header: {
            label: 'Description',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat],
            props: {
              align: 'text-left'
            }
          }
        }
      ]
    };
  };

  tipColumns = () => {
    return {
      columns: [
        {
          property: 't',
          header: {
            label: 'Tip',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat],
            props: {
              align: 'textleft'
            }
          }
        }
      ]
    };
  };

  render() {
    const className = this.props.className ? this.props.className : '';
    return (
      <Draggable>
        <div
          className={`modal-content ${className}`}
          style={{
            width: '600px',
            height: 'auto',
            right: '0',
            top: '10px',
            zIndex: 9999,
            position: 'absolute'
          }}
        >
          <div className="modal-header">
            <Button className="close" bsClass="" onClick={this.props.onClose}>
              <Icon title="Close" type="pf" name="close" />
            </Button>
            <span className="modal-title">Help: Graph Find</span>
          </div>
          <TabContainer id="basic-tabs" defaultActiveKey="examples">
            <div>
              <Nav bsClass="nav nav-tabs nav-tabs-pf" style={{ paddingLeft: '10px' }}>
                <NavItem eventKey="examples">
                  <div>Examples</div>
                </NavItem>
                <NavItem eventKey="nodes">
                  <div>Nodes</div>
                </NavItem>
                <NavItem eventKey="edges">
                  <div>Edges</div>
                </NavItem>
                <NavItem eventKey="operators">
                  <div>Operators</div>
                </NavItem>
                <NavItem eventKey="tips">
                  <div>Tips</div>
                </NavItem>
              </Nav>
              <TabContent>
                <TabPane eventKey="examples">
                  <TablePfProvider
                    striped={true}
                    bordered={true}
                    hover={true}
                    dataTable={true}
                    columns={this.exampleColumns().columns}
                  >
                    <Table.Header headerRows={resolve.headerRows(this.exampleColumns())} />
                    <Table.Body
                      rowKey="id"
                      rows={[
                        {
                          id: 'e0',
                          e: 'prod',
                          d: `shortcut for "name contains prod": app, service, workload contains "prod"`
                        },
                        {
                          id: 'e1',
                          e: 'not prod',
                          d: `shortcut for "name not contains prod": app, service, workload not contains 'prod'`
                        },
                        {
                          id: 'e2',
                          e: 'name = reviews',
                          d: `"find by name": find app label, service name or workload name equal to 'reviews'`
                        },
                        { id: 'e3', e: 'app startswith product', d: `app label starts with 'product'` },
                        {
                          id: 'e4',
                          e: 'app != details and version=v1',
                          d: `app label not equal to 'details' and having version equal to 'v1'`
                        },
                        { id: 'e5', e: '!sc', d: `nodes without a sidecar` },
                        { id: 'e6', e: 'httpin > 0.5', d: `nodes with incoming http rate > 0.5 rps` },
                        { id: 'e7', e: 'tcpout >= 1000', d: `nodes with outgoing tcp rates >= 1000 bps` },
                        { id: 'e8', e: 'http > 0.5', d: `edges with http rate > 0.5 rps` },
                        {
                          id: 'e9',
                          e: 'rt > 500',
                          d: `edges with response time > 500ms. (requires response time edge labels)`
                        },
                        {
                          id: 'e10',
                          e: '%traffic >= 50.0',
                          d: `edges with >= 50% of the outgoing http request traffic of the parent`
                        }
                      ]}
                    />
                  </TablePfProvider>
                </TabPane>
                <TabPane eventKey="nodes" mountOnEnter={true} unmountOnExit={true}>
                  <TablePfProvider
                    striped={true}
                    bordered={true}
                    hover={true}
                    dataTable={true}
                    columns={this.nodeColumns().columns}
                  >
                    <Table.Header headerRows={resolve.headerRows(this.nodeColumns())} />
                    <Table.Body
                      rowKey="id"
                      rows={[
                        { id: 'nc0', c: 'httpin <op> <number> (requests per sec)' },
                        { id: 'nc1', c: 'httpout <op> <number> (requests per sec)' },
                        { id: 'nc2', c: 'ns | namespace <op> <namespaceName>' },
                        { id: 'nc3', c: 'svc | service <op> <serviceName>' },
                        { id: 'nc4', c: 'version <op> <string>' },
                        { id: 'nc5', c: 'tcpin <op> <number> (bytes per sec)' },
                        { id: 'nc6', c: 'tcpout <op> <number> (bytes per sec)' },
                        { id: 'nc7', c: 'wl | workload <op> <workloadName>' },
                        { id: 'nc8', c: '[is] appnode' },
                        { id: 'nc9', c: '[has] cb | circuitbreaker' },
                        { id: 'nc10', c: '[is] outside | outsider' },
                        { id: 'nc11', c: '[has] sc | sidecar' },
                        { id: 'nc12', c: '[is] svcnode | servicenode' },
                        { id: 'nc13', c: '[is] se | serviceentry' },
                        { id: 'nc14', c: '[is] unknown' },
                        { id: 'nc15', c: '[is] unused' },
                        { id: 'nc16', c: '[has] vs | virtualservice' },
                        { id: 'nc17', c: '[is] wlnode | workloadnode' }
                      ]}
                    />
                  </TablePfProvider>
                </TabPane>
                <TabPane eventKey="edges" mountOnEnter={true} unmountOnExit={true}>
                  <TablePfProvider
                    striped={true}
                    bordered={true}
                    hover={true}
                    dataTable={true}
                    columns={this.edgeColumns().columns}
                  >
                    <Table.Header headerRows={resolve.headerRows(this.edgeColumns())} />
                    <Table.Body
                      rowKey="id"
                      rows={[
                        { id: 'ec0', c: 'http <op> <number> (requests per sec)' },
                        { id: 'ec1', c: '%err | percenterr <op> <number> <0..100>' },
                        { id: 'ec2', c: '%traffic | percenttraffic <op> <number> (0..100)' },
                        { id: 'ec3', c: 'rt | responsetime <op> <number> (millis)' },
                        { id: 'ec4', c: 'tcp <op> <number> (bytes per sec)' },
                        { id: 'ec5', c: '[has] mtls' }
                      ]}
                    />
                  </TablePfProvider>
                </TabPane>
                <TabPane eventKey="operators" mountOnEnter={true} unmountOnExit={true}>
                  <TablePfProvider
                    striped={true}
                    bordered={true}
                    hover={true}
                    dataTable={true}
                    columns={this.operatorColumns().columns}
                  >
                    <Table.Header headerRows={resolve.headerRows(this.operatorColumns())} />
                    <Table.Body
                      rowKey="id"
                      rows={[
                        { id: 'o0', o: '! | not <unary expression>', d: `negation` },
                        { id: 'o1', o: '=', d: `equals` },
                        { id: 'o2', o: '!=', d: `not equals` },
                        { id: 'o3', o: 'endswith | ^=', d: `ends with, strings only` },
                        { id: 'o4', o: '!endswith | !^=', d: `not ends with, strings only` },
                        { id: 'o5', o: 'startswith | $=', d: `starts with, strings only` },
                        { id: 'o6', o: '!startswith | !$=', d: `not starts with, strings only` },
                        { id: 'o7', o: 'contains | *=', d: 'contains, strings only' },
                        { id: 'o8', o: '!contains | !*=', d: 'not contains, strings only' },
                        { id: 'o9', o: '>', d: `greater than` },
                        { id: 'o10', o: '>=', d: `greater than or equals` },
                        { id: 'o11', o: '<', d: `less than` },
                        { id: 'o12', o: '<=', d: `less than or equals` }
                      ]}
                    />
                  </TablePfProvider>
                </TabPane>
                <TabPane eventKey="tips" mountOnEnter={true} unmountOnExit={true}>
                  <TablePfProvider
                    striped={true}
                    bordered={true}
                    hover={true}
                    dataTable={true}
                    columns={this.tipColumns().columns}
                  >
                    <Table.Header headerRows={resolve.headerRows(this.tipColumns())} />
                    <Table.Body
                      rowKey="id"
                      rows={[
                        { id: 't0', t: 'Expressions can not combine "and" with "or".' },
                        { id: 't1', t: 'Find by name expands to an "or" expression internally.' },
                        { id: 't2', t: 'Not Find by name expands to an "and" expression internally.' },
                        {
                          id: 't3',
                          t: 'Numeric equality (=) is exact match. Include leading 0 and digits of precision.'
                        },
                        { id: 't4', t: 'Numerics use "." decimal notation.' },
                        { id: 't5', t: 'Percentages use 1 digit of precision, Rates use 2 digits of precision.' },
                        {
                          id: 't6',
                          t: 'responsetime expressions only work when Response Time edge labels are enabled.'
                        }
                      ]}
                    />
                  </TablePfProvider>
                </TabPane>
              </TabContent>
            </div>
          </TabContainer>
        </div>
      </Draggable>
    );
  }
}
