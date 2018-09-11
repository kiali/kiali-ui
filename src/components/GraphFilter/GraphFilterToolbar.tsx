import * as React from 'react';
import { PropTypes } from 'prop-types';

import { GraphParamsType, GraphType } from '../../types/Graph';
import { Duration } from '../../types/GraphFilter';
import Namespace from '../../types/Namespace';
import GraphFilterToolbarType from '../../types/GraphFilterToolbar';

import { makeNamespaceGraphUrlFromParams, makeNodeGraphUrlFromParams } from '../Nav/NavUtils';

import GraphFilter from './GraphFilter';
import { store } from '../../store/ConfigStore';
import { UserSettingsActions } from '../../actions/UserSettingsActions';

export default class GraphFilterToolbar extends React.PureComponent<GraphFilterToolbarType> {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {
    const graphParams: GraphParamsType = {
      namespace: this.props.namespace,
      node: this.props.node,
      graphLayout: this.props.graphLayout,
      graphDuration: this.props.graphDuration,
      edgeLabelMode: this.props.edgeLabelMode,
      graphType: this.props.graphType,
      injectServiceNodes: this.props.injectServiceNodes
    };

    return (
      <GraphFilter
        disabled={this.props.isLoading}
        onDurationChange={this.handleDurationChange}
        onNamespaceChange={this.handleNamespaceChange}
        onNamespaceReturn={this.handleNamespaceReturn}
        onGraphTypeChange={this.handleGraphTypeChange}
        onRefresh={this.props.handleRefreshClick}
        {...graphParams}
      />
    );
  }

  handleDurationChange = (graphDuration: Duration) => {
    this.handleUrlFilterChange({
      ...this.getGraphParams(),
      graphDuration
    });
    store.dispatch(UserSettingsActions.setDurationInterval(Number(graphDuration)));
  };

  handleNamespaceChange = (namespace: Namespace) => {
    this.handleUrlFilterChange({
      ...this.getGraphParams(),
      namespace
    });
  };

  handleNamespaceReturn = () => {
    this.context.router.history.push(
      makeNamespaceGraphUrlFromParams({ ...this.getGraphParams(), node: undefined, injectServiceNodes: false })
    );
  };

  handleGraphTypeChange = (graphType: GraphType) => {
    this.handleUrlFilterChange({
      ...this.getGraphParams(),
      graphType
    });
  };

  /**
   * If we change the graph parameters then change the params in the url
   * @param graphParams the graph parameters
   */
  handleUrlFilterChange = (graphParams: GraphParamsType) => {
    if (this.props.node) {
      this.context.router.history.push(makeNodeGraphUrlFromParams(this.props.node, graphParams));
    } else {
      this.context.router.history.push(makeNamespaceGraphUrlFromParams(graphParams));
    }
  };

  private getGraphParams: () => GraphParamsType = () => {
    return {
      namespace: this.props.namespace,
      node: this.props.node,
      graphDuration: this.props.graphDuration,
      graphLayout: this.props.graphLayout,
      edgeLabelMode: this.props.edgeLabelMode,
      graphType: this.props.graphType,
      injectServiceNodes: this.props.injectServiceNodes
    };
  };
}
