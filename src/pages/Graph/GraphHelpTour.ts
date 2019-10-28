import { StatefulStep } from '../../components/Tour/StatefulTour';
import { PopoverPosition } from '@patternfly/react-core';
import { getNamespaceDropdown } from 'components/NamespaceDropdown';

const GraphHelpTour: Array<StatefulStep> = [
  {
    position: PopoverPosition.bottom,
    offset: 0,
    target: getNamespaceDropdown,
    name: 'Namespaces',
    description: 'Select the namespaces you want to see in the graph.'
  }
  /*,
  {
    position: PopoverPosition.right,
    offset: 0,
    target: '#graph_filter_view_type',
    name: 'Graph Type',
    description:
      'Select a workload, service or application graph view. An application view can optionally be versioned and relies on app and version labeling. Workload and service graphs provide physical and logical views, respectively.'
  },
  {
    offset: 0,
    target: '#graph_filter_edge_labels',
    name: 'Edge Labels',
    description:
      'Select the information to show on the edges between nodes. Response times reflect the 95th percentile.'
  },
  {
    offset: 0,
    target: '#graph_settings',
    name: 'Display',
    description: 'Toggle various display options such as badging traffic animation, and service nodes.'
  },
  {
    offset: 0,
    target: '#graph_find',
    name: 'Find and Hide',
    description: 'Highlight or Hide graph elements via typed expressions. Click the Find/Hide help icon for details.'
  },
  {
    position: PopoverPosition.bottom,
    offset: -120,
    target: '#cytoscape-container',
    isVisible: target => {
      return target.contains(document.querySelector('#cy'));
    },
    name: 'Graph',
    description:
      "Single click a node to see its summary and emphasize its end-to-end paths.  Double click a node to see a graph focused on that node.\nDouble click an 'external namespace' node to navigate directly to the namespace in the node's text label."
  },
  {
    offset: 0,
    target: '#toolbar_layout_group',
    name: 'Layout selection',
    description:
      'Select the graph layout for the mesh. Different layouts work best with different meshes. Find the layout that works best. Other buttons here provide zoom and fit-to-screen options.'
  },
  {
    offset: 0,
    target: '#toolbar_toggle_legend',
    name: 'Legend',
    description: 'Display the legend to learn about what the different shapes, colors and backgrounds mean.'
  }
  */
];

export default GraphHelpTour;
