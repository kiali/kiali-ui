import { NamespaceActionKeys } from '../actions/NamespaceAction';
import { updateState } from '../utils/Reducer';
import { NamespaceState } from '../store/Store';

export const INITIAL_NAMESPACE_STATE: NamespaceState = {
  activeNamespaces: [],
  isFetching: false,
  items: [],
  lastUpdated: undefined
};

const namespaces = (state: NamespaceState = INITIAL_NAMESPACE_STATE, action) => {
  switch (action.type) {
    case NamespaceActionKeys.TOGGLE_ACTIVE_NAMESPACE:
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

    case NamespaceActionKeys.SET_ACTIVE_NAMESPACES:
      return updateState(state, { activeNamespaces: action.payload });

    case NamespaceActionKeys.NAMESPACE_REQUEST_STARTED:
      return updateState(state, {
        isFetching: true
      });

    case NamespaceActionKeys.NAMESPACE_SUCCESS:
      return updateState(state, {
        isFetching: false,
        items: action.list,
        lastUpdated: action.receivedAt
      });

    case NamespaceActionKeys.NAMESPACE_FAILED:
      return updateState(state, {
        isFetching: false
      });

    default:
      return state;
  }
};

export default namespaces;
