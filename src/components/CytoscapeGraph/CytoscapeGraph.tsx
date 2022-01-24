import * as Cy from 'cytoscape';
import { Core, EdgeSingular, NodeSingular } from 'cytoscape';
import * as React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { GraphData } from 'pages/Graph/GraphPage';
import { IntervalInMilliseconds, TimeInMilliseconds } from '../../types/Common';
import {
  BoxByType,
  CLUSTER_DEFAULT,
  CytoscapeBaseEvent,
  CytoscapeEvent,
  CytoscapeGlobalScratchData,
  CytoscapeGlobalScratchNamespace,
  EdgeLabelMode,
  Layout,
  NodeParamsType,
  NodeType,
  RankMode,
  RankResult,
  SummaryData,
  UNKNOWN
} from '../../types/Graph';
import { JaegerTrace } from 'types/JaegerInfo';
import Namespace from '../../types/Namespace';
import { addInfo } from 'utils/AlertUtils';
import { angleBetweenVectors, squaredDistance, normalize } from '../../utils/MathUtils';
import {
  CytoscapeContextMenuWrapper,
  NodeContextMenuComponentType,
  EdgeContextMenuComponentType
} from './CytoscapeContextMenu';
import * as CytoscapeGraphUtils from './CytoscapeGraphUtils';
import { CyNode, isCore, isEdge, isNode } from './CytoscapeGraphUtils';
import { CytoscapeReactWrapper } from './CytoscapeReactWrapper';
import { showTrace, hideTrace } from './CytoscapeTrace';
import EmptyGraphLayout from './EmptyGraphLayout';
import FocusAnimation from './FocusAnimation';
import { GraphHighlighter } from './graphs/GraphHighlighter';
import TrafficRenderer from './TrafficAnimation/TrafficRenderer';
import { serverConfig } from 'config';
import { decoratedNodeData } from './CytoscapeGraphUtils';
import { scoreNodes, ScoringCriteria } from './GraphScore';

type CytoscapeGraphProps = {
  compressOnHide: boolean;
  containerClassName?: string;
  contextMenuEdgeComponent?: EdgeContextMenuComponentType;
  contextMenuNodeComponent?: NodeContextMenuComponentType;
  edgeLabels: EdgeLabelMode[];
  graphData: GraphData;
  focusSelector?: string;
  isMiniGraph: boolean;
  isMTLSEnabled: boolean;
  layout: Layout;
  onEmptyGraphAction?: () => void;
  onNodeDoubleTap?: (e: GraphNodeDoubleTapEvent) => void;
  onEdgeTap?: (e: GraphEdgeTapEvent) => void;
  onNodeTap?: (e: GraphNodeTapEvent) => void;
  onReady?: (cytoscapeRef: any) => void;
  rankBy: RankMode[];
  refreshInterval: IntervalInMilliseconds;
  setActiveNamespaces?: (namespace: Namespace[]) => void;
  setNode?: (node?: NodeParamsType) => void;
  setRankResult?: (result: RankResult) => void;
  setTraceId?: (traceId?: string) => void;
  setUpdateTime?: (val: TimeInMilliseconds) => void;
  showIdleEdges: boolean;
  showIdleNodes: boolean;
  showMissingSidecars: boolean;
  showOperationNodes: boolean;
  showRank: boolean;
  showSecurity: boolean;
  showServiceNodes: boolean;
  showTrafficAnimation: boolean;
  showVirtualServices: boolean;
  summaryData: SummaryData | null;
  toggleIdleNodes: () => void;
  trace?: JaegerTrace;
  updateSummary?: (event: CytoscapeEvent) => void;
};

type CytoscapeGraphState = {
  // Used to trigger updates when the zoom value crosses a threshold and affects label rendering.
  zoomThresholdTime: TimeInMilliseconds;
};

export interface GraphEdgeTapEvent {
  namespace: string;
  type: string;
  source: string;
  target: string;
}

export interface GraphNodeTapEvent {
  aggregate?: string;
  aggregateValue?: string;
  app: string;
  hasMissingSC: boolean;
  isBox?: string;
  isInaccessible: boolean;
  isOutside: boolean;
  isServiceEntry: boolean;
  isIdle: boolean;
  namespace: string;
  nodeType: NodeType;
  service: string;
  version?: string;
  workload: string;
}

export interface GraphNodeDoubleTapEvent extends GraphNodeTapEvent {}

// exporting this class for testing
export default class CytoscapeGraph extends React.Component<CytoscapeGraphProps, CytoscapeGraphState> {
  static contextTypes = {
    router: () => null
  };
  static defaultProps = {
    isMiniGraph: false
  };

  // for hover support
  static hoverInMs = 260;
  static hoverOutMs = 100;
  static mouseInTarget: any;
  static mouseInTimeout: any;
  static mouseOutTimeout: any;

  // for dbl-click support
  static doubleTapMs = 350;
  static tapTarget: any;
  static tapTimeout: any;
  static readonly DataNodeId = 'data-node-id';

  private readonly contextMenuRef: React.RefObject<CytoscapeContextMenuWrapper>;
  private cy?: Cy.Core;
  private customViewport: boolean;
  private cytoscapeReactWrapperRef: any;
  private focusSelector?: string;
  private graphHighlighter?: GraphHighlighter;
  private namespaceChanged: boolean;
  private needsInitialLayout: boolean;
  private nodeChanged: boolean;
  private trafficRenderer?: TrafficRenderer;
  private userBoxSelected?: Cy.Collection;
  private zoom: number; // the current zoom value, used for checking threshold crossing
  private zoomIgnore: boolean; // used to ignore zoom events when cy sometimes generates 'intermediate' values
  private zoomThresholds?: number[];

  constructor(props: CytoscapeGraphProps) {
    super(props);
    this.contextMenuRef = React.createRef<CytoscapeContextMenuWrapper>();
    this.customViewport = false;
    this.cytoscapeReactWrapperRef = React.createRef();
    this.focusSelector = props.focusSelector;
    this.namespaceChanged = false;
    this.needsInitialLayout = false;
    this.nodeChanged = false;
    this.zoom = 1; // 1 is the default cy zoom
    this.zoomIgnore = true; // ignore zoom events prior to the first rendering
    const settings = serverConfig.kialiFeatureFlags.uiDefaults.graph.settings;
    this.zoomThresholds = Array.from(
      new Set([settings.minFontLabel / settings.fontLabel, settings.minFontBadge / settings.fontLabel])
    );

    this.state = { zoomThresholdTime: 0 };
  }

  componentDidMount() {
    this.cyInitialization(this.getCy()!);
  }

  shouldComponentUpdate(nextProps: CytoscapeGraphProps, nextState: CytoscapeGraphState) {
    this.nodeChanged =
      this.nodeChanged || this.props.graphData.fetchParams.node !== nextProps.graphData.fetchParams.node;

    // only update on display changes for the existing graph. Duration or refreshInterval changes don't
    // affect display. Options that trigger a graph refresh will have an update when the refresh
    // completes (showIdleNodes, showSecurity, showServiceNodes, etc).
    let result =
      this.props.edgeLabels !== nextProps.edgeLabels ||
      this.props.graphData.isLoading !== nextProps.graphData.isLoading ||
      this.props.graphData.elements !== nextProps.graphData.elements ||
      this.props.layout !== nextProps.layout ||
      this.props.compressOnHide !== nextProps.compressOnHide ||
      this.props.rankBy !== nextProps.rankBy ||
      this.props.showMissingSidecars !== nextProps.showMissingSidecars ||
      this.props.showRank !== nextProps.showRank ||
      this.props.showTrafficAnimation !== nextProps.showTrafficAnimation ||
      this.props.showVirtualServices !== nextProps.showVirtualServices ||
      this.props.trace !== nextProps.trace ||
      this.state.zoomThresholdTime !== nextState.zoomThresholdTime;

    return result;
  }

  componentDidUpdate(prevProps: CytoscapeGraphProps, _prevState: CytoscapeGraphState) {
    const cy = this.getCy();
    if (!cy) {
      return;
    }
    if (this.props.graphData.isLoading) {
      return;
    }

    // Check to see if we should run a layout when we process the graphUpdate
    let runLayout = false;
    const newLayout = this.props.layout.name !== prevProps.layout.name;
    if (
      this.needsInitialLayout ||
      newLayout ||
      this.nodeNeedsRelayout() ||
      this.namespaceNeedsRelayout(prevProps.graphData.elements, this.props.graphData.elements) ||
      this.elementsNeedRelayout(prevProps.graphData.elements, this.props.graphData.elements)
    ) {
      this.needsInitialLayout = false;
      runLayout = true;
    }

    cy.emit('kiali-zoomignore', [true]);
    this.processGraphUpdate(cy, runLayout, newLayout).then(_response => {
      // pre-select node if provided
      const node = this.props.graphData.fetchParams.node;
      if (node && cy && cy.$(':selected').length === 0) {
        let selector = `[namespace = "${node.namespace.name}"][nodeType = "${node.nodeType}"]`;
        switch (node.nodeType) {
          case NodeType.AGGREGATE:
            selector =
              selector + "[aggregate = '" + node.aggregate! + "'][aggregateValue = '" + node.aggregateValue! + "']";
            break;
          case NodeType.APP:
          case NodeType.BOX: // we only support app box node graphs, treat like an app node
            selector = selector + "[app = '" + node.app + "']";
            if (node.version && node.version !== UNKNOWN) {
              selector = selector + "[version = '" + node.version + "']";
            }
            break;
          case NodeType.SERVICE:
            selector = selector + "[service = '" + node.service + "']";
            break;
          default:
            selector = selector + "[workload = '" + node.workload + "']";
        }

        const eles = cy.nodes(selector);
        if (eles.length > 0) {
          let target = eles[0];
          // default app to the whole app box, when appropriate
          if (
            (node.nodeType === NodeType.APP || node.nodeType === NodeType.BOX) &&
            !node.version &&
            target.isChild() &&
            target.parent()[0].data(CyNode.isBox) === BoxByType.APP
          ) {
            target = target.parent()[0];
          }

          this.selectTargetAndUpdateSummary(target);
        }
      }

      if (this.props.trace) {
        showTrace(cy, this.props.graphData.fetchParams.graphType, this.props.trace);
      } else if (!this.props.trace && prevProps.trace) {
        hideTrace(cy);
      }
    });
  }

  componentWillUnmount() {
    if (CytoscapeGraph.mouseInTimeout) {
      clearTimeout(CytoscapeGraph.mouseInTimeout);
      CytoscapeGraph.mouseInTimeout = null;
    }
    if (CytoscapeGraph.mouseOutTimeout) {
      clearTimeout(CytoscapeGraph.mouseOutTimeout);
      CytoscapeGraph.mouseOutTimeout = null;
    }
  }

  render() {
    return (
      <div id="cytoscape-container" className={this.props.containerClassName}>
        <ReactResizeDetector handleWidth={true} handleHeight={true} skipOnMount={false} onResize={this.onResize} />
        <EmptyGraphLayout
          action={this.props.onEmptyGraphAction}
          elements={this.props.graphData.elements}
          error={this.props.graphData.errorMessage}
          isLoading={this.props.graphData.isLoading}
          isError={!!this.props.graphData.isError}
          isMiniGraph={this.props.isMiniGraph}
          namespaces={this.props.graphData.fetchParams.namespaces}
          showIdleNodes={this.props.showIdleNodes}
          toggleIdleNodes={this.props.toggleIdleNodes}
        >
          <CytoscapeContextMenuWrapper
            ref={this.contextMenuRef}
            contextMenuEdgeComponent={this.props.contextMenuEdgeComponent}
            contextMenuNodeComponent={this.props.contextMenuNodeComponent}
          />
          <CytoscapeReactWrapper ref={e => this.setCytoscapeReactWrapperRef(e)} />
        </EmptyGraphLayout>
      </div>
    );
  }

  getCy(): Cy.Core | null {
    return this.cytoscapeReactWrapperRef.current ? this.cytoscapeReactWrapperRef.current.getCy() : null;
  }

  static buildTapEventArgs(event: CytoscapeEvent): GraphNodeTapEvent | GraphEdgeTapEvent {
    const target = event.summaryTarget;
    const targetType = event.summaryType;
    const targetOrBoxChildren = targetType === 'box' ? target.descendants() : target;

    if (targetType === 'edge') {
      const nodeSource = decoratedNodeData(target.source());
      const nodeTarget = decoratedNodeData(target.target());
      return {
        namespace: nodeSource.namespace,
        type: nodeSource.nodeType,
        source: nodeSource[nodeSource.nodeType],
        target: nodeTarget[nodeTarget.nodeType]
      };
    }
    // Invoke callback
    return {
      aggregate: target.data(CyNode.aggregate),
      aggregateValue: target.data(CyNode.aggregateValue),
      app: target.data(CyNode.app),
      hasMissingSC: targetOrBoxChildren.every(t => t.data(CyNode.hasMissingSC)),
      isBox: target.data(CyNode.isBox),
      isIdle: targetOrBoxChildren.every(t => t.data(CyNode.isIdle)),
      isInaccessible: target.data(CyNode.isInaccessible),
      isOutside: target.data(CyNode.isOutside),
      isServiceEntry: target.data(CyNode.isServiceEntry),
      namespace: target.data(CyNode.namespace),
      nodeType: target.data(CyNode.nodeType),
      service: target.data(CyNode.service),
      version: targetType === 'box' ? undefined : target.data(CyNode.version),
      workload: target.data(CyNode.workload)
    };
  }

  private setCytoscapeReactWrapperRef(cyRef: any) {
    this.cytoscapeReactWrapperRef.current = cyRef;
    this.cyInitialization(this.getCy()!);
  }

  private onResize = () => {
    if (this.cy) {
      this.cy.resize();
      // always fit to the newly sized space
      this.safeFit(this.cy, true);
    }
  };

  private cyInitialization(cy: Cy.Core) {
    if (!cy) {
      return;
    }

    // Caches the cy instance that is currently in use.
    // If that cy instance is the same one we are being asked to initialize, do NOT initialize it again;
    // this would add duplicate callbacks and would screw up the graph highlighter. If, however,
    // we are being asked to initialize a different cy instance, we assume the current one is now obsolete
    // so we do want to initialize the new cy instance.
    if (this.cy === cy) {
      return;
    }
    this.cy = cy;
    this.cy.boxSelectionEnabled(true);

    this.contextMenuRef!.current!.connectCy(this.cy);

    this.graphHighlighter = new GraphHighlighter(cy);
    this.trafficRenderer = new TrafficRenderer(cy);

    const getCytoscapeBaseEvent = (event: Cy.EventObject): CytoscapeBaseEvent | null => {
      const target = event.target;
      if (target === cy) {
        return { summaryType: 'graph', summaryTarget: cy };
      } else if (isNode(target)) {
        if (target.data(CyNode.isBox)) {
          return { summaryType: 'box', summaryTarget: target };
        } else {
          return { summaryType: 'node', summaryTarget: target };
        }
      } else if (isEdge(target)) {
        return { summaryType: 'edge', summaryTarget: target };
      } else {
        return null;
      }
    };

    const findRelatedNode = element => {
      // Skip top-level node, this one has margins that we don't want to consider.
      if (element.getAttribute(CytoscapeGraph.DataNodeId)) {
        return null;
      }
      while (element && element.getAttribute) {
        const dataNodeId = element.getAttribute(CytoscapeGraph.DataNodeId);
        if (dataNodeId) {
          return dataNodeId;
        }
        element = element.parentNode;
      }
      return null;
    };

    cy.on('tap', (event: Cy.EventObject) => {
      // Check if we clicked a label, if so stop processing the event right away.
      if (event.originalEvent) {
        const element = document.elementFromPoint(event.originalEvent.clientX, event.originalEvent.clientY);
        const realTargetId = findRelatedNode(element);
        if (realTargetId) {
          const realTarget = cy.$id(realTargetId);
          if (realTarget) {
            event.preventDefault();
            realTarget.trigger('tap');
            return;
          }
        }
      }

      let tapped: NodeSingular | EdgeSingular | Core | null = event.target;
      if (CytoscapeGraph.tapTimeout) {
        // cancel any single-tap timer in progress
        clearTimeout(CytoscapeGraph.tapTimeout);
        CytoscapeGraph.tapTimeout = null;

        // cancel any active hover timers
        if (CytoscapeGraph.mouseInTimeout) {
          clearTimeout(CytoscapeGraph.mouseInTimeout);
          CytoscapeGraph.mouseInTimeout = null;
        }
        if (CytoscapeGraph.mouseOutTimeout) {
          clearTimeout(CytoscapeGraph.mouseOutTimeout);
          CytoscapeGraph.mouseOutTimeout = null;
        }

        if (tapped === CytoscapeGraph.tapTarget) {
          // if we click the same target again, perform double-tap
          tapped = null;
          CytoscapeGraph.tapTarget = null;
          const cytoscapeEvent = getCytoscapeBaseEvent(event);
          if (cytoscapeEvent) {
            this.handleDoubleTap(cytoscapeEvent);
          }
        }
      }
      if (tapped) {
        // start single-tap timer
        CytoscapeGraph.tapTarget = tapped;
        CytoscapeGraph.tapTimeout = setTimeout(() => {
          // timer expired without a follow-up click, so perform single-tap
          CytoscapeGraph.tapTarget = null;
          const cytoscapeEvent = getCytoscapeBaseEvent(event);
          if (cytoscapeEvent) {
            // ignore if clicking the graph background and this is not the main graph
            if (
              cytoscapeEvent.summaryType === 'graph' &&
              (this.props.isMiniGraph || this.props.graphData.fetchParams.node)
            ) {
              return;
            }

            // if clicking the same target, then unselect it (by re-selecting the graph)
            if (
              this.props.summaryData &&
              cytoscapeEvent.summaryType !== 'graph' &&
              cytoscapeEvent.summaryType === this.props.summaryData.summaryType &&
              cytoscapeEvent.summaryTarget === this.props.summaryData.summaryTarget
            ) {
              this.handleTap({ summaryType: 'graph', summaryTarget: cy } as SummaryData);
              this.selectTarget(cy);
            } else {
              this.handleTap(cytoscapeEvent);
              this.selectTarget(event.target);
            }
          }
        }, CytoscapeGraph.doubleTapMs);
      }
    });

    // Note that at the time of writing (on my chrome) the order of box events:
    // 1) boxstart
    // 2) boxend
    // 3) box, a separate event for each boxselected element
    // The boxselect event never seems to fire. boxend does not seem to supply the boxselected collection (why?).
    // So, boxend seems not useful. I don't see a way to do this other than to 'fit' each time we add an elem.
    cy.on('boxstart', (evt: Cy.EventObject) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);
      if (cytoscapeEvent) {
        this.userBoxSelected = cy.collection();
      }
    });

    cy.on('box', (evt: Cy.EventObject) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);
      if (cytoscapeEvent) {
        const elements: Cy.Collection = evt.target;
        if (elements) {
          elements.forEach(e => {
            if (e.data(CyNode.nodeType) !== NodeType.BOX) {
              this.userBoxSelected = this.userBoxSelected?.add(elements);
            }
          });
          CytoscapeGraphUtils.safeFit(cy, this.userBoxSelected);
          this.customViewport = true;
        }
      }
    });

    cy.on('mouseover', 'node,edge', (evt: Cy.EventObject) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);
      if (!cytoscapeEvent) {
        return;
      }

      // cancel any active mouseOut timer
      if (CytoscapeGraph.mouseOutTimeout) {
        clearTimeout(CytoscapeGraph.mouseOutTimeout);
        CytoscapeGraph.mouseOutTimeout = null;
      }

      // start mouseIn timer
      CytoscapeGraph.mouseInTimeout = setTimeout(() => {
        // timer expired without a mouseout so perform highlighting and show hover contextInfo
        this.handleMouseIn(cytoscapeEvent);
        this.contextMenuRef!.current!.handleContextMenu(cytoscapeEvent.summaryTarget, true);
      }, CytoscapeGraph.hoverInMs);
    });

    cy.on('mouseout', 'node,edge', (evt: Cy.EventObject) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);

      if (!cytoscapeEvent) {
        return;
      }

      // cancel any active mouseIn timer
      if (CytoscapeGraph.mouseInTimeout) {
        clearTimeout(CytoscapeGraph.mouseInTimeout);
        CytoscapeGraph.mouseInTimeout = null;
      }

      // start mouseOut timer
      CytoscapeGraph.mouseOutTimeout = setTimeout(() => {
        // timer expired so remove contextInfo
        this.contextMenuRef!.current!.hideContextMenu(true);
      }, CytoscapeGraph.hoverOutMs);

      // remove highlighting
      this.handleMouseOut(cytoscapeEvent);
    });

    cy.on('viewport', (evt: Cy.EventObject) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);
      if (cytoscapeEvent) {
        this.customViewport = true;
      }
    });

    // 'kiali-fit' is a custom event that we emit allowing us to reset cytoscapeGraph.customViewport
    cy.on('kiali-fit', (evt: Cy.EventObject) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);
      if (cytoscapeEvent) {
        this.customViewport = false;
      }
    });

    // 'kiali-zoomignore' is a custom event that we emit before and after a graph manipulation
    // that can generate unwanted 'intermediate' values (like a CytsoscapeGraphUtils.runLayout()).
    // note - this event does not currently support nesting (i.e. expects true followed by false)
    cy.on('kiali-zoomignore', (evt: Cy.EventObject, zoomIgnore: boolean) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);
      if (cytoscapeEvent) {
        // When ending the zoomIgnore update to the current zoom level to prepare for the next 'zoom' event
        if (!zoomIgnore) {
          this.zoom = cy.zoom();
        }
        this.zoomIgnore = zoomIgnore;
      }
    });

    // Crossing a zoom threshold can affect labeling, and so we need an update to re-render the labels.
    // Some cy 'zoom' events need to be ignored, typically while a layout or drag-zoom 'box' event is
    // in progress, as cy can generate unwanted 'intermediate' values.  So we set zoomIgnore=true, it will
    // be set false after the update.
    cy.on('zoom', (evt: Cy.EventObject) => {
      const cytoscapeEvent = getCytoscapeBaseEvent(evt);
      if (!cytoscapeEvent || this.zoomIgnore) {
        return;
      }

      const oldZoom = this.zoom;
      const newZoom = cy.zoom();
      this.zoom = newZoom;

      const thresholdCrossed = this.zoomThresholds!.some(zoomThresh => {
        return (newZoom < zoomThresh && oldZoom >= zoomThresh) || (newZoom >= zoomThresh && oldZoom < zoomThresh);
      });

      if (thresholdCrossed) {
        // Update state to re-render with the label changes.
        // start a zoomIgnore which will end after the layout (this.processGraphUpdate()) completes.
        this.zoomIgnore = true;
        this.setState({ zoomThresholdTime: Date.now() });
      }
    });

    cy.on('nodehtml-create-or-update', 'node', (evt: Cy.EventObjectNode, data: any) => {
      const { label, isNew } = data;
      const { target } = evt;
      // This is the DOM node of the label, if we want the cyNode it is `target`
      const node = label.getNode();

      // Assign to the label node (the DOM element) an id that matches the cy node.
      // This is so that when we click, we can identify if the clicked label belongs to
      // any cy node and select it
      // Note that we don't add an actual listener to this DOM node. We use the cy click event, this proved to be more
      // stable than adding a listener. As we only want the contents to match and not the whole node (which is bigger).
      if (isNew) {
        node.setAttribute('data-node-id', target.id());
      }

      // Skip root nodes from bounding expansion calculation, their size is defined by their contents, so no point in
      // messing with these values.
      if (target.isParent() && !target.isChild()) {
        return;
      }

      // The code below expands the bounds of a node, taking into consideration the labels. This is important not only
      // for displaying the label, but to avoid nodes overlapping with other labels.
      // We assume that a label is placed centered in the bottom part of a node.
      // The algorithm is:
      // - Take the old bounds-expansion
      // - Get the bounding-box of a node (without taking into account the overlays  i.e. the one that appears on click)
      // - Compute the required extra width as the label width minus the bounding box width
      //   - This will yield a a positive number if we need more space, or negative if we need less space.
      // - Compute the required height as the height of the label. Since the label is at the bottom, we only need that.
      //   If its center was aligned with the center of the node, we would do a similar operation as with the width.
      // - Spread the required width as extra space in the left area and space in the right area of the cy node
      //   (half in each side)
      // - Required height is only needed at the bottom, so we know that we always have to grow at the bottom by this value.

      let oldBE = target.numericStyle('bounds-expansion');
      if (oldBE.length === 1) {
        oldBE = Array(4).fill(oldBE[0]);
      }
      // Do not include the "click" overlay on the bounding box calc
      const bb = target.boundingBox({ includeOverlays: false });
      let newBE = [...oldBE];
      const requiredWidth = node.offsetWidth - bb.w;
      const requiredHeight = node.offsetHeight;
      newBE[1] += requiredWidth * 0.5;
      newBE[3] += requiredWidth * 0.5;
      newBE[2] = requiredHeight;

      // Ensure we don't end with negative values in our bounds-expansion
      newBE = newBE.map(val => Math.max(val, 0));

      const compareBoundsExpansion = (be1: number[], be2: number[]) => {
        if (be1.length !== be2.length) {
          return false;
        }

        const delta = 0.00001;

        for (let i = 0; i < be1.length; ++i) {
          if (Math.abs(be1[i] - be2[i]) > delta) {
            return false;
          }
        }
        return true;
      };

      // Only trigger an update if it really changed, else just skip to avoid this function to call again
      if (!compareBoundsExpansion(oldBE, newBE)) {
        target.style('bounds-expansion', newBE);
      }
    });

    cy.on('layoutstop', (_evt: Cy.EventObject) => {
      console.log('layoutStop');
      // Don't allow a large zoom if the graph has a few nodes (nodes would look too big).
      this.safeFit(cy);
      this.fixLoopOverlap(cy);
    });

    cy.ready((evt: Cy.EventObject) => {
      if (this.props.onReady) {
        this.props.onReady(evt.cy);
      }
      this.needsInitialLayout = true;
    });

    cy.on('destroy', (_evt: Cy.EventObject) => {
      this.trafficRenderer!.stop();
      this.trafficRenderer = undefined;
      this.cy = undefined;
      if (this.props.updateSummary) {
        this.props.updateSummary({ summaryType: 'graph', summaryTarget: undefined });
      }
    });
  }

  private focus(cy: Cy.Core) {
    if (!this.focusSelector) {
      return;
    }

    // only perform the focus one time
    const focusSelector = this.focusSelector;
    this.focusSelector = undefined;

    let selected = cy.$(focusSelector);

    if (!selected) {
      addInfo(
        'Could not focus on requested node. The node may be idle or hidden.',
        true,
        undefined,
        `${focusSelector}`
      );
      return;
    }

    // If there is only one, select it
    if (selected.length === 1) {
      this.selectTargetAndUpdateSummary(selected[0]);
    } else {
      // If we have many elements, try to check if a compound in this query contains everything, if so, select it.
      const compound = selected.filter('$node > node');
      if (compound && compound.length === 1 && selected.subtract(compound).same(compound.children())) {
        this.selectTargetAndUpdateSummary(compound[0]);
        selected = compound;
      }
    }

    // Start animation
    new FocusAnimation(cy).start(selected);
  }

  private safeFit(cy: Cy.Core, force?: boolean) {
    if (!force && this.customViewport) {
      return;
    }
    this.focus(cy);
    CytoscapeGraphUtils.safeFit(cy);
  }

  private processGraphUpdate(cy: Cy.Core, runLayout: boolean, newLayout: boolean): Promise<void> {
    this.trafficRenderer!.pause();

    const isTheGraphSelected = cy.$(':selected').length === 0;

    const globalScratchData: CytoscapeGlobalScratchData = {
      activeNamespaces: this.props.graphData.fetchParams.namespaces,
      edgeLabels: this.props.edgeLabels,
      forceLabels: false,
      graphType: this.props.graphData.fetchParams.graphType,
      homeCluster: serverConfig?.clusterInfo?.name || CLUSTER_DEFAULT,
      showMissingSidecars: this.props.showMissingSidecars,
      showSecurity: this.props.showSecurity,
      showVirtualServices: this.props.showVirtualServices,
      trafficRates: this.props.graphData.fetchParams.trafficRates
    };
    cy.scratch(CytoscapeGlobalScratchNamespace, globalScratchData);

    let elements = this.props.graphData.elements;
    if (this.props.showRank) {
      let scoringCriteria: ScoringCriteria[] = [];
      for (const ranking of this.props.rankBy) {
        if (ranking === RankMode.RANK_BY_INBOUND_EDGES) {
          scoringCriteria.push(ScoringCriteria.InboundEdges);
        }
        if (ranking === RankMode.RANK_BY_OUTBOUND_EDGES) {
          scoringCriteria.push(ScoringCriteria.OutboundEdges);
        }
      }

      let upperBound = 0;
      ({ elements, upperBound } = scoreNodes(this.props.graphData.elements, ...scoringCriteria));
      if (this.props.setRankResult) {
        this.props.setRankResult({ upperBound });
      }
    }

    // don't preserve any user pan/zoom when completely changing the layout
    if (newLayout) {
      this.customViewport = false;
    }

    cy.startBatch();

    // KIALI-1291 issue was caused because some layouts (can't tell if all) do reuse the existing positions.
    // We got some issues when changing from/to cola/cose, as the nodes started to get far away from each other.
    // Previously we deleted the nodes prior to a layout update, this was too much and it seems that only resetting the
    // positions to 0,0 makes the layout more predictable.
    if (runLayout) {
      cy.nodes().positions({ x: 0, y: 0 });
    }

    // update the entire set of nodes and edges to keep the graph up-to-date
    cy.json({ elements: elements });

    cy.endBatch();

    // Run layout outside of the batch operation for it to take effect on the new nodes,
    // Layouts can run async so wait until it completes to finish the graph update.
    if (runLayout) {
      return new Promise((resolve, _reject) => {
        CytoscapeGraphUtils.runLayout(cy, this.props.layout).then(_response => {
          console.log('endLayout');
          this.finishGraphUpdate(cy, isTheGraphSelected, newLayout);
          resolve();
        });
      });
    } else {
      this.finishGraphUpdate(cy, isTheGraphSelected, newLayout);
      return Promise.resolve();
    }
  }

  private finishGraphUpdate(cy: Cy.Core, isTheGraphSelected: boolean, newLayout: boolean) {
    // For reasons unknown, box label positions can be wrong after a graph update.
    // It seems limited to outer nested compound nodes and looks like a cy bug to me,
    // but maybe it has to do with either the html node-label extension, or our BoxLayout.
    // Anyway, refreshing them here seems to fix the positioning (for now, just refresh
    // box nodes, but we may find the need to do all nodes).
    (cy as any).nodeHtmlLabel().updateNodeLabel(cy.nodes(':parent'));
    /*
    let nodes = cy.nodes('[^isBox]:visible');
    while (nodes.length > 0) {
      (cy as any).nodeHtmlLabel().updateNodeLabel(nodes);
      nodes = nodes.parents();
    }
    */

    // We opt-in for manual selection to be able to control when to select a node/edge
    // https://github.com/cytoscape/cytoscape.js/issues/1145#issuecomment-153083828
    cy.nodes().unselectify();
    cy.edges().unselectify();

    // Verify our current selection is still valid, if not, select the graph
    if (!isTheGraphSelected && cy.$(':selected').length === 0) {
      this.handleTap({ summaryType: 'graph', summaryTarget: cy });
    }

    // When the update is complete, re-enable zoom changes.
    cy.emit('kiali-zoomignore', [false]);

    if (newLayout) {
      // CytoscapeGraphUtils.safeFit(cy);
    }

    if (this.props.showTrafficAnimation) {
      this.trafficRenderer!.start(cy.edges());
    }

    // notify that the graph has been updated
    if (this.props.setUpdateTime) {
      this.props.setUpdateTime(Date.now());
    }
  }

  private selectTarget = (target?: Cy.NodeSingular | Cy.EdgeSingular | Cy.Core) => {
    if (this.cy) {
      this.cy.$(':selected').selectify().unselect().unselectify();
      if (target && !isCore(target)) {
        target.selectify().select().unselectify();
      }
    }
  };

  private selectTargetAndUpdateSummary = (target: Cy.NodeSingular | Cy.EdgeSingular) => {
    this.selectTarget(target);
    const event: CytoscapeEvent = {
      summaryType: target.data(CyNode.isBox) ? 'box' : 'node',
      summaryTarget: target
    };
    if (this.props.updateSummary) {
      this.props.updateSummary(event);
    }
    this.graphHighlighter!.onClick(event);
  };

  private handleDoubleTap = (event: CytoscapeEvent) => {
    if (this.props.onNodeDoubleTap && CytoscapeGraph.isCyNodeClickEvent(event)) {
      this.props.onNodeDoubleTap(CytoscapeGraph.buildTapEventArgs(event) as GraphNodeTapEvent);
    }
  };

  private handleTap = (event: CytoscapeEvent) => {
    if (this.props.updateSummary) {
      this.props.updateSummary(event);
    }

    if (this.props.onNodeTap && CytoscapeGraph.isCyNodeClickEvent(event)) {
      this.props.onNodeTap(CytoscapeGraph.buildTapEventArgs(event) as GraphNodeTapEvent);
    }

    if (!this.props.isMiniGraph) {
      this.graphHighlighter!.onClick(event);
    } else if (this.props.onEdgeTap && CytoscapeGraph.isCyEdgeClickEvent(event)) {
      this.props.onEdgeTap(CytoscapeGraph.buildTapEventArgs(event) as GraphEdgeTapEvent);
    }
  };

  private handleMouseIn = (event: CytoscapeEvent) => {
    this.graphHighlighter!.onMouseIn(event);
  };

  private handleMouseOut = (event: CytoscapeEvent) => {
    this.graphHighlighter!.onMouseOut(event);
  };

  private namespaceNeedsRelayout(prevElements: any, nextElements: any) {
    const needsRelayout = this.namespaceChanged && prevElements !== nextElements;
    if (needsRelayout) {
      this.namespaceChanged = false;
    }
    return needsRelayout;
  }

  private nodeNeedsRelayout() {
    const needsRelayout = this.nodeChanged;
    if (needsRelayout) {
      this.nodeChanged = false;
    }
    return needsRelayout;
  }

  static isCyNodeClickEvent(event: CytoscapeEvent): boolean {
    const targetType = event.summaryType;
    if (targetType !== 'node' && targetType !== 'box') {
      return false;
    }

    return true;
  }

  static isCyEdgeClickEvent(event: CytoscapeEvent): boolean {
    const targetType = event.summaryType;
    return targetType === 'edge';
  }

  // To know if we should re-layout, we need to know if any element changed
  // Do a quick round by comparing the number of nodes and edges, if different
  // a change is expected.
  // If we have the same number of elements, compare the ids, if we find one that isn't
  // in the other, we can be sure that there are changes.
  // Worst case is when they are the same, avoid that.
  private elementsNeedRelayout(prevElements: any, nextElements: any) {
    if (prevElements === nextElements) {
      return false;
    }
    if (
      !prevElements ||
      !nextElements ||
      !prevElements.nodes ||
      !prevElements.edges ||
      !nextElements.nodes ||
      !nextElements.edges ||
      prevElements.nodes.length !== nextElements.nodes.length ||
      prevElements.edges.length !== nextElements.edges.length
    ) {
      return true;
    }
    // If both have the same ids, we don't need to relayout
    return !(
      this.nodeOrEdgeArrayHasSameIds(nextElements.nodes, prevElements.nodes) &&
      this.nodeOrEdgeArrayHasSameIds(nextElements.edges, prevElements.edges)
    );
  }

  private nodeOrEdgeArrayHasSameIds<T extends Cy.NodeSingular | Cy.EdgeSingular>(a: Array<T>, b: Array<T>) {
    const aIds = a.map(e => e.id).sort();
    return b
      .map(e => e.id)
      .sort()
      .every((eId, index) => eId === aIds[index]);
  }

  private fixLoopOverlap(cy: Cy.Core) {
    cy.$(':loop').forEach(loop => {
      const node = loop.source();
      const otherEdges = node.connectedEdges().subtract(loop);
      const minDistance = 1;

      // Default values in rads (taken from cytoscape docs)
      const DEFAULT_LOOP_SWEEP = -1.5707;
      const DEFAULT_LOOP_DIRECTION = -0.7854;

      loop.style('loop-direction', DEFAULT_LOOP_DIRECTION);
      loop.style('loop-sweep', DEFAULT_LOOP_SWEEP);

      let found = false;
      // Check if we have any other edge that overlaps with any of our loop edges
      // this uses cytoscape forEach (https://js.cytoscape.org/#eles.forEach)
      otherEdges.forEach(edge => {
        const testPoint = edge.source().same(node) ? edge.sourceEndpoint() : edge.targetEndpoint();
        if (
          squaredDistance(testPoint, loop.sourceEndpoint()) <= minDistance ||
          squaredDistance(testPoint, loop.targetEndpoint()) <= minDistance
        ) {
          found = true;
          return false; // break the inner cytoscape forEach
        }
        return; // return to avoid typescript error about "not all code paths return a value"
      });

      if (!found) {
        return;
      }

      // Simple case, one other edge, just move the loop-direction half the default loop-sweep value to avoid the edge
      if (otherEdges.length === 1) {
        const loopDirection = loop.numericStyle('loop-direction') - loop.numericStyle('loop-sweep') * 0.5;
        loop.style('loop-direction', loopDirection);
        return;
      }

      // Compute every angle between the top (12 o’clock position)
      // We store the angles as radians and positive numbers, thus we add PI to the negative angles.
      const usedAngles: number[] = [];
      otherEdges.forEach(edge => {
        const testPoint = edge.source().same(node) ? edge.sourceEndpoint() : edge.targetEndpoint();
        const angle = angleBetweenVectors(
          normalize({ x: testPoint.x - node.position().x, y: testPoint.y - node.position().y }),
          { x: 0, y: 1 }
        );
        usedAngles.push(angle < 0 ? angle + 2 * Math.PI : angle);
      });

      usedAngles.sort((a, b) => a - b);

      // Try to fit our loop in the longest arc
      // Iterate over the found angles and find the longest distance
      let maxArc = {
        start: 0,
        end: 0,
        value: 0
      };
      for (let i = 0; i < usedAngles.length; ++i) {
        const start = i === 0 ? usedAngles[usedAngles.length - 1] : usedAngles[i - 1];
        const end = usedAngles[i];
        const arc = Math.abs(start - end);
        if (arc > maxArc.value) {
          maxArc.value = arc;
          maxArc.start = start;
          maxArc.end = end;
        }
      }

      // If the max arc is 1.0 radians (the biggest gap is of about 50 deg), the node is already too busy, ignore it
      if (maxArc.value < 1.0) {
        return;
      }

      if (maxArc.start > maxArc.end) {
        // To ensure the difference between end and start goes in the way we want, we add a full circle to our end
        maxArc.end += Math.PI * 2;
      }

      if (maxArc.value <= -DEFAULT_LOOP_SWEEP) {
        // Make it slightly smaller to be able to fit
        // loop-sweep is related to the distance between the start and end of our loop edge
        loop.style('loop-sweep', -maxArc.value * 0.9);
        maxArc.start += maxArc.value * 0.05;
        maxArc.end -= maxArc.value * 0.05;
      }
      // Move the loop to the center of the arc, loop-direction is related to the middle point of the loop
      loop.style('loop-direction', maxArc.start + (maxArc.end - maxArc.start) * 0.5);
    });
  }
}
