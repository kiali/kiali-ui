import { NotificationGroup } from '../types/MessageCenter';
import { GraphType } from '../components/CytoscapeGraph/graphs/GraphType';
// Store is the Redux Data store

// Various pages are described here with their various sections
export interface ServiceGraphFilterState {
  // Toggle props
  readonly showEdgeLabels: boolean;
  readonly showNodeLabels: boolean;
  readonly showCircuitBreakers: boolean;
  readonly showRouteRules: boolean;
  // disable the service graph layers toolbar
  // @todo: add this back in later
  // readonly disableLayers: boolean;
}

export interface NamespaceState {
  isFetching: boolean;
  didInvalidate: boolean;
  items: any;
}

export interface MessageCenterState {
  nextId: number; // This likely will go away once we hace persistence
  groups: NotificationGroup[];
  hidden: boolean;
  expanded: boolean;
  expandedGroupId: string;
}

export interface ServiceGraphDataState {
  isLoading: boolean;
  timestamp: number;
  graphType: GraphType;
  duration: number;
  graphData: any;
}

// @todo: Add namespaces interface

// This defines the Kiali Global Application State
export interface KialiAppState {
  // page settings
  messageCenter: MessageCenterState;
  namespaces: NamespaceState;
  serviceGraphDataState: ServiceGraphDataState;
  serviceGraphFilterState: ServiceGraphFilterState;
}
