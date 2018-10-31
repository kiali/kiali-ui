const NAMESPACE_KEY = '_group_compound_layout';
const CHILDREN_KEY = 'children';
const STYLES_KEY = 'styles';
const PADDING_WIDTH = 5;
const BETWEEN_NODES_PADDING = 3;

const normalizeToParent = element => {
  return element.isChild() ? element.parent() : element;
};

interface OverridenStyles {
  shape: string;
  width: string;
  height: string;
}

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
}

interface CompoundLayout {
  boundingBox(compound: any);
  layout(compound: any);
}

class VerticalLayout implements CompoundLayout {
  boundingBox(compound: any) {
    return compound.children().reduce(
      (accBoundingBox, child) => {
        // This will produce a vertical layout for the compound contents
        const localBoundingBox = child.boundingBox();
        accBoundingBox.height += localBoundingBox.h;
        accBoundingBox.width = Math.max(accBoundingBox.width, localBoundingBox.w + PADDING_WIDTH);
        return accBoundingBox;
      },
      { width: 0, height: 0 }
    );
  }

  layout(compound: any) {
    const position = { x: 0, y: 0 };
    compound.children().each(child => {
      child.relativePosition(position);
      const boundingBox = child.boundingBox();
      position.y += boundingBox.h + BETWEEN_NODES_PADDING;
    });
  }
}

export default class GroupCompoundLayout {
  readonly options;
  readonly cy;
  readonly elements;
  readonly syntheticEdgeGenerator;
  readonly compoundLayout;

  constructor(options: any) {
    this.options = { ...options };
    this.cy = this.options.cy;
    this.elements = this.options.eles;
    this.syntheticEdgeGenerator = new SyntheticEdgeGenerator();
    this.compoundLayout = new VerticalLayout();
  }

  run() {
    const { realLayout } = this.options;
    const parents = this.parents();
    if (parents.length > 0) {
      // Prepare parents by assigning a width and height
      parents.each(parent => {
        const boundingBox = this.compoundLayout.boundingBox(parent);
        const backupStyles: OverridenStyles = {
          shape: parent.style('shape'),
          height: parent.style('height'),
          width: parent.style('width')
        };

        const newStyles: OverridenStyles = {
          shape: 'rectangle',
          height: `${boundingBox.height}px`,
          width: `${boundingBox.width}px`
        };
        this.setScratch(parent, STYLES_KEY, backupStyles);
        parent.style(newStyles);
        this.setScratch(parent, CHILDREN_KEY, parent.children().jsons());
      });

      // Remove the children and its edges and add synthetic edges for every edge that touches a child node.
      let syntheticEdges = this.cy.collection();
      const elementsToRemove = parents.children().reduce((children, child) => {
        children.push(child);
        return children.concat(
          child.connectedEdges().reduce((edges, edge) => {
            const syntheticEdge = this.syntheticEdgeGenerator.getEdge(edge.source(), edge.target());
            if (syntheticEdge) {
              syntheticEdges = syntheticEdges.add(this.cy.add(syntheticEdge));
            }
            edges.push(edge);
            return edges;
          }, [])
        );
      }, []);
      this.cy.remove(this.cy.collection().add(elementsToRemove));

      const layout = this.cy.layout({
        // Create a new layout
        ...this.options, // Sharing the main options
        name: realLayout, // but using the real layout
        eles: this.cy.elements(), // and the current elements
        realLayout: undefined // We don't want this realLayout stuff in there.
      });

      // Add a callback once the layout stops
      layout.one('layoutstop', event => {
        // Remove synthetic edges
        this.cy.remove(syntheticEdges);

        // Add and position the children nodes according to the layout
        parents.each(parent => {
          this.cy.add(this.getScratch(parent, CHILDREN_KEY));
          this.compoundLayout.layout(parent);
          parent.style(this.getScratch(parent, STYLES_KEY));

          this.setScratch(parent, CHILDREN_KEY, undefined);
          this.setScratch(parent, STYLES_KEY, undefined);
        });
        // Add the real edges
        this.cy.add(
          this.cy
            .collection()
            .add(elementsToRemove)
            .edges()
        );
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
