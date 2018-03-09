import * as React from 'react';
import { ReactCytoscape } from 'react-cytoscape';
import * as API from '../../services/Api';
import PropTypes from 'prop-types';
import { GraphStyles } from './graphs/GraphStyles';

type CytoscapeLayoutState = {
  elements?: any;
};

type CytoscapeLayoutProps = {
  namespace: string;
  layout: any;
};

export default class CytoscapeLayout extends React.Component<CytoscapeLayoutProps, CytoscapeLayoutState> {
  static contextTypes = {
    router: PropTypes.object
  };

  cy: any;

  constructor(props: CytoscapeLayoutProps) {
    super(props);

    console.log('Starting ServiceGraphPage for namespace ' + this.props.namespace);

    this.state = {
      elements: []
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
    if (this.props.namespace.length !== 0) {
      this.updateGraphElements(this.props.namespace);
    }
  }

  componentWillReceiveProps(nextProps: CytoscapeLayoutProps) {
    if (nextProps.namespace !== this.props.namespace) {
      this.updateGraphElements(nextProps.namespace);
    }
  }

  cyRef(cy: any) {
    this.cy = cy;
    cy.on('tap', 'node', (evt: any) => {
      const target = evt.target;
      const targetNode = cy.$id(target.id());
      const svc = targetNode.data('service');
      const service = svc.split('.')[0];
      if (service !== 'internet') {
        this.context.router.history.push('/namespaces/' + this.props.namespace + '/services/' + service);
      }
    });
  }

  render() {
    return (
      <div id="cytoscape-container" style={{ marginRight: '25em' }}>
        <ReactCytoscape
          containerID="cy"
          cyRef={cy => {
            this.cyRef(cy);
          }}
          elements={this.state.elements}
          style={GraphStyles.styles()}
          cytoscapeOptions={GraphStyles.options()}
          layout={this.props.layout}
        />
      </div>
    );
  }

  private updateGraphElements(newNamespace: string) {
    API.GetGraphElements(newNamespace, null)
      .then(response => {
        const elements: { [key: string]: any } = response['data'];
        console.log(elements);
        this.setState(elements);
      })
      .catch(error => {
        this.setState({});
        console.error(error);
      });
  }
}
