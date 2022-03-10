import * as React from 'react';
import * as Cy from 'cytoscape';
import { Button, Toolbar, ToolbarItem, Tooltip, TooltipPosition } from '@patternfly/react-core';
import {
  LongArrowAltRightIcon,
  ExpandArrowsAltIcon,
  MapIcon,
  PficonDragdropIcon,
  TenantIcon,
  TopologyIcon
} from '@patternfly/react-icons';
import { style } from 'typestyle';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from '../../store/Store';
import { PFColors } from '../Pf/PfColors';
import * as CytoscapeGraphUtils from './CytoscapeGraphUtils';
import { EdgeMode, Layout } from '../../types/Graph';
import { KialiAppAction } from '../../actions/KialiAppAction';
import { GraphActions } from '../../actions/GraphActions';
import { HistoryManager, URLParam } from '../../app/History';
import * as LayoutDictionary from './graphs/LayoutDictionary';
import { GraphToolbarActions } from '../../actions/GraphToolbarActions';
import { GraphTourStops } from 'pages/Graph/GraphHelpTour';
import TourStopContainer from 'components/Tour/TourStop';
import { edgeModeSelector } from 'store/Selectors';
import { KialiDagreGraph } from './graphs/KialiDagreGraph';
import { KialiGridGraph } from './graphs/KialiGridGraph';
import { KialiConcentricGraph } from './graphs/KialiConcentricGraph';
import { KialiBreadthFirstGraph } from './graphs/KialiBreadthFirstGraph';

type ReduxProps = {
  edgeMode: EdgeMode;
  boxByNamespace: boolean;
  layout: Layout;
  namespaceLayout: Layout;
  showLegend: boolean;

  setEdgeMode: (edgeMode: EdgeMode) => void;
  setLayout: (layout: Layout) => void;
  setNamespaceLayout: (layout: Layout) => void;
  toggleLegend: () => void;
};

type CytoscapeToolbarProps = ReduxProps & {
  cytoscapeGraphRef: any;
  disabled: boolean;
};

type CytoscapeToolbarState = {
  allowGrab: boolean;
};

const buttonStyle = style({
  backgroundColor: PFColors.White,
  marginBottom: '2px',
  marginLeft: '4px',
  padding: '3px 8px'
});
const activeButtonStyle = style({
  color: PFColors.Active
});
const cytoscapeToolbarStyle = style({
  width: '20px'
});

export class CytoscapeToolbar extends React.PureComponent<CytoscapeToolbarProps, CytoscapeToolbarState> {
  constructor(props: CytoscapeToolbarProps) {
    super(props);
    // Let URL override current redux state at construction time. Update URL with unset params.
    const urlLayout = HistoryManager.getParam(URLParam.GRAPH_LAYOUT);
    if (urlLayout) {
      if (urlLayout !== props.layout.name) {
        props.setLayout(LayoutDictionary.getLayoutByName(urlLayout));
      }
    } else {
      HistoryManager.setParam(URLParam.GRAPH_LAYOUT, props.layout.name);
    }

    const urlNamespaceLayout = HistoryManager.getParam(URLParam.GRAPH_NAMESPACE_LAYOUT);
    if (urlNamespaceLayout) {
      if (urlNamespaceLayout !== props.namespaceLayout.name) {
        props.setNamespaceLayout(LayoutDictionary.getLayoutByName(urlNamespaceLayout));
      }
    } else {
      HistoryManager.setParam(URLParam.GRAPH_NAMESPACE_LAYOUT, props.namespaceLayout.name);
    }

    this.state = { allowGrab: false };
  }

  componentDidMount() {
    // Toggle drag once when component is initialized
    this.toggleDrag();
  }

  componentDidUpdate() {
    // ensure redux state and URL are aligned
    HistoryManager.setParam(URLParam.GRAPH_LAYOUT, this.props.layout.name);
    HistoryManager.setParam(URLParam.GRAPH_NAMESPACE_LAYOUT, this.props.namespaceLayout.name);
  }

  render() {
    return (
      <Toolbar className={cytoscapeToolbarStyle}>
        <ToolbarItem>
          <Tooltip content={this.state.allowGrab ? 'Disable Drag' : 'Enable Drag'} position={TooltipPosition.right}>
            <Button
              id="toolbar_grab"
              aria-label="Toggle Drag"
              className={buttonStyle}
              variant="plain"
              onClick={() => this.toggleDrag()}
              isActive={this.state.allowGrab}
            >
              <PficonDragdropIcon className={this.state.allowGrab ? activeButtonStyle : undefined} />
            </Button>
          </Tooltip>
        </ToolbarItem>
        <ToolbarItem>
          <Tooltip content="Zoom to Fit" position={TooltipPosition.right}>
            <Button
              id="toolbar_graph_fit"
              aria-label="Zoom to Fit"
              className={buttonStyle}
              variant="plain"
              onClick={() => this.fit()}
            >
              <ExpandArrowsAltIcon />
            </Button>
          </Tooltip>
        </ToolbarItem>
        <ToolbarItem>
          <Tooltip content="Hide healthy edges" position={TooltipPosition.right}>
            <Button
              id="toolbar_edge_mode_unhealthy"
              aria-label="Hide Healthy Edges"
              className={buttonStyle}
              variant="plain"
              onClick={() => {
                this.handleEdgeModeClick(EdgeMode.UNHEALTHY);
              }}
              isActive={this.props.edgeMode === EdgeMode.UNHEALTHY}
            >
              <LongArrowAltRightIcon
                className={this.props.edgeMode === EdgeMode.UNHEALTHY ? activeButtonStyle : undefined}
              />
            </Button>
          </Tooltip>
        </ToolbarItem>
        <ToolbarItem>
          <Tooltip content="Hide all edges" position={TooltipPosition.right}>
            <Button
              id="toolbar_edge_mode_none"
              aria-label="Hide All Edges"
              className={buttonStyle}
              variant="plain"
              onClick={() => {
                this.handleEdgeModeClick(EdgeMode.NONE);
              }}
              isActive={this.props.edgeMode === EdgeMode.NONE}
            >
              <LongArrowAltRightIcon
                className={this.props.edgeMode === EdgeMode.NONE ? activeButtonStyle : undefined}
              />
            </Button>
          </Tooltip>
        </ToolbarItem>

        <ToolbarItem>
          <Tooltip content={'Layout default ' + KialiDagreGraph.getLayout().name} position={TooltipPosition.right}>
            <Button
              id="toolbar_layout_default"
              aria-label="Graph Layout Default Style"
              className={buttonStyle}
              isActive={this.props.layout.name === KialiDagreGraph.getLayout().name}
              isDisabled={this.props.disabled}
              onClick={() => {
                this.setLayout(KialiDagreGraph.getLayout());
              }}
              variant="plain"
            >
              <TopologyIcon
                className={this.props.layout.name === KialiDagreGraph.getLayout().name ? activeButtonStyle : undefined}
              />
            </Button>
          </Tooltip>
        </ToolbarItem>

        <TourStopContainer info={GraphTourStops.Layout}>
          <ToolbarItem>
            <Tooltip content={'Layout 1 ' + KialiGridGraph.getLayout().name} position={TooltipPosition.right}>
              <Button
                id="toolbar_layout1"
                aria-label="Graph Layout Style 1"
                className={buttonStyle}
                isActive={this.props.layout.name === KialiGridGraph.getLayout().name}
                isDisabled={this.props.disabled}
                onClick={() => {
                  this.setLayout(KialiGridGraph.getLayout());
                }}
                variant="plain"
              >
                <TopologyIcon
                  className={this.props.layout.name === KialiGridGraph.getLayout().name ? activeButtonStyle : undefined}
                />
              </Button>
            </Tooltip>
          </ToolbarItem>
        </TourStopContainer>

        <ToolbarItem>
          <Tooltip content={'Layout 2 ' + KialiConcentricGraph.getLayout().name} position={TooltipPosition.right}>
            <Button
              id="toolbar_layout2"
              aria-label="Graph Layout Style 2"
              className={buttonStyle}
              isActive={this.props.layout.name === KialiConcentricGraph.getLayout().name}
              isDisabled={this.props.disabled}
              onClick={() => {
                this.setLayout(KialiConcentricGraph.getLayout());
              }}
              variant="plain"
            >
              <TopologyIcon
                className={
                  this.props.layout.name === KialiConcentricGraph.getLayout().name ? activeButtonStyle : undefined
                }
              />
            </Button>
          </Tooltip>
        </ToolbarItem>

        <ToolbarItem>
          <Tooltip content={'Layout 3 ' + KialiBreadthFirstGraph.getLayout().name} position={TooltipPosition.right}>
            <Button
              id="toolbar_layout3"
              aria-label="Graph Layout Style 3"
              className={buttonStyle}
              isActive={this.props.layout.name === KialiBreadthFirstGraph.getLayout().name}
              isDisabled={this.props.disabled}
              onClick={() => {
                this.setLayout(KialiBreadthFirstGraph.getLayout());
              }}
              variant="plain"
            >
              <TopologyIcon
                className={
                  this.props.layout.name === KialiBreadthFirstGraph.getLayout().name ? activeButtonStyle : undefined
                }
              />
            </Button>
          </Tooltip>
        </ToolbarItem>

        {this.props.boxByNamespace && (
          <ToolbarItem>
            <Tooltip
              content={'Namespace Layout 1 ' + KialiDagreGraph.getLayout().name}
              position={TooltipPosition.right}
            >
              <Button
                id="toolbar_namespace_layout1"
                aria-label="Namespace Layout Style 1"
                className={buttonStyle}
                isActive={this.props.namespaceLayout.name === KialiDagreGraph.getLayout().name}
                isDisabled={this.props.disabled}
                onClick={() => {
                  this.setNamespaceLayout(KialiDagreGraph.getLayout());
                }}
                variant="plain"
              >
                <TenantIcon
                  className={
                    this.props.namespaceLayout.name === KialiDagreGraph.getLayout().name ? activeButtonStyle : undefined
                  }
                />
              </Button>
            </Tooltip>
          </ToolbarItem>
        )}

        {this.props.boxByNamespace && (
          <ToolbarItem>
            <Tooltip
              content={'Namespace Layout 2 ' + KialiBreadthFirstGraph.getLayout().name}
              position={TooltipPosition.right}
            >
              <Button
                id="toolbar_namespace_layout2"
                aria-label="Namespace Layout Style 2"
                className={buttonStyle}
                isActive={this.props.namespaceLayout.name === KialiBreadthFirstGraph.getLayout().name}
                isDisabled={this.props.disabled}
                onClick={() => {
                  this.setNamespaceLayout(KialiBreadthFirstGraph.getLayout());
                }}
                variant="plain"
              >
                <TenantIcon
                  className={
                    this.props.namespaceLayout.name === KialiBreadthFirstGraph.getLayout().name
                      ? activeButtonStyle
                      : undefined
                  }
                />
              </Button>
            </Tooltip>
          </ToolbarItem>
        )}

        <TourStopContainer info={GraphTourStops.Legend}>
          <ToolbarItem>
            <Tooltip content="Show Legend" position={TooltipPosition.right}>
              <Button
                id="toolbar_toggle_legend"
                aria-label="Show Legend"
                className={buttonStyle}
                variant="plain"
                onClick={this.props.toggleLegend}
                isActive={this.props.showLegend}
              >
                <MapIcon className={this.props.showLegend ? activeButtonStyle : undefined} size="sm" />
              </Button>
            </Tooltip>
          </ToolbarItem>
        </TourStopContainer>
      </Toolbar>
    );
  }

  private getCy = (): Cy.Core | null => {
    if (this.props.cytoscapeGraphRef.current) {
      return this.props.cytoscapeGraphRef.current.getCy();
    }
    return null;
  };

  private toggleDrag = () => {
    const cy = this.getCy();
    if (!cy) {
      return;
    }
    cy.autoungrabify(this.state.allowGrab);
    this.setState({ allowGrab: !this.state.allowGrab });
  };

  private fit = () => {
    const cy = this.getCy();
    if (cy) {
      CytoscapeGraphUtils.safeFit(cy);
    }
  };

  private handleEdgeModeClick = (edgeMode: EdgeMode) => {
    this.props.setEdgeMode(edgeMode === this.props.edgeMode ? EdgeMode.ALL : edgeMode);
  };

  private setLayout = (layout: Layout) => {
    if (layout.name !== this.props.layout.name) {
      this.props.setLayout(layout);
    }
  };

  private setNamespaceLayout = (layout: Layout) => {
    if (layout.name !== this.props.namespaceLayout.name) {
      this.props.setNamespaceLayout(layout);
    }
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  edgeMode: edgeModeSelector(state),
  boxByNamespace: state.graph.toolbarState.boxByNamespace,
  layout: state.graph.layout,
  namespaceLayout: state.graph.namespaceLayout,
  showLegend: state.graph.toolbarState.showLegend
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  setEdgeMode: bindActionCreators(GraphActions.setEdgeMode, dispatch),
  setLayout: bindActionCreators(GraphActions.setLayout, dispatch),
  setNamespaceLayout: bindActionCreators(GraphActions.setNamespaceLayout, dispatch),
  toggleLegend: bindActionCreators(GraphToolbarActions.toggleLegend, dispatch)
});

const CytoscapeToolbarContainer = connect(mapStateToProps, mapDispatchToProps)(CytoscapeToolbar);
export default CytoscapeToolbarContainer;
