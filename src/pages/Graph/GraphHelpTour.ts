import { PopoverPosition } from '@patternfly/react-core';
import { TourStopInfo, TourInfo } from 'components/Tour/TourStop';

export const GraphTourStops: { [name: string]: TourStopInfo } = {
  ContextualMenu: {
    name: 'Contextual Menu',
    description:
      'Right-click a node or an edge to see the contextual menu with links to details, traffic and inbound/outbound metrics for the node or edge.',
    position: PopoverPosition.left,
    offset: '0, 250'
  },
  Display: {
    name: 'Display',
    description:
      'Set edge labeling, node badging, and various display options. Response-time edge labeling, security badging, and traffic animation may affect performance. Response-times reflect the 95th percentile.'
  },
  Find: {
    name: 'Find and Hide',
    description: 'Highlight or Hide graph elements via typed expressions. Click the Find/Hide help icon for details.',
    position: PopoverPosition.bottom
  },
  Graph: {
    name: 'Graph',
    description:
      "Click on a node or edge to see its summary and emphasize its end-to-end paths. Double-click a node to see a graph focused on that node.\nDouble-click an 'external namespace' node to navigate directly to the namespace in the node's text label. Shift-Drag to quickly zoom in.",
    position: PopoverPosition.left,
    offset: '0, 250'
  },
  GraphType: {
    name: 'Graph Type',
    description:
      'Select a workload, service or application graph view. An application view can optionally be versioned and relies on app and version labeling. Workload and service graphs provide physical and logical views, respectively.',
    position: PopoverPosition.right
  },
  Layout: {
    name: 'Layout selection',
    description:
      'Select the graph layout for the mesh. Different layouts work best with different meshes. Find the layout that works best. Other buttons here provide zoom and fit-to-screen options.'
  },
  Legend: {
    name: 'Legend',
    description: 'Display the legend to learn about what the different shapes, colors and backgrounds mean.',
    position: PopoverPosition.top
  },
  Namespaces: {
    name: 'Namespaces',
    description: 'Select the namespaces you want to see in the graph.',
    position: PopoverPosition.bottom
  },
  SidePanel: {
    name: 'Side Panel',
    description: 'The Side Panel shows details about the currently selected node or edge, otherwise the whole graph.',
    position: PopoverPosition.left
  },
  TimeRange: {
    name: 'Time Range & Replay',
    description:
      'Select how often to refresh the graph and how much historical metric data is used to build the graph, per refresh. For example "Last 5m" means use the most recent 5 minutes of request metric data.  To replay a historical time window click the replay icon.  This replaces the current time range controls with the replay toolbar.',
    position: PopoverPosition.left
  }
};

const GraphTour: TourInfo = {
  name: 'GraphTour',
  stops: [
    GraphTourStops.Namespaces,
    GraphTourStops.GraphType,
    GraphTourStops.Display,
    GraphTourStops.Find,
    GraphTourStops.TimeRange,
    GraphTourStops.Graph,
    GraphTourStops.ContextualMenu,
    GraphTourStops.SidePanel,
    GraphTourStops.Layout,
    GraphTourStops.Legend
  ]
};

export default GraphTour;
