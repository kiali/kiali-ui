import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { GraphStyles } from './graphs/GraphStyles';
import { GraphHighlighter } from './graphs/GraphHighlighter';
import ReactCytoscape from './ReactCytoscape';
import EmptyGraphLayout from './EmptyGraphLayout';

import { GraphParamsType } from '../../types/Graph';
import * as LayoutDictionary from './graphs/LayoutDictionary';
import { KialiAppState } from '../../store/Store';
import * as GraphBadge from './graphs/GraphBadge';

type CytoscapeLayoutType = {
  elements: any;
  onClick: (event: CytoscapeClickEvent) => void;
  onReady: (event: CytoscapeBaseEvent) => void;
  isLoading?: boolean;
  showEdgeLabels: boolean;
  showNodeLabels: boolean;
  isReady?: boolean;
  onRefresh: any;
};

type CytoscapeLayoutProps = CytoscapeLayoutType & GraphParamsType;

type CytoscapeLayoutState = {};

interface CytoscapeBaseEvent {
  summaryType: string; // What the summary panel should show. One of: graph, node, edge, or group
  summaryTarget: any; // The cytoscape element that was the target of the event
}

export interface CytoscapeClickEvent extends CytoscapeBaseEvent {}
export interface CytoscapeMouseInEvent extends CytoscapeBaseEvent {}
export interface CytoscapeMouseOutEvent extends CytoscapeBaseEvent {}

// @todo: Move this class to 'containers' folder -- but it effects many other things
// exporting this class for testing
export class CytoscapeLayout extends React.Component<CytoscapeLayoutProps, CytoscapeLayoutState> {
  static contextTypes = {
    router: PropTypes.object
  };

  cy: any;
  graphHighlighter: GraphHighlighter;

  constructor(props: CytoscapeLayoutProps) {
    super(props);
    console.log(`Starting ServiceGraphPage for namespace: ${this.props.namespace.name}`);
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return (
      this.props.isLoading !== nextProps.isLoading ||
      this.props.graphLayout !== nextProps.graphLayout ||
      this.props.badgeStatus !== nextProps.badgeStatus ||
      this.props.showEdgeLabels !== nextProps.showEdgeLabels ||
      this.props.showNodeLabels !== nextProps.showNodeLabels
    );
  }

  turnEdgeLabelsTo = (value: boolean) => {
    let elements = this.props.elements;
    if (elements && elements.edges) {
      // Mutate the edges inplace
      elements.edges.forEach(edge => {
        edge.data.showEdgeLabels = value;
      });
    }
  };

  turnNodeLabelsTo = (value: boolean) => {
    let elements = this.props.elements;
    if (elements && elements.nodes) {
      // Mutate the nodes inplace
      elements.nodes.forEach(node => {
        node.data.showNodeLabels = value;
      });
    }
  };

  // This is called by the component that creates the cy graph object itself.
  // This callback allows us to perform additional initialization on the cy graph.
  cyInitialized(cy: any) {
    this.cy = cy;
    this.graphHighlighter = new GraphHighlighter(cy);

    const getCytoscapeBaseEvent = (event: any): CytoscapeBaseEvent | null => {
      const target = event.target;
      if (target === cy) {
        return { summaryType: 'graph', summaryTarget: cy };
      } else if (target.isNode()) {
        if (target.data('isGroup') === 'version') {
          return { summaryType: 'group', summaryTarget: target };
        } else {
          return { summaryType: 'node', summaryTarget: target };
        }
      } else if (target.isEdge()) {
        return { summaryType: 'edge', summaryTarget: target };
      } else {
        console.log(`${event.type} UNHANDLED`);
        return null;
      }
    };

    this.cy.on('tap', (evt: any) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);
      if (cytoscapeEvent) {
        this.handleTap(cytoscapeEvent);
      }
    });

    this.cy.on('mouseover', 'node,edge', (evt: any) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);
      if (cytoscapeEvent) {
        this.handleMouseIn(cytoscapeEvent);
      }
    });
    this.cy.on('mouseout', 'node,edge', (evt: any) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);
      if (cytoscapeEvent) {
        this.handleMouseOut(cytoscapeEvent);
      }
    });

    // when the graph is fully populated and ready, we need to perform additional things
    this.cy.ready((evt: any) => {
      if (!this.props.isReady) {
        // Don't allow a large zoom if the graph has a few nodes (nodes would look too big).
        if (this.cy.zoom() > 2.5) {
          this.cy.zoom(2.5);
          this.cy.center();
        }

        this.processGraphUpdate();
        this.props.onReady(evt.cy);
      }
    });
  }

  // Perform additional processing on the graph to do things like decorating it with badges
  processGraphUpdate() {
    console.log('CY: graph was updated and needs to be processed further');

    // TODO: refactor the GraphBadge.XXX classes so the constructor doesn't take an
    //       element. Pass ele to the buildBadge and destroyBadge funcs so we don't have to
    //       create so many objects - we should just create one object per badge type
    //       and let it build/destroy multiple badges.
    this.cy.startBatch();
    this.cy.nodes().forEach(ele => {
      if (!this.props.badgeStatus.hideCBs && ele.data('hasCB')) {
        new GraphBadge.CircuitBreakerBadge(ele).buildBadge();
      } else {
        new GraphBadge.CircuitBreakerBadge(ele).destroyBadge();
      }

      if (!this.props.badgeStatus.hideRRs && ele.data('hasRR')) {
        new GraphBadge.RouteRuleBadge(ele).buildBadge();
      } else {
        new GraphBadge.RouteRuleBadge(ele).destroyBadge();
      }
    });
    this.cy.endBatch();
  }

  render() {
    const layout = LayoutDictionary.getLayout(this.props.graphLayout);

    this.turnEdgeLabelsTo(this.props.showEdgeLabels);
    this.turnNodeLabelsTo(this.props.showNodeLabels);

    return (
      <div id="cytoscape-container" style={{ marginRight: '25em', height: '100%' }}>
        <EmptyGraphLayout
          elements={this.props.elements}
          namespace={this.props.namespace.name}
          action={this.props.onRefresh}
        >
          <ReactCytoscape
            containerID="cy"
            elements={this.props.elements}
            style={GraphStyles.styles()}
            cytoscapeOptions={GraphStyles.options()}
            layout={layout}
            cyInitializedFn={cy => {
              this.cyInitialized(cy);
            }}
            processGraphFn={() => {
              this.processGraphUpdate();
            }}
          />
        </EmptyGraphLayout>
      </div>
    );
  }

  handleTap = (event: CytoscapeClickEvent) => {
    this.props.onClick(event);
    this.graphHighlighter.onClick(event);
  };

  handleMouseIn = (event: CytoscapeMouseInEvent) => {
    this.graphHighlighter.onMouseIn(event);
  };

  handleMouseOut = (event: CytoscapeMouseOutEvent) => {
    this.graphHighlighter.onMouseOut(event);
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  showEdgeLabels: state.serviceGraphState.showEdgeLabels,
  showNodeLabels: state.serviceGraphState.showNodeLabels
});

const CytoscapeLayoutConnected = connect(mapStateToProps, null)(CytoscapeLayout);
export default CytoscapeLayoutConnected;
