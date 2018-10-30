const NAMESPACE_KEY = '_group_compound_layout';
const CHILDREN_KEY = 'children';
const PADDING_WIDTH = 5;
const BETWEEN_NODES_PADDING = 3;

const normalizeToParent = element => {
  return element.isChild() ? element.parent() : element;
};

class SyntheticEdgeGenerator {
  private nextId = 0;
  private generatedMap = {};

  public getEdge(source: any, target: any) {
    const sourceId = normalizeToParent(source).id();
    const targetId = normalizeToParent(target).id();
    const key = `${sourceId}->${targetId}`;

    if (this.generatedMap[key]) {
      return false;
    }
    return (this.generatedMap[key] = {
      group: 'edges',
      data: {
        id: 'synthetic-edge-' + this.nextId++,
        source: sourceId,
        target: targetId
      }
    });
  }

  public getGeneratedEdges() {
    return Object.keys(this.generatedMap).map(key => this.generatedMap[key]);
  }
}

export default class GroupCompoundLayout {
  private options;
  private cy;
  private elements;
  private syntheticEdgeGenerator;

  constructor(options: any) {
    this.options = { ...options };
    this.cy = this.options.cy;
    this.elements = this.options.eles;
    this.syntheticEdgeGenerator = new SyntheticEdgeGenerator();
  }

  run() {
    const { realLayout } = this.options;
    const parents = this.parents();
    if (parents.length > 0) {
      // Prepare parents by assigning a width and height
      parents.each(parent => {
        const boundingBox = parent.children().reduce(
          (accBoundingBox, child) => {
            const localBoundingBox = child.boundingBox();
            accBoundingBox.height += localBoundingBox.h;
            accBoundingBox.width = Math.max(accBoundingBox.width, localBoundingBox.w + PADDING_WIDTH);
            return accBoundingBox;
          },
          { width: 0, height: 0 }
        );
        parent.style('shape', 'rectangle');
        parent.style('height', `${boundingBox.height}px`);
        parent.style('width', `${boundingBox.width}px`);
        this.setScratch(parent, CHILDREN_KEY, parent.children().jsons());
      });
      // Remove the children and its edges, add synthetic edges for every edge that touch a child node.
      let syntheticEdges = this.cy.collection();
      const elementsToRemove = parents.children().reduce((children, child) => {
        children.push(child);
        return children.concat(
          child.connectedEdges().reduce((edges, edge) => {
            const syntheticEdge = this.syntheticEdgeGenerator.getEdge(edge.source(), edge.target());
            if (syntheticEdge) {
              console.log('Adding synthetic edge:', syntheticEdge);
              syntheticEdges = syntheticEdges.add(this.cy.add(syntheticEdge));
              console.log(syntheticEdges);
            }
            edges.push(edge);
            return edges;
          }, [])
        );
      }, []);
      this.cy.remove(this.cy.collection().add(elementsToRemove));
      console.log('Will use:', realLayout);
      const layout = this.cy.layout({
        // Create a new layout
        ...this.options, // Sharing the main options
        name: realLayout, // but using the real layout
        eles: this.cy.elements(), // and the current elements
        realLayout: undefined // We don't want this realLayout stuff in there.
      });
      layout.pon('layoutstop').then(event => {
        // Remove synthetic edges and add removed elements
        console.log('Removing syntheticEdges', syntheticEdges);
        this.cy.remove(syntheticEdges);
        // this.cy.add(this.cy.collection().add(elementsToRemove));
        parents.each(parent => {
          const position = { ...parent.position() };
          console.log('parent position:', position);
          const children = this.cy.add(this.getScratch(parent, CHILDREN_KEY)).map(child => {
            child.position(position);
            console.log('child position:', child.position());
            const boundingBox = child.boundingBox();
            position.y += boundingBox.h + BETWEEN_NODES_PADDING;
            this.setScratch(parent, CHILDREN_KEY, undefined);
            return child;
          });
          console.log(children);
          console.log('scratchPad:', parent.scratch());
        });
        this.cy.add(
          this.cy
            .collection()
            .add(elementsToRemove)
            .edges()
        );
      });
      layout.on('layoutstart layoutready layoutstop', event => {
        (this as any).emit(event);
      });
      layout.run();
    }
  }

  parents() {
    return this.elements.nodes(element => {
      return element.isParent();
    });
  }

  getScratch(element: any, key: string) {
    return element.scratch(NAMESPACE_KEY + key);
  }

  setScratch(element: any, key: string, value: any) {
    element.scratch(NAMESPACE_KEY + key, value);
  }
}
