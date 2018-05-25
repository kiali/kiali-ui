import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { GraphParamsType } from '../../types/Graph';
import { EdgeLabelMode } from '../../types/GraphFilter';
import * as LayoutDictionary from '../../components/CytoscapeGraph/graphs/LayoutDictionary';
import OverviewGraphPage from '../../containers/OverviewGraphPageContainer';
import { makeOverviewURLFromParams } from '../../components/Nav/NavUtils';
import { config } from '../../config';

const URLSearchParams = require('url-search-params');

const SESSION_KEY = 'overview-graph-params';

type OverviewGraphURLProps = {
  // @todo: redo this manual params with Redux-Router
  // @todo: add back in circuit-breaker, route-rules params to Redux-Router for URL-params
  duration: string;
  layout: string;
};

/**
 * Handle URL parameters for OverviewGraph page
 */
export default class OverviewGraphRouteHandler extends React.Component<
  RouteComponentProps<OverviewGraphURLProps>,
  GraphParamsType
> {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(routeProps: RouteComponentProps<OverviewGraphURLProps>) {
    super(routeProps);
    const previousParamsStr = sessionStorage.getItem(SESSION_KEY);
    const graphParams: GraphParamsType = previousParamsStr
      ? JSON.parse(previousParamsStr)
      : {
          namespace: { name: '' },
          ...this.parseProps(routeProps.location.search)
        };
    this.state = graphParams;
  }

  parseProps = (queryString: string) => {
    const urlParams = new URLSearchParams(queryString);
    // TODO: [KIALI-357] validate `duration`
    const _duration = urlParams.get('duration');
    const _hideCBs = urlParams.get('hideCBs') ? urlParams.get('hideCBs') === 'true' : false;
    const _hideRRs = urlParams.get('hideRRs') ? urlParams.get('hideRRs') === 'true' : false;
    const _edgeLabelMode = EdgeLabelMode.fromString(urlParams.get('edges'), EdgeLabelMode.HIDE);
    return {
      graphDuration: _duration ? { value: _duration } : { value: config().toolbar.defaultDuration },
      graphLayout: LayoutDictionary.getLayout({ name: urlParams.get('layout') }),
      badgeStatus: { hideCBs: _hideCBs, hideRRs: _hideRRs },
      edgeLabelMode: _edgeLabelMode
    };
  };

  componentDidMount() {
    // Note: `history.replace` simply changes the address bar text, not re-navigation
    this.context.router.history.replace(makeOverviewURLFromParams(this.state));
  }

  componentWillReceiveProps(nextProps: RouteComponentProps<OverviewGraphURLProps>) {
    const { graphDuration: nextDuration, graphLayout: nextLayout, edgeLabelMode: nextEdgeLabelMode } = this.parseProps(
      nextProps.location.search
    );

    const layoutHasChanged = nextLayout.name !== this.state.graphLayout.name;
    const durationHasChanged = nextDuration.value !== this.state.graphDuration.value;
    const edgeLabelModeChanged = nextEdgeLabelMode !== this.state.edgeLabelMode;

    if (layoutHasChanged || durationHasChanged || edgeLabelModeChanged) {
      const newParams: GraphParamsType = {
        graphDuration: nextDuration,
        graphLayout: nextLayout,
        edgeLabelMode: nextEdgeLabelMode,
        namespace: { name: '' }
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newParams));
      this.setState({ ...newParams });
    }
  }

  render() {
    return <OverviewGraphPage {...this.state} />;
  }
}
