import * as React from 'react';
import Draggable from 'react-draggable';
import { Button, Tabs, Tab } from '@patternfly/react-core';
import { ICell, Table, TableBody, TableHeader, TableVariant, cellWidth } from '@patternfly/react-table';
import { CloseIcon } from '@patternfly/react-icons';
import { style } from 'typestyle';

export interface GraphHelpFindProps {
  onClose: () => void;
  className?: string;
}

interface GraphHelpFindState {
  tabIndex: number;
}

export default class GraphHelpFind extends React.Component<GraphHelpFindProps, GraphHelpFindState> {
  constructor(props: GraphHelpFindProps) {
    super(props);
    this.state = { tabIndex: 2 };
  }

  private handleTabClick = (_, index) => {
    console.log(`Change to tab [${index}]`);
    this.setState({
      tabIndex: index
    });
  };

  /*
  headerFormat = (label, { column }) => <Table.Heading className={column.property}>{label}</Table.Heading>;
  cellFormat = (value, { column }) => {
    const props = column.cell.props;
    const className = props ? props.align : '';

    return <Table.Cell className={className}>{value}</Table.Cell>;
  };
  */

  private edgeColumns = (): ICell[] => {
    return [{ title: 'Expression' }, { title: 'Notes' }];
  };
  private edgeRows = (): string[][] => {
    return [
      ['grpc <op> <number>', 'unit: requests per second'],
      ['%grpcerr <op> <number>', 'range: [0..100]'],
      ['%grpctraffic <op> <number>', 'range: [0..100]'],
      ['http <op> <number>', 'unit: requests per second'],
      ['%httperr <op> <number>', 'range: [0..100]'],
      ['%httptraffic <op> <number>', 'range: [0..100]'],
      ['protocol <op> <protocol>', 'grpc, http, tcp, etc..'],
      ['responsetime <op> <number>', `unit: millis, will auto-enable 'response time' edge labels`],
      ['tcp <op> <number>', 'unit: requests per second'],
      ['mtls', `will auto-enable 'security' display option`],
      ['traffic', 'any traffic for any protocol']
    ];
  };

  private exampleColumns = (): ICell[] => {
    return [{ title: 'Expression' }, { title: 'Description' }];
  };
  private exampleRows = (): string[][] => {
    return [
      ['name = reviews', `"by name": nodes with app label, service name or workload name equal to 'reviews'`],
      ['name not contains rev', `"by name": nodes with app label, service name and workload name not containing 'rev'`],
      ['app startswith product', `nodes with app label starting with 'product'`],
      ['app != details and version=v1', `nodes with app label not equal to 'details' and with version equal to 'v1'`],
      ['!sc', `nodes without a sidecar`],
      ['httpin > 0.5', `nodes with incoming http rate > 0.5 rps`],
      ['tcpout >= 1000', `nodes with outgoing tcp rates >= 1000 bps`],
      ['!traffic', 'edges with no traffic'],
      ['http > 0.5', `edges with http rate > 0.5 rps`],
      ['rt > 500', `edges with response time > 500ms. (requires response time edge labels)`],
      ['%httptraffic >= 50.0', `edges with >= 50% of the outgoing http request traffic of the parent`]
    ];
  };

  private nodeColumns = (): ICell[] => {
    return [{ title: 'Expression' }, { title: 'Notes' }];
  };
  private nodeRows = (): string[][] => {
    return [
      ['grpcin <op> <number>', 'unit: requests per second'],
      ['grpcout <op> <number>', 'unit: requests per second'],
      ['httpin <op> <number>', 'unit: requests per second'],
      ['httpout <op> <number>', 'unit: requests per second'],
      ['name <op> <string>', 'tests against app label, service name and workload name'],
      ['namespace <op> <namespaceName>'],
      ['node <op> <nodeType>', 'nodeType: app | service | workload | unknown'],
      ['service <op> <serviceName>'],
      ['version <op> <string>'],
      ['tcpin <op> <number>', 'unit: bytes per second'],
      ['tcpout <op> <number>', 'unit: bytes per second'],
      ['workload <op> <workloadName>'],
      ['circuitbreaker'],
      ['outside', 'is outside of requested namespaces'],
      ['sidecar'],
      ['serviceentry'],
      ['trafficsource', `has only outgoing edges`],
      ['unused', `will auto-enable 'unused nodes' display option`],
      ['virtualservice']
    ];
  };

  private noteColumns = (): ICell[] => {
    return [{ title: 'Usage Note', transforms: [cellWidth(10) as any], props: { style: { align: 'text-left' } } }];
  };
  private noteRows = (): string[][] => {
    return [
      ['Expressions can not combine "AND" with "OR".'],
      ['Parentheses are not supported (or needed).'],
      ['The "name" operand expands internally to an "OR" expression (an "AND" when negated).'],
      ['Expressions can not combine node and edge criteria.'],
      ['Use "<operand> = NaN" to test for no activity. Use "!= NaN" for any activity. (e.g. httpout = NaN)'],
      [`Unary operands may optionally be prefixed with "is" or "has". (i.e. "has mtls")`],
      ['Abbrevations: namespace|ns, service|svc, workload|wl (e.g. is wlnode)'],
      ['Abbrevations: circuitbreaker|cb, responsetime|rt, serviceentry->se, sidecar|sc, virtualservice|vs'],
      ['Hiding nodes will automatically hide connected edges.'],
      ['Hiding edges will automatically hide nodes left with no visible edges.']
    ];
  };

  private operatorColumns = (): ICell[] => {
    return [{ title: 'Operator' }, { title: 'Description' }];
  };
  private operatorRows = (): string[][] => {
    return [
      ['! | not <unary expression>', `negation`],
      ['=', `equals`],
      ['!=', `not equals`],
      ['endswith | $=', `ends with, strings only`],
      ['!endswith | !$=', `not ends with, strings only`],
      ['startswith | ^=', `starts with, strings only`],
      ['!startswith | !^=', `not starts with, strings only`],
      ['contains | *=', 'contains, strings only'],
      ['!contains | !*=', 'not contains, strings only'],
      ['>', `greater than`],
      ['>=', `greater than or equals`],
      ['<', `less than`],
      ['<=', `less than or equals`]
    ];
  };

  render() {
    console.log('Render');
    const className = this.props.className ? this.props.className : '';
    const width = '600px';
    const maxWidth = '602px';
    const contentWidth = 'calc(100vw - 50px - var(--pf-c-page__sidebar--md--Width))'; // 50px prevents full coverage
    const contentStyle = style({
      width: contentWidth,
      maxWidth: maxWidth,
      height: '550px',
      right: '0',
      top: '10px',
      zIndex: 9999,
      position: 'absolute',
      overflow: 'hidden',
      overflowX: 'auto',
      overflowY: 'auto'
    });
    const headerStyle = style({
      width: width
    });
    const bodyStyle = style({
      width: width
    });
    const prefaceStyle = style({
      width: '100%',
      height: '77px',
      padding: '10px',
      resize: 'none',
      color: '#fff',
      backgroundColor: '#003145'
    });
    const preface =
      'You can use the Find and Hide fields to highlight or hide graph edges and nodes. Each field accepts ' +
      'expressions using the language described below. Hide takes precedence when using Find and Hide ' +
      'together. Uncheck the "Compress Hidden" display option for hidden elements to retain their space.';

    console.log('Render 2');
    return (
      <Draggable handle="#helpheader" bounds="#root">
        <div className={`modal-content ${className} ${contentStyle}`}>
          <div id="helpheader" className={`modal-header ${headerStyle}`}>
            <Button className="close" onClick={this.props.onClose}>
              <CloseIcon />
            </Button>
            <span className="modal-title">Help: Graph Find/Hide</span>
          </div>
          <div className={`modal-body ${bodyStyle}`}>
            <textarea className={`${prefaceStyle}`} readOnly={true} value={preface} />
            <Tabs
              id="graph_find_help_tabs"
              activeKey={this.state.tabIndex}
              onSelect={this.handleTabClick}
              mountOnEnter={true}
              unmountOnExit={true}
            >
              <Tab eventKey={0} title="Notes" style={{ paddingLeft: '10px' }}>
                <Table header={<></>} variant={TableVariant.compact} cells={this.noteColumns()} rows={this.noteRows()}>
                  <TableHeader />
                  <TableBody />
                </Table>
              </Tab>
              <Tab eventKey={1} title="Operators">
                <Table
                  header={<></>}
                  variant={TableVariant.compact}
                  cells={this.operatorColumns()}
                  rows={this.operatorRows()}
                >
                  <TableHeader />
                  <TableBody />
                </Table>
              </Tab>
              <Tab eventKey={2} title="Nodes">
                <Table header={<></>} variant={TableVariant.compact} cells={this.nodeColumns()} rows={this.nodeRows()}>
                  <TableHeader />
                  <TableBody />
                </Table>
              </Tab>
              <Tab eventKey={3} title="Edges">
                <Table header={<></>} variant={TableVariant.compact} cells={this.edgeColumns()} rows={this.edgeRows()}>
                  <TableHeader />
                  <TableBody />
                </Table>
              </Tab>
              <Tab eventKey={4} title="Examples">
                <Table
                  header={<></>}
                  variant={TableVariant.compact}
                  cells={this.exampleColumns()}
                  rows={this.exampleRows()}
                >
                  <TableHeader />
                  <TableBody />
                </Table>
              </Tab>
            </Tabs>
          </div>
        </div>
      </Draggable>
    );
  }
}
