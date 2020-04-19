import { ActionType, createAction, createStandardAction } from 'typesafe-actions';
import { CytoscapeClickEvent, Layout, NodeParamsType } from '../types/Graph';
import { ActionKeys } from './ActionKeys';
import { TimeInMilliseconds } from 'types/Common';

export const GraphActions = {
  onNamespaceChange: createAction(ActionKeys.GRAPH_ON_NAMESPACE_CHANGE),
  setLayout: createStandardAction(ActionKeys.GRAPH_SET_LAYOUT)<Layout>(),
  setNode: createStandardAction(ActionKeys.GRAPH_SET_NODE)<NodeParamsType | undefined>(),
  setLastElementsUpdate: createStandardAction(ActionKeys.GRAPH_SET_LAST_ELEMENTS_UPDATE)<TimeInMilliseconds>(),
  setLastSettingsUpdate: createStandardAction(ActionKeys.GRAPH_SET_LAST_SETTINGS_UPDATE)<TimeInMilliseconds>(),
  setRemovedElements: createStandardAction(ActionKeys.GRAPH_SET_REMOVED_ELEMENTS)<any | undefined>(),
  updateSummary: createStandardAction(ActionKeys.GRAPH_UPDATE_SUMMARY)<CytoscapeClickEvent>()
};

export type GraphAction = ActionType<typeof GraphActions>;
