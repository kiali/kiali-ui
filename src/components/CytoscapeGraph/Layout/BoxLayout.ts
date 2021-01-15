/*
  BoxLayout

  This is a synthetic layout that helps to better layout the contents of box (i.e. compound)
  nodes, in this way we ensure that the box nodes themselves are as small as possible, and avoiding
  overlaps with other nodes.

  It finishes by executing the default (i.e. user-selected) layout but prior to that will
  individually layout the box node contents using the requested layouts.

  Is composed of:
   - The [optional] configured box layouts will layout the children of the box node.
     - appBoxLayout, clusterBoxLayout, namespaceBoxLayout
   - The [required] configured defaultLayout is used for any box layouts not otherwise specified, and is
     applied for the final layout.
   - A Synthetic edge generator creates synthetic edges (more info below).

  The algorithm is roughly as follow:

  1. For every box type (working inner to outer)
       2. For every box node:
          a. Get the resulting bounding box of the compound node, set the width and height of the node
             using `cy.style`, so that the real layout honors the size when doing the layout.
          b. The box layout is run for every box and its relative positions (to the parent)
             are saved for later use.
          c. For every edge that goes to a child (or comes from a child), create a synthetic edge
            that goes to (or comes from) the compound node and remove the original
            edge. We can cull away repeated edges as they are not needed.
          d. Remove the children. This is important, else cytoscape won't honor the size specified
             in previous step. "A compound parent node does not have independent dimensions (position
             and size), as those values are automatically inferred by the positions and dimensions
             of the descendant nodes." http://js.cytoscape.org/#notation/compound-nodes
  3. Run the default layout on this new graph and wait until it finishes.
     a. Restore the children.
     b. Remove the synthetic edges.
     c. For every child set the relative position to its parent
 */

import { CyNode } from '../CytoscapeGraphUtils';
import { BoxByType } from 'types/Graph';

export const BOX_NODE_CLASS = '__boxNodeClass';

const NAMESPACE_KEY = 'box-layout';
const STYLES_KEY = NAMESPACE_KEY + 'styles';
const RELATIVE_POSITION_KEY = NAMESPACE_KEY + 'relative_position';
const PARENT_POSITION_KEY = NAMESPACE_KEY + '.parent_position';

// Styles used to have more control on how the compound nodes are going to be seen by the Layout algorithm.
type OverridenStyles = {
  shape: string;
  width: string;
  height: string;
};

type LayoutBoxTypeResult = {
  boxNodes: any;
  syntheticEdges: any;
  removedElements: any;
};

/**
 * Synthetic edge generator takes care of creating edges without repeating the same edge (targetA -> targetB) twice
 */
class SyntheticEdgeGenerator {
  private nextId = 0;
  private generatedMap = {};

  public getEdge(source: any, target: any) {
    const sourceId = this.normalizeToParent(source).id();
    const targetId = this.normalizeToParent(target).id();

    if (sourceId === targetId) {
      return false;
    }

    const key = `${sourceId}->${targetId}`;

    if (this.generatedMap[key]) {
      return false;
    }

    this.generatedMap[key] = true;

    return {
      group: 'edges',
      data: {
        id: 'synthetic-edge-' + this.nextId++,
        source: sourceId,
        target: targetId
      }
    };
  }

  // Returns the parent if any or the element itself.
  private normalizeToParent(element: any) {
    return element.isChild() ? element.parent() : element;
  }
}

/**
 * Main class for the BoxLayout, used to bridge with cytoscape to make it easier to integrate with current code
 */
export default class BoxLayout {
  readonly options;
  readonly cy;
  readonly elements;
  readonly syntheticEdgeGenerator;

  constructor(options: any) {
    this.options = { ...options };
    this.cy = this.options.cy;
    this.elements = this.options.eles;
    this.syntheticEdgeGenerator = new SyntheticEdgeGenerator();
  }

  /**
   * This code gets executed on the cy.layout(...).  run() is the entrypoint of this algorithm.
   */
  run() {
    this.runAsync();
  }

  // Discrete layouts (dagre) always stop before layout.run() returns. Continuous layouts (cose,cola)
  // are started by layout.run() but may stop after run() returns. Because outer boxes require the inner
  // box layouts to complete, we need to force discrete behavior regardless of layout, and that is why
  // this code is complicated with a variety of async handling.  Note that because namespace or cluster
  // boxes may comprise large portions of the graph, we need to be flexible with the layout support (in
  // other words, we can't force dagre like we do for app boxes).

  async runAsync(): Promise<any> {
    let allBoxNodes = this.cy.collection();
    let removedElements = this.cy.collection();
    let syntheticEdges = this.cy.collection();
    let result;

    // (1) working from inner boxing to outer boxing, perform the box layouts. the inner box layouts
    // must complete before the outer box layouts can proceed.

    result = await this.layoutBoxType(BoxByType.APP);
    allBoxNodes = allBoxNodes.add(result.boxNodes);
    removedElements = removedElements.add(result.removedElements);
    syntheticEdges = syntheticEdges.add(result.syntheticEdges);

    result = await this.layoutBoxType(BoxByType.NAMESPACE);
    allBoxNodes = allBoxNodes.add(result.boxNodes);
    removedElements = removedElements.add(result.removedElements);
    syntheticEdges = syntheticEdges.add(result.syntheticEdges);

    result = await this.layoutBoxType(BoxByType.CLUSTER);
    allBoxNodes = allBoxNodes.add(result.boxNodes);
    removedElements = removedElements.add(result.removedElements);
    syntheticEdges = syntheticEdges.add(result.syntheticEdges);

    // (3) perform the final layout...

    // Ensure we only touch the requested elements and not the whole graph.
    const layoutElements = this.cy.collection().add(this.elements).subtract(removedElements).add(syntheticEdges);

    // Before running the layout, reset the elements positions.
    // This is not absolutely necessary, but without this we have seen some problems with
    //  `cola` + firefox + a particular mesh
    layoutElements.position({ x: 0, y: 0 });

    const layout = this.cy.layout({
      // Create a new layout
      ...this.options.defaultLayout, // Sharing the main options
      eles: this.cy.elements(), // and the current elements
      appBoxLayout: undefined, // undefine the unwanted options...
      clusterBoxLayout: undefined,
      defaultLayout: undefined,
      namespaceBoxLayout: undefined
    });

    // Add a one-time callback to be fired when the layout stops
    layout.one('layoutstop', _event => {
      // If we add any children back, our parent nodes position are going to take the bounding box's position of all
      // their children. Before doing it, save this position in order to add this up to their children.
      allBoxNodes.each(boxNode => {
        boxNode.scratch(PARENT_POSITION_KEY, { ...boxNode.position() }); // Make a copy of the position, its an internal data from cy.
      });

      // (3.a) Add back the child nodes (with edges still attached)
      removedElements.restore();

      // (3.b) Remove synthetic edges
      this.cy.remove(syntheticEdges);

      // (3.c) Add and position the children nodes according to the layout
      allBoxNodes.each(boxNode => {
        const parentPosition = boxNode.scratch(PARENT_POSITION_KEY);
        boxNode.children().each(child => {
          const relativePosition = child.scratch(RELATIVE_POSITION_KEY);
          child.position({
            x: parentPosition.x + relativePosition.x,
            y: parentPosition.y + relativePosition.y
          });
          child.removeData(RELATIVE_POSITION_KEY);
        });

        boxNode.style(boxNode.scratch(STYLES_KEY));
        boxNode.removeClass(BOX_NODE_CLASS);

        // Discard the saved values
        boxNode.removeScratch(STYLES_KEY);
        boxNode.removeScratch(PARENT_POSITION_KEY);
      });
    });

    layout.run();
  }

  async layoutBoxType(boxByType: BoxByType): Promise<LayoutBoxTypeResult> {
    return new Promise((resolve, _reject) => {
      const { appBoxLayout, clusterBoxLayout, defaultLayout, namespaceBoxLayout } = this.options;
      const boxNodes = this.getBoxNodes(boxByType);

      let boxLayoutOptions = defaultLayout;
      switch (boxByType) {
        case BoxByType.APP:
          if (appBoxLayout) {
            boxLayoutOptions = appBoxLayout;
          }
          break;
        case BoxByType.CLUSTER:
          if (clusterBoxLayout) {
            boxLayoutOptions = clusterBoxLayout;
          }
          break;
        case BoxByType.NAMESPACE:
          if (namespaceBoxLayout) {
            boxLayoutOptions = namespaceBoxLayout;
          }
          break;
      }

      // Before completing work for the box type we must wait for all individual box work to complete
      const boxNodePromises: Promise<any>[] = [];

      // (2) Prepare each box node by assigning a size and running the compound layout
      boxNodes.each(boxNode => {
        const boxedNodes = boxNode.children();
        const boxedElements = boxedNodes.add(boxedNodes.edgesTo(boxedNodes));
        const boxLayout = boxedElements.layout(boxLayoutOptions);

        boxNodePromises.push(
          new Promise((resolve, _reject) => {
            // This promise resolves when the layout actually stops.
            this.runLayout(boxLayoutOptions.name, boxLayout).then(_response => {
              // (2.a) get the bounding box
              // see https://github.com/cytoscape/cytoscape.js/issues/2402
              const boundingBox = boxNode.boundingBox();

              // Save the relative positions, as we will need them later.
              boxedNodes.each(boxedNode => {
                boxedNode.scratch(RELATIVE_POSITION_KEY, boxedNode.relativePosition());
              });

              const backupStyles: OverridenStyles = {
                shape: boxNode.style('shape'),
                height: boxNode.style('height'),
                width: boxNode.style('width')
              };

              const newStyles: OverridenStyles = {
                shape: 'rectangle',
                height: `${boundingBox.h}px`,
                width: `${boundingBox.w}px`
              };

              // Saves a backup of current styles to restore them after we finish
              boxNode.scratch(STYLES_KEY, backupStyles);
              boxNode.addClass(BOX_NODE_CLASS);

              // (2.b) Set the size
              boxNode.style(newStyles);

              resolve(true);
            });
          })
        );
      });

      Promise.all(boxNodePromises).then(_results => {
        let removedElements = this.cy.collection();
        let syntheticEdges = this.cy.collection();

        // (2.c) Add synthetic edges for every edge that touches a child node.
        const boxedNodes = boxNodes.children();
        for (const boxedNode of boxedNodes) {
          for (const edge of boxedNode.connectedEdges()) {
            const syntheticEdge = this.syntheticEdgeGenerator.getEdge(edge.source(), edge.target());
            if (syntheticEdge) {
              syntheticEdges = syntheticEdges.add(this.cy.add(syntheticEdge));
            }
          }
        }
        // (2.d) Remove all child nodes from parents (and their edges).
        removedElements = removedElements.add(this.cy.remove(boxedNodes));

        resolve({ boxNodes: boxNodes, syntheticEdges: syntheticEdges, removedElements: removedElements });
      });
    });
  }

  async runLayout(layoutName, layout): Promise<any> {
    // Avoid propagating any local layout events up to cy, this would yield a global operation before the nodes are ready.
    layout.on('layoutstart layoutready layoutstop', _event => {
      return false;
    });

    // We know dagre is discrete, we can resolve when run() returns
    if (layoutName === 'dagre') {
      return layout.run();
    }

    const promise = layout.promiseOn('layoutstop');
    layout.run();
    return promise;
  }

  getBoxNodes(boxByType: BoxByType): any {
    return this.elements.nodes(`[${CyNode.isBox}="${boxByType}"]`);
  }
}
