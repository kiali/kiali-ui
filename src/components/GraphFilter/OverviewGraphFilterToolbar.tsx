import * as React from 'react';
import { PropTypes } from 'prop-types';

import { GraphParamsType } from '../../types/Graph';
import { Duration, Layout, EdgeLabelMode } from '../../types/GraphFilter';
import GraphFilterToolbarType from '../../types/GraphFilterToolbar';

import { makeOverviewURLFromParams } from '../../components/Nav/NavUtils';

import GraphFilter from './GraphFilter';

export default class OverviewGraphFilterToolbar extends React.PureComponent<GraphFilterToolbarType, {}> {
  static contextTypes = {
    router: PropTypes.object
  };

  render() {
    const graphParams: GraphParamsType = {
      graphLayout: this.props.graphLayout,
      graphDuration: this.props.graphDuration,
      edgeLabelMode: this.props.edgeLabelMode,
      namespace: { name: '' }
    };

    return (
      <GraphFilter
        disabled={this.props.isLoading}
        onLayoutChange={this.handleOverviewLayoutChange}
        onDurationChange={this.handleOverviewDurationChange}
        onNamespaceChange={this.handleOverviewNamespaceChange}
        onEdgeLabelModeChange={this.handleOverviewEdgeLabelModeChange}
        onRefresh={this.props.handleRefreshClick}
        {...graphParams}
      />
    );
  }

  handleOverviewLayoutChange = (graphLayout: Layout) => {
    const { namespace, graphDuration, edgeLabelMode } = this.getGraphParams();
    this.handleOverviewFilterChange({
      graphDuration,
      namespace,
      graphLayout,
      edgeLabelMode
    });
  };

  handleOverviewDurationChange = (graphDuration: Duration) => {
    const { namespace, graphLayout, edgeLabelMode } = this.getGraphParams();
    this.handleOverviewFilterChange({
      graphDuration,
      namespace,
      graphLayout,
      edgeLabelMode
    });
  };

  handleOverviewNamespaceChange = () => {
    // dummy
  };

  handleOverviewEdgeLabelModeChange = (edgeLabelMode: EdgeLabelMode) => {
    const { namespace, graphDuration, graphLayout } = this.getGraphParams();
    this.handleOverviewFilterChange({
      namespace,
      graphDuration,
      graphLayout,
      edgeLabelMode
    });
  };

  handleOverviewFilterChange = (params: GraphParamsType) => {
    this.context.router.history.push(makeOverviewURLFromParams(params));
  };

  private getGraphParams: () => GraphParamsType = () => {
    return {
      namespace: this.props.namespace,
      graphDuration: this.props.graphDuration,
      graphLayout: this.props.graphLayout,
      edgeLabelMode: this.props.edgeLabelMode
    };
  };
}
