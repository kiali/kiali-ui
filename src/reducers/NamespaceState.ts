import { getType } from 'typesafe-actions';
import { updateState } from '../utils/Reducer';
import { NamespaceState } from '../store/Store';
import { KialiAppAction } from '../actions/KialiAppAction';
import { NamespaceActions } from '../actions/NamespaceAction';

export const INITIAL_NAMESPACE_STATE: NamespaceState = {
  activeNamespaces: [],
  isFetching: false,
  items: [],
  lastUpdated: undefined
};

const namespaces = (state: NamespaceState = INITIAL_NAMESPACE_STATE, action: KialiAppAction): NamespaceState => {
  switch (action.type) {
    case getType(NamespaceActions.toggleActiveNamespace):
      const namespaceIndex = state.activeNamespaces.findIndex(namespace => namespace.name === action.payload.name);
      if (namespaceIndex === -1) {
        return updateState(state, {
          activeNamespaces: [...state.activeNamespaces, { name: action.payload.name }]
        });
      } else {
        const activeNamespaces = [...state.activeNamespaces];
        activeNamespaces.splice(namespaceIndex, 1);
        return updateState(state, { activeNamespaces });
      }

    case getType(NamespaceActions.setActiveNamespaces):
      return updateState(state, { activeNamespaces: action.payload });

    case getType(NamespaceActions.requestStarted):
      return updateState(state, {
        isFetching: true
      });

    case getType(NamespaceActions.receiveList):
      return updateState(state, {
        isFetching: false,
        items: action.payload.list,
        lastUpdated: action.payload.receivedAt
      });

    case getType(NamespaceActions.requestFailed):
      return updateState(state, {
        isFetching: false
      });

    default:
      return state;
  }
};

export default namespaces;
