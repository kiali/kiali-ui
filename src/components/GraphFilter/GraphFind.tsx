import * as React from 'react';
import { Button, Form, FormControl, FormGroup, Icon, InputGroup } from 'patternfly-react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { bindActionCreators } from 'redux';

import { KialiAppState } from '../../store/Store';
import { GraphFilterActions } from '../../actions/GraphFilterActions';

import { KialiAppAction } from '../../actions/KialiAppAction';
import * as MessageCenterUtils from '../../utils/MessageCenter';
import GraphHelpFind from '../../pages/Graph/GraphHelpFind';

type ReduxProps = {
  showFindHelp: boolean;

  toggleFindHelp: () => void;
};

type GraphFindProps = ReduxProps & {
  cytoscapeGraphRef: any;
};

type ParsedExpression = {
  target: 'node' | 'edge';
  selector: string;
};

export class GraphFind extends React.PureComponent<GraphFindProps> {
  static contextTypes = {
    router: () => null
  };

  private findInputRef;
  private findValue: string;

  constructor(props: GraphFindProps) {
    super(props);

    if (props.showFindHelp) {
      props.toggleFindHelp();
    }
    this.findValue = '';
    this.findInputRef = React.createRef();
  }

  render() {
    return (
      <>
        <FormGroup>
          <Form onSubmit={this.handleFindSubmit} inline="true">
            <InputGroup>
              <FormControl
                type="text"
                style={{ width: '18em' }}
                inputRef={ref => {
                  this.findInputRef = ref;
                }}
                onChange={this.updateFind}
                placeholder="Find..."
              />
              <InputGroup.Button>
                <Button onClick={this.clearFind}>
                  <Icon name="close" type="fa" />
                </Button>
              </InputGroup.Button>
            </InputGroup>
            <Button bsStyle="link" style={{ paddingLeft: '6px' }} onClick={this.toggleFindHelp}>
              <Icon name="help" type="pf" title="Help Find..." />
            </Button>
          </Form>
        </FormGroup>
        {this.props.showFindHelp && <GraphHelpFind onClose={this.toggleFindHelp} />}{' '}
      </>
    );
  }

  private toggleFindHelp = () => {
    console.log('toggle from ' + this.props.toggleFindHelp);
    this.props.toggleFindHelp();
  };

  private updateFind = event => {
    this.findValue = event.target.value;
  };

  private clearFind = () => {
    this.findValue = '';
    // note, we don't use findInputRef.current because <FormControl> deals with refs differently than <input>
    this.findInputRef.value = '';
    this.handleFind();
  };

  private handleFindSubmit = event => {
    event.preventDefault();
    this.handleFind();
  };

  private handleFind = () => {
    const cy = this.getCy();
    if (cy === null) {
      console.debug('Can not handle find, cy is unavailable.');
      return;
    }
    // unhighlight old find
    cy.elements().removeClass('find');

    const selector = this.parseFindValue(this.findValue);
    if (selector) {
      cy.elements(selector).addClass('find');
    }

    this.forceUpdate(); // to enable/disable clear button
  };

  private parseFindValue = (val: string): string | undefined => {
    let validVal = this.prepareFindValue(val);
    if (!validVal) {
      return undefined;
    }
    validVal = validVal.replace(/ and /gi, ' AND ');
    validVal = validVal.replace(/ or /gi, ' OR ');
    const conjunctive = validVal.includes(' AND ');
    const disjunctive = validVal.includes(' OR ');
    if (conjunctive && disjunctive) {
      MessageCenterUtils.add(`Find value can not contain both 'and' and 'or'.`);
      return undefined;
    }
    const separator = disjunctive ? ',' : '';
    const expressions = disjunctive ? validVal.split(' OR ') : validVal.split(' AND ');
    let selector;

    for (const expression of expressions) {
      console.log('EXPRESSION=' + expression);
      const parsedExpression = this.parseFindExpression(expression, conjunctive);
      if (!parsedExpression) {
        return undefined;
      }
      console.log('Parsed EXPRESSION=' + parsedExpression);
      selector = this.appendSelector(selector, parsedExpression, separator);
      if (!selector) {
        return undefined;
      }
      console.log('Selector=' + selector);
    }

    return selector;
  };

  private prepareFindValue = (val: string): string => {
    // remove unnecessary mnemonic qualifiers on unary operators (e.g. 'has cb' -> 'cb').
    val = ' ' + val;
    val = val.replace(' is ', ' ');
    val = val.replace(' has ', ' ');

    // replace string operators
    val = val.replace(' contains ', ' *= ');
    val = val.replace(' startswith ', ' $= ');
    val = val.replace(' endswith ', ' ^= ');
    val = val.replace(' not ', ' !');

    return val.trim();
  };

  private parseFindExpression = (expression: string, conjunctive: boolean): ParsedExpression | undefined => {
    let op;
    if (expression.includes('!=')) {
      op = '!=';
    } else if (expression.includes('>=')) {
      op = '>=';
    } else if (expression.includes('<=')) {
      op = '<=';
    } else if (expression.includes('*=')) {
      op = '*='; // substring
    } else if (expression.includes('$=')) {
      op = '$='; // starts with
    } else if (expression.includes('^=')) {
      op = '^='; // ends with
    } else if (expression.includes('=')) {
      op = '=';
    } else if (expression.includes('>')) {
      op = '>';
    } else if (expression.includes('<')) {
      op = '<';
    } else if (expression.includes('!')) {
      op = '!';
    }
    if (!op) {
      if (expression.split(' ').length > 1) {
        MessageCenterUtils.add('Invalid find expression or operator: [' + expression + '].');
        return undefined;
      }

      const unaryExpression = this.parseUnaryFindExpression(expression.trim(), false);
      if (unaryExpression) {
        return unaryExpression;
      }

      // handle special 'find by name'substring unary
      op = '*=';
      expression = 'name *= ' + expression;
    }

    const tokens = expression.split(op);
    if (op === '!') {
      const unaryExpression = this.parseUnaryFindExpression(tokens[1], true);
      if (unaryExpression) {
        return unaryExpression;
      }

      MessageCenterUtils.add('Invalid find value: [' + expression + '].');
      return undefined;
    }

    const field = tokens[0].trim();
    const val = tokens[1].trim();

    switch (field.toLowerCase()) {
      // node find
      case 'app':
        return { target: 'node', selector: '[app ' + op + ' "' + val + '"]' };
      case 'httpin': {
        const s = this.getNumericSelector('rate', op, val, 1.0, expression);
        return s ? { target: 'edge', selector: s } : undefined;
      }
      case 'httpout': {
        const s = this.getNumericSelector('rateOut', op, val, 1.0, expression);
        return s ? { target: 'edge', selector: s } : undefined;
      }
      case 'name':
        if (conjunctive) {
          MessageCenterUtils.add('Find values do not allow AND expressions with "find by name".');
          return undefined;
        }
        const wl = '[workload ' + op + ' "' + val + '"]';
        const app = ',[app ' + op + ' "' + val + '"]';
        const svc = ',[service ' + op + ' "' + val + '"]';
        return { target: 'node', selector: wl + app + svc };
      case 'ns':
      case 'namespace':
        return { target: 'node', selector: '[namespace ' + op + ' "' + val + '"]' };
      case 'svc':
      case 'service':
        return { target: 'node', selector: '[service ' + op + ' "' + val + '"]' };
      case 'tcpin': {
        const s = this.getNumericSelector('rateTcpSent', op, val, 1.0, expression);
        return s ? { target: 'edge', selector: s } : undefined;
      }
      case 'tcpout': {
        const s = this.getNumericSelector('rateTcpSentOut', op, val, 1.0, expression);
        return s ? { target: 'edge', selector: s } : undefined;
      }
      case 'version':
        return { target: 'node', selector: '[version ' + op + ' "' + val + '"]' };
      case 'wl':
      case 'workload':
        return { target: 'node', selector: '[workload ' + op + ' "' + val + '"]' };
      //
      // edges..
      //
      case 'http': {
        const s = this.getNumericSelector('rate', op, val, 1.0, expression);
        return s ? { target: 'edge', selector: s } : undefined;
      }
      case 'percenterr':
      case 'percenterror':
      case '%error':
      case '%err': {
        const s = this.getNumericSelector('percentErr', op, val, 1.0, expression);
        return s ? { target: 'edge', selector: s } : undefined;
      }
      case 'percenttraffic':
      case '%traffic': {
        const s = this.getNumericSelector('percentRate', op, val, 1.0, expression);
        return s ? { target: 'edge', selector: s } : undefined;
      }
      case 'rt':
      case 'responsetime': {
        const s = this.getNumericSelector('responseTime', op, val, 0.001, expression);
        return s ? { target: 'edge', selector: s } : undefined;
      }
      case 'tcp': {
        const s = this.getNumericSelector('rateTcpSent', op, val, 1.0, expression);
        return s ? { target: 'edge', selector: s } : undefined;
      }
      default:
        MessageCenterUtils.add('Invalid find value: [' + expression + '].');
        return undefined;
    }
  };

  private getNumericSelector(
    field: string,
    op: string,
    val: any,
    multiplier: number,
    expression: string
  ): string | undefined {
    if (isNaN(val)) {
      MessageCenterUtils.add(`Invalid find value: [${expression}]. Expected a numeric value (use . for decimals)`);
      return undefined;
    }
    switch (op) {
      case '>':
      case '<':
      case '>=':
      case '<=':
      case '=':
      case '!=':
        break;
      default:
        MessageCenterUtils.add(`Invalid operator for numeric condition: [${expression}].`);
        return undefined;
    }

    const numVal = Number(val) * multiplier;
    switch (op) {
      case '=':
        return numVal === 0 ? `[^${field}]` : `[${field} ${op} "${val}"]`;
      case '!=':
        return `[${field} ${op} "${val}"]`;
      default:
        return `[${field} ${op} ${val}]`;
    }
  }

  private parseUnaryFindExpression = (field: string, isNegation): ParsedExpression | undefined => {
    switch (field.toLowerCase()) {
      // node find
      case 'appnode':
        return { target: 'node', selector: isNegation ? '[nodeType != "app"]' : '[nodeType = "app"]' };
      case 'cb':
      case 'circuitbreaker':
        return { target: 'node', selector: isNegation ? '[^hasCB]' : '[hasCB]' };
      case 'dead':
        return { target: 'node', selector: isNegation ? '[^isDead]' : '[isDead]' };
      case 'inaccessible':
        return { target: 'node', selector: isNegation ? '[^isInaccessible]' : '[isInaccessible]' };
      case 'outside':
      case 'outsider':
        return { target: 'node', selector: isNegation ? '[^isOutside]' : '[isOutside]' };
      case 'se':
      case 'serviceentry':
        return { target: 'node', selector: isNegation ? '[^isServiceEntry]' : '[isServiceEntry]' };
      case 'sc':
      case 'sidecar':
        return { target: 'node', selector: isNegation ? '[hasMissingSC]' : '[^hasMissingSC]' };
      case 'svcnode':
      case 'servicenode':
        return { target: 'node', selector: isNegation ? '[nodeType != "service"]' : '[nodeType = "service"]' };
      case 'trafficsource':
      case 'root':
        return { target: 'node', selector: isNegation ? '[^isRoot]' : '[isRoot]' };
      case 'unknown':
        return { target: 'node', selector: isNegation ? '[nodeType != "unknown"]' : '[nodeType = "unknown"]' };
      case 'unused':
        return { target: 'node', selector: isNegation ? '[^isUnused]' : '[isUnused]' };
      case 'vs':
      case 'virtualservice':
        return { target: 'node', selector: isNegation ? '[^hasVS]' : '[hasVS]' };
      case 'wlnode':
      case 'workloadnode':
        return { target: 'node', selector: isNegation ? '[nodeType != "workload"]' : '[nodeType = "workload"]' };
      // edge find
      case 'mtls':
        return { target: 'edge', selector: isNegation ? '[^isMTLS]' : '[isMTLS]' };
      default:
        return undefined;
    }
  };

  private appendSelector = (
    selector: string,
    parsedExpression: ParsedExpression,
    separator: string
  ): string | undefined => {
    if (!selector) {
      return parsedExpression.target + parsedExpression.selector;
    }
    if (!selector.startsWith(parsedExpression.target)) {
      MessageCenterUtils.add('Find value can not mix node and edge criteria.');
      return undefined;
    }
    return selector + separator + parsedExpression.selector;
  };

  private getCy = (): any | null => {
    if (this.props.cytoscapeGraphRef.current) {
      return this.props.cytoscapeGraphRef.current.getCy();
    }
    return null;
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  showFindHelp: state.graph.filterState.showFindHelp
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    toggleFindHelp: bindActionCreators(GraphFilterActions.toggleFindHelp, dispatch)
  };
};

const GraphFindContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphFind);

export default GraphFindContainer;
