import * as React from 'react';
import { ReactCytoscape } from 'react-cytoscape';
import { Spinner } from 'patternfly-react';
import PropTypes from 'prop-types';

import * as API from '../../services/Api';
import { GraphStyles } from './graphs/GraphStyles';
import { GraphHighlighter } from './graphs/GraphHighlighter';
import { refreshSettings } from '../../model/RefreshSettings';

type CytoscapeLayoutProps = {
  namespace: string;
  layout: any;
  interval: string;
  onClick: PropTypes.func;
};

type CytoscapeLayoutState = {
  elements?: any;
  isLoading: boolean;
};

export default class CytoscapeLayout extends React.Component<CytoscapeLayoutProps, CytoscapeLayoutState> {
  static contextTypes = {
    router: PropTypes.object
  };

  cy: any;
  timerID: any;
  graphHighlighter: GraphHighlighter;

  constructor(props: CytoscapeLayoutProps) {
    super(props);

    console.log('Starting ServiceGraphPage for namespace ' + this.props.namespace);

    this.state = {
      elements: [],
      isLoading: false
    };
    this.updateGraphElements = this.updateGraphElements.bind(this);
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
      this.updateGraphElements(this.props);
      this.timerID = setInterval(() => this.updateGraphElements(this.props), refreshSettings.interval);
    }
  }

  componentWillReceiveProps(nextProps: CytoscapeLayoutProps) {
    if (nextProps.namespace !== this.props.namespace || nextProps.interval !== this.props.interval) {
      this.updateGraphElements(nextProps);
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  cyRef(cy: any) {
    this.cy = cy;
    this.graphHighlighter = new GraphHighlighter(cy);

    cy.on('tap', (evt: any) => {
      const target = evt.target;
      if (target === cy) {
        console.log('TAP Background');
        this.props.onClick({ summaryType: 'graph', summaryTarget: cy });
      } else if (target.isNode()) {
        if (target.data('groupBy') === 'version') {
          console.log('TAP Group');
          this.props.onClick({ summaryType: 'group', summaryTarget: target });
        } else {
          console.log('TAP node');
          this.props.onClick({ summaryType: 'node', summaryTarget: target });
        }
      } else if (target.isEdge()) {
        console.log('TAP edge');
        this.props.onClick({ summaryType: 'edge', summaryTarget: target });
      } else {
        console.log('TAP UNHANDLED');
      }
    });
  }

  render() {
    return (
      <div id="cytoscape-container" style={{ marginRight: '25em' }}>
        <Spinner loading={this.state.isLoading}>
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
        </Spinner>
      </div>
    );
  }

  updateGraphElements(props: any) {
    let params = { interval: props.interval };
    this.setState({ isLoading: true });
    API.GetGraphElements(props.namespace, params)
      .then(response => {
        const elements =
          response['data'] && response['data'].elements ? response['data'].elements : { nodes: [], edges: [] };
        this.setState({ elements: elements, isLoading: false });
      })
      .catch(error => {
        this.setState({
          elements: [],
          isLoading: false
        });
        console.error(error);
      });
  }
}
