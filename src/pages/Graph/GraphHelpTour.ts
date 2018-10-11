import { Step, StepPlacement } from '../../components/Tour/Tour';

const GraphHelpTour: Array<Step> = [
  {
    placement: StepPlacement.BOTTOM_START,
    target: '#namespace-selector',
    name: 'Namespace',
    description: 'Select the namespace you want to view.'
  },
  {
    target: '#graph_settings',
    name: 'Display',
    description: 'Toggle various display options such as badging traffic animation, and service nodes.'
  },
  {
    target: '#graph_filter_edge_labels',
    name: 'Edge Labels',
    description: 'Select the information to show on the edges between nodes.'
  },
  {
    target: '#graph_filter_view_type',
    name: 'Graph Type',
    description:
      'Select a workload, service or application graph view. An application view can optionally be versioned and relies on app and version labeling. Workload and service graphs provide physical and logical views, respectively.'
  },
  {
    placement: StepPlacement.RIGHT,
    offset: 0,
    target: '#cytoscape-container',
    name: 'Graph',
    description:
      "Single click a node to see it's summary in the side panel.  Double click a node to see a graph focused on that node.\nDouble click an 'external namespace' node to navigate directly to the namespace in the node's text label."
  },
  {
    target: '#toolbar_layout_group',
    name: 'Layout selection',
    description:
      'Select the graph layout for the mesh. Different layouts work best with different meshes. Find the layout that works best. Other buttons here provide zoom and fit-to-screen options.'
  },
  {
    target: '#toolbar_toggle_legend',
    name: 'Legend',
    description: 'Display the legend to learn about what the different shapes, colors and backgrounds mean.'
  }
];

export default GraphHelpTour;
