import { createAction } from 'typesafe-actions';
import { CytoscapeClickEvent } from '../types/Graph';

export enum ServiceGraphActionKeys {
  GRAPH_NAMESPACE_CHANGED = 'GRAPH_NAMESPACE_CHANGED',
  SERVICE_GRAPH_SIDE_PANEL_SHOW_INFO = 'SERVICE_GRAPH_SIDE_PANEL_SHOW_INFO'
}

// synchronous action creators
export const ServiceGraphActions = {
  namespaceChanged: createAction(ServiceGraphActionKeys.GRAPH_NAMESPACE_CHANGED, (newNamespace: string) => ({
    type: ServiceGraphActionKeys.GRAPH_NAMESPACE_CHANGED,
    newNamespace
  })),
  showSidePanelInfo: createAction(
    ServiceGraphActionKeys.SERVICE_GRAPH_SIDE_PANEL_SHOW_INFO,
    (event: CytoscapeClickEvent) => ({
      type: ServiceGraphActionKeys.SERVICE_GRAPH_SIDE_PANEL_SHOW_INFO,
      ...event
    })
  ),
  graphRendered: (cy: any) => {
    return dispatch => {
      dispatch(
        ServiceGraphActions.showSidePanelInfo({
          summaryType: 'graph',
          summaryTarget: cy
        })
      );
    };
  }
};
