import { NamespaceActionKeys } from '../actions/NamespaceAction';
import { NamespaceState } from '../store/Store';

const INITIAL_STATE: NamespaceState = {
  isFetching: false,
  didInvalidate: false,
  items: []
};

const namespaces = (state: NamespaceState = INITIAL_STATE, action) => {
  switch (action.type) {
    case NamespaceActionKeys.NAMESPACE_RELOAD:
      return Object.assign({}, state, {
        didInvalidate: true
      });

    case NamespaceActionKeys.NAMESPACE_START:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      });

    case NamespaceActionKeys.NAMESPACE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        items: action.list,
        lastUpdated: action.receivedAt
      });

    default:
      return state;
  }
};

export default namespaces;
