import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import cycola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';
import klay from 'cytoscape-klay';
import popper from 'cytoscape-popper';
import { PfColors } from '../../components/Pf/PfColors';
import { destroyAllBadges } from './graphs/GraphBadge';

cytoscape.use(cycola);
cytoscape.use(dagre);
cytoscape.use(coseBilkent);
cytoscape.use(klay);
cytoscape.use(popper);

type ReactCytoscapeProps = {
  containerID?: string; // the div ID that contains the cy graph
  elements?: any; // defines all the nodes, edges, and groups - this is the low-level graph data
  style?: any;
  styleContainer?: any;
  cytoscapeOptions?: any;
  layout?: any;
  cyInitializedFn?: (cy: any) => void; // to be called when cy graph is initially created
  processGraphFn?: () => void; // to be called when the graph is updated and needs post-processing
};

// purposefully have no state - cy graph itself holds the state of the graph (nodes, edges, etc.)
type ReactCytoscapeState = {};

/**
 * A React Cytoscape wrapper. The job of this class is to create and maintain the cy graph.
 * It will handle updating the low-level nodes and edges data. If any additional processing
 * needs to be done by the owner of this component, it should be done by the callbacks
 * defined in the properties (cyInitializedFn for when the graph is first created and initialized,
 * and processGraphFn for when the graph's elements are updated).
 */
class ReactCytoscape extends Component<ReactCytoscapeProps, ReactCytoscapeState> {
  cy: any;
  container: any;
  renderedLayout: string;

  getContainerID() {
    return this.props.containerID || 'cy';
  }

  getContainer() {
    return this.container;
  }

  defaultStyle() {
    return [
      {
        selector: 'node',
        css: {
          content: ele => {
            return ele.data('label') || ele.data('id');
          },
          'text-valign': 'center',
          'text-halign': 'center'
        }
      },
      {
        selector: '$node > node',
        css: {
          'padding-top': '10px',
          'padding-left': '10px',
          'padding-bottom': '10px',
          'padding-right': '10px',
          'text-valign': 'top',
          'text-halign': 'center',
          'background-color': PfColors.Black400
        }
      },
      {
        selector: 'edge',
        css: {
          'target-arrow-shape': 'vee'
        }
      },
      {
        selector: ':selected',
        css: {
          'background-color': PfColors.Black,
          'line-color': PfColors.Black,
          'target-arrow-color': PfColors.Black,
          'source-arrow-color': PfColors.Black
        }
      }
    ];
  }

  style() {
    return this.props.style || this.defaultStyle();
  }

  elements() {
    return this.props.elements || {};
  }

  layout() {
    return this.props.layout || { name: 'cola' };
  }

  cytoscapeOptions() {
    return this.props.cytoscapeOptions || {};
  }

  build() {
    if (this.cy) {
      console.log('CY: reusing the existing graph');
      if (this.renderedLayout !== JSON.stringify(this.layout())) {
        console.log('CY: a different layout is to be applied to the graph');
        this.cy.layout(this.layout()).run();
        this.renderedLayout = JSON.stringify(this.layout());
      }

      // rebuild the graph with the new nodes and edges
      destroyAllBadges(this.cy); // hate to do this, but until we can truly diff the graph, we need to purge them all
      this.cy.json({ elements: this.elements() });

      // trigger the callback so the owning component can also process the graph
      if (this.props.processGraphFn) {
        this.props.processGraphFn();
      }
    } else {
      console.log('CY: creating a new graph instance');
      let opts = Object.assign(
        {
          container: this.getContainer(),
          boxSelectionEnabled: false,
          autounselectify: true,
          style: this.style(),
          elements: this.elements(),
          layout: this.layout()
        },
        this.cytoscapeOptions()
      );

      this.cy = cytoscape(opts);

      // remember the layout we currently have rendered
      this.renderedLayout = JSON.stringify(this.layout());

      // Notify our owner about the new cy graph. Note that we do not call
      // processGraphFn - that is only for updating an existing graph. If the
      // owner wants to process information about the new graph it can set it up
      // in the cyInitializedFn().
      if (this.props.cyInitializedFn) {
        this.props.cyInitializedFn(this.cy);
      }
    }
    return this.cy;
  }

  componentWillUnmount() {
    console.log('CY: unmounting component');
    this.clean();
  }

  componentDidMount() {
    console.log('CY: mounting component');
    this.build();
  }

  componentDidUpdate() {
    console.log('CY: updating component');
    this.build();
  }

  render() {
    let style = this.props.styleContainer || {};
    let styleContainer = Object.assign({ height: '100%', width: '100%', display: 'block' }, style);
    return (
      <div
        className="graph"
        id={this.getContainerID()}
        ref={elt => {
          this.container = elt;
        }}
        style={styleContainer}
      />
    );
  }

  clean() {
    if (this.cy) {
      console.log('CY: the graph instance is being destroyed');
      this.cy.destroy();
      this.cy = null;
    }
  }
}

export default ReactCytoscape;
