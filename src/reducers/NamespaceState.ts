import { NamespaceActionKeys } from '../actions/NamespaceAction';
import { updateState } from '../utils/Reducer';
import { NamespaceState } from '../store/Store';

const INITIAL_STATE: NamespaceState = {
  activeNamespace: { name: 'all' },
  isFetching: false,
  items: ['all'],
  lastUpdated: undefined
};

const namespaces = (state: NamespaceState = INITIAL_STATE, action) => {
  switch (action.type) {
    case NamespaceActionKeys.SET_ACTIVE_NAMESPACE:
      const { namespace } = action;
      return updateState(state, {
        activeNamespace: { name: namespace }
      });

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
