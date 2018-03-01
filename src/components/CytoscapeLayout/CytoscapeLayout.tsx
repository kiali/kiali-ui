import * as React from 'react';
import { ReactCytoscape } from 'react-cytoscape';
import { CytoscapeConfig } from './CytoscapeConfig';
import * as API from '../../services/Api';

type CytoscapeLayoutState = {
  elements?: any;
};

type CytoscapeLayoutProps = {
  // none yet
  namespace: any;
};

export default class CytoscapeLayout extends React.Component<CytoscapeLayoutProps, CytoscapeLayoutState> {
  cy: any;

  constructor(props: CytoscapeLayoutProps) {
    super(props);

    console.log('Starting ServiceGraphPage for namespace ' + this.props.namespace);

    this.state = {
      // We need to set the node to empty, otherwise it wont render an empty set properly
      elements: { nodes: [] }
    };
  }

  resizeWindow() {
    let canvasWrapper = document.getElementById('cytoscape-container')!;

    if (canvasWrapper != null) {
      let dimensions = canvasWrapper.getBoundingClientRect();
      canvasWrapper.style.height = `${document.documentElement.scrollHeight - dimensions.top}px`;
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeWindow);
    this.resizeWindow();

    API.GetGraphElements(this.props.namespace, null)
      .then(response => {
        const elements: { [key: string]: any } = response['data'];
        console.log(elements);
        this.setState(elements);

        let canvasWrapper = document.getElementById('cytoscape-container')!;
        if (canvasWrapper != null) {
          canvasWrapper.style.display = null;
        }
        let messageWrapper = document.getElementById('empty-graph')!;
        if (messageWrapper != null) {
          messageWrapper.style.display = 'none';
        }
      })
      .catch(error => {
        this.setState({});

        let messageWrapper = document.getElementById('empty-graph')!;
        if (messageWrapper != null) {
          messageWrapper.innerHTML = 'Error Fetching Service Graph';
        }

        console.error(error);
      });
  }

  cyRef(cy: any) {
    this.cy = cy;
    cy.on('tap', 'node', (evt: any) => {
      let node = evt.target;
      console.log('clicked on: ' + node.id());
    });
  }

  render() {
    return (
      <div>
        <div id="cytoscape-container" style={{ display: 'none' }}>
          <ReactCytoscape
            containerID="cy"
            cyRef={cy => {
              this.cyRef(cy);
            }}
            elements={this.state.elements}
            style={CytoscapeConfig.getStyles()}
            cytoscapeOptions={{ wheelSensitivity: 0.1, autounselectify: false }}
            layout={{
              name: 'breadthfirst',
              directed: 'true',
              maximalAdjustments: 2,
              spacingFactor: 1
            }}
          />
        </div>
        <div id="empty-graph">Fetching Service Graph...</div>
      </div>
    );
  }
}
