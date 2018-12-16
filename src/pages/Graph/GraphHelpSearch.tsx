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

export interface GraphHelpSearchProps {
  onClose: () => void;
  className?: string;
}

export default class GraphHelpSearch extends React.Component<GraphHelpSearchProps> {
  headerFormat = (label, { column }) => <Table.Heading className={column.property}>{label}</Table.Heading>;
  cellFormat = (value, { column }) => {
    const props = column.cell.props;
    const className = props ? props.align : '';

    return <Table.Cell className={className}>{value}</Table.Cell>;
  };

  constructor(props: GraphHelpSearchProps) {
    super(props);
  }

  edgeColumns = () => {
    return {
      columns: [
        {
          property: 'c',
          header: {
            label: 'Criteria',
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
            label: 'Criteria',
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

  render() {
    console.log('Render Help!');
    const className = this.props.className ? this.props.className : '';
    return (
      <Draggable>
        <div
          className={`modal-content ${className}`}
          style={{
            width: '600px',
            height: '500px',
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
            <span className="modal-title">Help: Graph Search</span>
          </div>
          <TabContainer id="basic-tabs" defaultActiveKey="examples">
            <div>
              <Nav bsClass="nav nav-tabs nav-tabs-pf">
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
                        { id: 'e0', e: 'product', d: `"name search": app, service or workloads containing  'product'` },
                        { id: 'e1', e: 'app *= product', d: `apps containing 'product'` },
                        {
                          id: 'e2',
                          e: 'app = details and version=v1',
                          d: `apps named 'details' and having version 'v1'`
                        },
                        { id: 'e3', e: '!sc', d: `nodes without a sidecar` },
                        { id: 'e4', e: 'httpin > 0.5', d: `nodes with incoming http rate > 0.5 rps` },
                        { id: 'e5', e: 'tcpout > 1000', d: `nodes with outgoing tcp rates > 1000 bps` },
                        { id: 'e6', e: 'http > 0.5', d: `edges with http rate > 0.5 rps` },
                        {
                          id: 'e7',
                          e: 'rt > 500  (requires response time edge labels)',
                          d: `edges with response time > 500ms`
                        },
                        { id: 'e8', e: 'Hint #1', d: 'Expressions can not combine "and" with "or"' },
                        { id: 'e9', e: 'Hint #2', d: 'Expressions can not combine "and" with a name search' }
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
                        { id: 'nc0', c: 'httpin <op> <val> (requests per sec)' },
                        { id: 'nc1', c: 'httpout <op> <val> (requests per sec)' },
                        { id: 'nc2', c: 'ns | namespace <op> <val>' },
                        { id: 'nc3', c: 'svc | service <op> <val>' },
                        { id: 'nc4', c: 'version <op> <val>' },
                        { id: 'nc5', c: 'tcpin <op> <val> (bytes per sec)' },
                        { id: 'nc6', c: 'tcpout <op> <val> (bytes per sec)' },
                        { id: 'nc7', c: 'wl | workload <op> <val>' },
                        { id: 'nc8', c: 'appnode' },
                        { id: 'nc9', c: 'cb | circuitbreaker' },
                        { id: 'nc10', c: 'outside | outsider' },
                        { id: 'nc11', c: 'sc | sidecar' },
                        { id: 'nc12', c: 'svcnode | servicenode' },
                        { id: 'nc13', c: 'serviceentry' },
                        { id: 'nc14', c: 'unknown' },
                        { id: 'nc15', c: 'unused' },
                        { id: 'nc16', c: 'vs | virtualservice' },
                        { id: 'nc17', c: 'wlnode | workloadnode' }
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
                        { id: 'ec0', c: 'http <op> <val> (requests per sec)' },
                        { id: 'ec1', c: '%err | percenterr <op> <val>' },
                        { id: 'ec2', c: '%traffic | percenttraffic <op> <val>' },
                        { id: 'ec3', c: 'rt | responsetime <op> <val> (millis)' },
                        { id: 'ec4', c: 'tcp <op> <val> (bytes per sec)' },
                        { id: 'ec5', c: 'tcpout <op> <val> (bytes per sec)' },
                        { id: 'ec6', c: 'wl | workload <op> <val>' },
                        { id: 'ec7', c: 'mtls' }
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
                      rows={[
                        { id: 'o0', o: '!', d: `negation, unary expressions only` },
                        { id: 'o1', o: '=', d: `equals` },
                        { id: 'o2', o: '!=', d: `not equals` },
                        { id: 'o3', o: '^=', d: `starts with, strings only` },
                        { id: 'o4', o: '$=', d: `ends with, strings only` },
                        { id: 'o5', o: '*=', d: 'contains, strings only' },
                        { id: 'o6', o: '>', d: `greater than, numbers only` },
                        { id: 'o7', o: '>=', d: `greater than or equals, numbers only` },
                        { id: 'o8', o: '<', d: `less than, numbers only` },
                        { id: 'o9', o: '<=', d: `less than or equals, numbers only` }
                      ]}
                      rowKey="id"
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
