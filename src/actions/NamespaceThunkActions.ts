import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from '../store/Store';
import * as Api from '../services/Api';
import { KialiAppAction } from './KialiAppAction';
import { NamespaceActions } from './NamespaceAction';

const shouldFetchNamespaces = (state: KialiAppState) => {
  if (!state) {
    return true;
  } else {
    return !state.namespaces.isFetching;
  }
};

const NamespaceThunkActions = {
  asyncFetchNamespaces: (auth: any) => {
    return (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
      dispatch(NamespaceActions.requestStarted());
      return Api.getNamespaces(auth)
        .then(response => response['data'])
        .then(data => {
          dispatch(NamespaceActions.receiveList([...data], new Date()));
        })
        .catch(() => dispatch(NamespaceActions.requestFailed()));
    };
  },

  fetchNamespacesIfNeeded: () => {
    // Note that the function also receives getState()
    // which lets you choose what to dispatch next.
    // This is useful for avoiding a network request if
    // a cached value is already available.
    return (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>, getState: () => KialiAppState) => {
      if (shouldFetchNamespaces(getState())) {
        if (getState()['authentication']['token'] === undefined) {
          return Promise.resolve();
        }
        const auth = 'Bearer ' + getState().authentication.token!.token;
        // Dispatch a thunk from thunk!
        return dispatch(NamespaceThunkActions.asyncFetchNamespaces(auth));
      } else {
        // Let the calling code know there's nothing to wait for.
        return Promise.resolve();
      }
    };
  }
};

export default NamespaceThunkActions;
