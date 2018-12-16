import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { Button, Form, FormGroup, Icon, Toolbar } from 'patternfly-react';
import { style } from 'typestyle';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { bindActionCreators } from 'redux';

import { KialiAppState } from '../../store/Store';
import { graphTypeSelector, edgeLabelModeSelector, activeNamespacesSelector } from '../../store/Selectors';
import { GraphFilterActions } from '../../actions/GraphFilterActions';

import { GraphType, NodeParamsType } from '../../types/Graph';
import { EdgeLabelMode } from '../../types/GraphFilter';

import GraphRefreshContainer from './GraphRefresh';
import GraphSettingsContainer from './GraphSettings';
import { HistoryManager, URLParams } from '../../app/History';
import { ListPagesHelper } from '../../components/ListPage/ListPagesHelper';
import { ToolbarDropdown } from '../ToolbarDropdown/ToolbarDropdown';
import Namespace, { namespacesToString, namespacesFromString } from '../../types/Namespace';
import { NamespaceActions } from '../../actions/NamespaceAction';
import { GraphActions } from '../../actions/GraphActions';
import { KialiAppAction } from '../../actions/KialiAppAction';
import * as MessageCenterUtils from '../../utils/MessageCenter';
import GraphHelpSearch from '../../pages/Graph/GraphHelpSearch';

type ReduxProps = {
  activeNamespaces: Namespace[];
  edgeLabelMode: EdgeLabelMode;
  graphType: GraphType;
  node?: NodeParamsType;
  search: string;
  showSearchHelp: boolean;

  setActiveNamespaces: (activeNamespaces: Namespace[]) => void;
  setEdgeLabelMode: (edgeLabelMode: EdgeLabelMode) => void;
  setGraphType: (graphType: GraphType) => void;
  setNode: (node?: NodeParamsType) => void;
  setSearch: (search: string) => void;
  toggleSearchHelp: () => void;
};

type GraphFilterProps = ReduxProps & {
  cytoscapeGraphRef: any;
  disabled: boolean;
  onRefresh: () => void;
};

type ParsedExpression = {
  target: 'node' | 'edge';
  selector: string;
};

const zeroPaddingLeft = style({
  marginLeft: '20px',
  paddingLeft: '0px'
});

const namespaceStyle = style({
  marginLeft: '-40px',
  marginRight: '5px'
});

export class GraphFilter extends React.PureComponent<GraphFilterProps> {
  /**
   *  Key-value pair object representation of GraphType enum.  Values are human-readable versions of enum keys.
   *
   *  Example:  GraphType => {'APP': 'App', 'VERSIONED_APP': 'VersionedApp'}
   */
  static readonly GRAPH_TYPES = _.mapValues(GraphType, val => _.capitalize(_.startCase(val)));

  /**
   *  Key-value pair object representation of EdgeLabelMode
   *
   *  Example:  EdgeLabelMode =>{'TRAFFIC_RATE_PER_SECOND': 'TrafficRatePerSecond'}
   */
  static readonly EDGE_LABEL_MODES = _.mapValues(_.omitBy(EdgeLabelMode, _.isFunction), val =>
    _.capitalize(_.startCase(val as EdgeLabelMode))
  );

  static contextTypes = {
    router: () => null
  };

  private searchInputRef;
  private searchValue: string;

  constructor(props: GraphFilterProps) {
    super(props);
    // Let URL override current redux state at construction time. Update URL with unset params.
    const urlEdgeLabelMode = ListPagesHelper.getSingleQueryParam(URLParams.GRAPH_EDGES) as EdgeLabelMode;
    if (urlEdgeLabelMode) {
      if (urlEdgeLabelMode !== props.edgeLabelMode) {
        props.setEdgeLabelMode(urlEdgeLabelMode);
      }
    } else {
      HistoryManager.setParam(URLParams.GRAPH_EDGES, String(this.props.edgeLabelMode));
    }

    const urlGraphType = ListPagesHelper.getSingleQueryParam(URLParams.GRAPH_TYPE) as GraphType;
    if (urlGraphType) {
      if (urlGraphType !== props.graphType) {
        props.setGraphType(urlGraphType);
      }
    } else {
      HistoryManager.setParam(URLParams.GRAPH_TYPE, String(this.props.graphType));
    }

    const urlNamespaces = ListPagesHelper.getSingleQueryParam(URLParams.NAMESPACES);
    if (urlNamespaces) {
      if (urlNamespaces !== namespacesToString(props.activeNamespaces)) {
        props.setActiveNamespaces(namespacesFromString(urlNamespaces));
      }
    } else {
      const activeNamespacesString = namespacesToString(props.activeNamespaces);
      HistoryManager.setParam(URLParams.NAMESPACES, activeNamespacesString);
    }

    if (props.search) {
      props.setSearch('');
    }
    if (props.showSearchHelp) {
      props.toggleSearchHelp();
    }
    this.searchValue = '';
    this.searchInputRef = React.createRef();
  }

  componentDidUpdate() {
    // ensure redux state and URL are aligned
    const activeNamespacesString = namespacesToString(this.props.activeNamespaces);
    if (this.props.activeNamespaces.length === 0) {
      HistoryManager.deleteParam(URLParams.NAMESPACES, true);
    } else {
      HistoryManager.setParam(URLParams.NAMESPACES, activeNamespacesString);
    }
    HistoryManager.setParam(URLParams.GRAPH_EDGES, String(this.props.edgeLabelMode));
    HistoryManager.setParam(URLParams.GRAPH_TYPE, String(this.props.graphType));
  }

  handleRefresh = () => {
    this.props.onRefresh();
  };

  handleNamespaceReturn = () => {
    this.props.setNode(undefined);
    this.context.router.history.push('/graph/namespaces');
  };

  render() {
    const graphTypeKey: string = _.findKey(GraphType, val => val === this.props.graphType)!;
    const edgeLabelModeKey: string = _.findKey(EdgeLabelMode, val => val === this.props.edgeLabelMode)!;
    console.log('render showSearchHelp=' + this.props.showSearchHelp);
    return (
      <>
        <Toolbar>
          {this.props.node && (
            <FormGroup className={zeroPaddingLeft}>
              <Button className={namespaceStyle} onClick={this.handleNamespaceReturn}>
                Back to Full Graph...
              </Button>
            </FormGroup>
          )}
          <FormGroup className={zeroPaddingLeft}>
            <GraphSettingsContainer edgeLabelMode={this.props.edgeLabelMode} graphType={this.props.graphType} />
            <ToolbarDropdown
              id={'graph_filter_edge_labels'}
              disabled={false}
              handleSelect={this.setEdgeLabelMode}
              value={edgeLabelModeKey}
              label="Edge Labels"
              options={GraphFilter.EDGE_LABEL_MODES}
            />
            <ToolbarDropdown
              id={'graph_filter_view_type'}
              disabled={this.props.node !== undefined || this.props.disabled}
              handleSelect={this.setGraphType}
              nameDropdown={'Graph Type'}
              value={graphTypeKey}
              label={GraphFilter.GRAPH_TYPES[graphTypeKey]}
              options={GraphFilter.GRAPH_TYPES}
            />
          </FormGroup>
          <FormGroup>
            <Form onSubmit={this.handleSearchSubmit}>
              <label style={{ paddingRight: '0.5em' }}>Search</label>
              <input
                type="text"
                style={{ width: '15em' }}
                ref={this.searchInputRef}
                disabled={this.props.disabled}
                onChange={this.updateSearchValue}
              />
              <span className={'pullRight'}>
                <Button
                  bsStyle="link"
                  style={{ paddingLeft: '2px' }}
                  disabled={this.props.disabled || this.searchValue === ''}
                  onClick={this.clearSearchValue}
                >
                  <Icon name="close" />
                </Button>
              </span>
              <span className={'pullRight'}>
                <Button bsStyle="link" style={{ paddingLeft: '2px' }} onClick={this.toggleSearchHelp}>
                  <Icon name="help" type="pf" title="Search help..." />
                </Button>
              </span>
            </Form>
          </FormGroup>
          <Toolbar.RightContent>
            <GraphRefreshContainer
              id="graph_refresh_container"
              disabled={this.props.disabled}
              handleRefresh={this.handleRefresh}
            />
          </Toolbar.RightContent>
        </Toolbar>
        {this.props.showSearchHelp && <GraphHelpSearch onClose={this.toggleSearchHelp} />}{' '}
      </>
    );
  }

  private toggleSearchHelp = () => {
    console.log('toggle from ' + this.props.toggleSearchHelp);
    this.props.toggleSearchHelp();
  };

  private updateSearchValue = event => {
    this.searchValue = event.target.value;
  };

  private clearSearchValue = () => {
    this.searchValue = '';
    this.searchInputRef.current.value = '';
    this.handleSearch();
  };

  private handleSearchSubmit = event => {
    event.preventDefault();
    this.handleSearch();
  };

  private handleSearch = () => {
    console.log('HandleSearch:' + this.searchValue);
    const cy = this.getCy();
    if (cy === null) {
      console.debug('Can not set search filter, cy is unavailable.');
      return;
    }
    // unhighlight old search
    cy.elements().removeClass('search');

    const selector = this.parseSearchValue(this.searchValue);
    if (selector) {
      cy.elements(selector).addClass('search');
    }

    this.forceUpdate(); // to enable/disable clear button
  };

  private parseSearchValue = (val: string): string | undefined => {
    let validVal = this.searchValue.trim();
    if (!validVal) {
      return undefined;
    }
    validVal = validVal.replace(/ and /gi, ' AND ');
    validVal = validVal.replace(/ or /gi, ' OR ');
    const conjunctive = validVal.includes(' AND ');
    const disjunctive = validVal.includes(' OR ');
    if (conjunctive && disjunctive) {
      MessageCenterUtils.add(`Search value can not contain both 'and' and 'or'.`);
      return undefined;
    }
    const separator = disjunctive ? ',' : '';
    const expressions = disjunctive ? validVal.split(' OR ') : validVal.split(' AND ');
    let selector;

    for (const expression of expressions) {
      console.log('EXPRESSION=' + expression);
      const parsedExpression = this.parseSearchExpression(expression, conjunctive);
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

  private parseSearchExpression = (expression: string, conjunctive: boolean): ParsedExpression | undefined => {
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
      // current numbers are store a s string, we need to change this for numeric matching
    } else if (expression.includes('>')) {
      op = '>';
    } else if (expression.includes('<')) {
      op = '<';
    } else if (expression.includes('!')) {
      op = '!';
    }
    if (!op) {
      const unaryExpression = this.parseUnarySearchExpression(expression.trim(), false);
      if (unaryExpression) {
        return unaryExpression;
      }

      if (conjunctive) {
        MessageCenterUtils.add('Search values do not allow AND exporessions with a global substring.');
        return undefined;
      }

      const wl = '[workload *= "' + expression + '"]';
      const app = ',[app *= "' + expression + '"]';
      const svc = ',[service *= "' + expression + '"]';
      return { target: 'node', selector: wl + app + svc };
    }

    const tokens = expression.split(op);
    if (op === '!') {
      const unaryExpression = this.parseUnarySearchExpression(tokens[1], true);
      if (unaryExpression) {
        return unaryExpression;
      }

      MessageCenterUtils.add('Invalid search value: [' + expression + '].');
      return undefined;
    }

    const field = tokens[0].trim();
    const val = tokens[1].trim();

    switch (field.toLowerCase()) {
      // node search
      case 'app':
        return { target: 'node', selector: '[app ' + op + ' "' + val + '"]' };
      case 'httpin': {
        const selector = op !== '=' || 0 !== Number(val) ? '[rate ' + op + ' ' + val + ']' : '[^rate]';
        return { target: 'node', selector: selector };
      }
      case 'httpout': {
        const selector = op !== '=' || 0 !== Number(val) ? '[rateOut ' + op + ' ' + val + ']' : '[^rateOut]';
        return { target: 'node', selector: selector };
      }
      case 'ns':
      case 'namespace':
        return { target: 'node', selector: '[namespace ' + op + ' "' + val + '"]' };
      case 'svc':
      case 'service':
        return { target: 'node', selector: '[service ' + op + ' "' + val + '"]' };
      case 'tcpin': {
        const selector = op !== '=' || 0 !== Number(val) ? '[rateTcpSent ' + op + ' ' + val + ']' : '[^rateTcpSent]';
        return { target: 'node', selector: selector };
      }
      case 'tcpout': {
        const selector =
          op !== '=' || 0 !== Number(val) ? '[rateTcpSentOut ' + op + ' ' + val + ']' : '[^rateTcpSentOut]';
        return { target: 'node', selector: selector };
      }
      case 'version':
        return { target: 'node', selector: '[version ' + op + ' "' + val + '"]' };
      case 'wl':
      case 'workload':
        return { target: 'node', selector: '[workload ' + op + ' "' + val + '"]' };
      // edge search
      case 'http': {
        const selector = op !== '=' || 0 !== Number(val) ? '[rate ' + op + ' ' + val + ']' : '[^rate]';
        return { target: 'edge', selector: selector };
      }
      case 'percenterr':
      case 'percenterror':
      case '%error':
      case '%err': {
        const selector = op !== '=' || 0 !== Number(val) ? '[percentErr ' + op + ' ' + val + ']' : '[^percentErr]';
        return { target: 'edge', selector: selector };
      }
      case 'percenttraffic':
      case '%traffic': {
        const selector = op !== '=' || 0 !== Number(val) ? '[percentRate ' + op + ' ' + val + ']' : '[^percentRate]';
        return { target: 'edge', selector: selector };
      }
      case 'rt':
      case 'responsetime':
        return { target: 'edge', selector: '[responseTime ' + op + ' ' + Number(val) / 1000 + ']' };
      case 'tcp': {
        const selector = op !== '=' || 0 !== Number(val) ? '[tcpSentRate ' + op + ' ' + val + ']' : '[^tcpSentRate]';
        return { target: 'edge', selector: selector };
      }
      default:
        MessageCenterUtils.add('Invalid search value: [' + expression + '].');
        return undefined;
    }
  };

  private parseUnarySearchExpression = (field: string, isNegation): ParsedExpression | undefined => {
    switch (field.toLowerCase()) {
      // node search
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
      case 'serviceentry':
        return { target: 'node', selector: isNegation ? '[^isServiceEntry]' : '[isServiceEntry]' };
      case 'sc':
      case 'sidecar':
        return { target: 'node', selector: isNegation ? '[hasMissingSC]' : '[^hasMissingSC]' };
      case 'svcnode':
      case 'servicenode':
        return { target: 'node', selector: isNegation ? '[nodeType != "service"]' : '[nodeType = "service"]' };
      case 'trafficsource':
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
      // edge search
      case 'mtls':
        return { target: 'edge', selector: isNegation ? '[^isMTLS]' : '[isMTLS]' };
      case 'root':
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
      MessageCenterUtils.add('Search value can not mix node and edge criteria.');
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

  private setGraphType = (type: string) => {
    const graphType: GraphType = GraphType[type] as GraphType;
    if (this.props.graphType !== graphType) {
      this.props.setGraphType(graphType);
    }
  };

  private setEdgeLabelMode = (edgeMode: string) => {
    const mode: EdgeLabelMode = EdgeLabelMode[edgeMode] as EdgeLabelMode;
    if (this.props.edgeLabelMode !== mode) {
      this.props.setEdgeLabelMode(mode);
    }
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  activeNamespaces: activeNamespacesSelector(state),
  edgeLabelMode: edgeLabelModeSelector(state),
  graphType: graphTypeSelector(state),
  node: state.graph.node,
  search: state.graph.filterState.search,
  showSearchHelp: state.graph.filterState.showSearchHelp
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    setActiveNamespaces: bindActionCreators(NamespaceActions.setActiveNamespaces, dispatch),
    setEdgeLabelMode: bindActionCreators(GraphFilterActions.setEdgelLabelMode, dispatch),
    setGraphType: bindActionCreators(GraphFilterActions.setGraphType, dispatch),
    setNode: bindActionCreators(GraphActions.setNode, dispatch),
    setSearch: bindActionCreators(GraphFilterActions.setSearch, dispatch),
    toggleSearchHelp: bindActionCreators(GraphFilterActions.toggleSearchHelp, dispatch)
  };
};

const GraphFilterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphFilter);

export default GraphFilterContainer;
