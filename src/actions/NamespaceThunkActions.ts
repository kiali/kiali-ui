import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from '../store/Store';
import * as Api from '../services/Api';
import { KialiAppAction } from './KialiAppAction';
import { NamespaceActions } from './NamespaceAction';
import { serverConfig } from 'config';
import Namespace from 'types/Namespace';

const shouldFetchNamespaces = (state: KialiAppState) => {
  if (!state) {
    return true;
  } else {
    return !state.namespaces.isFetching;
  }
};

const NamespaceThunkActions = {
  asyncFetchNamespaces: () => {
    return (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
      dispatch(NamespaceActions.requestStarted());

      return Api.getNamespaces()
        .then(response => response.data)
        .then(data => {
          dispatch(NamespaceActions.receiveList([...data], new Date()));
        })
        .catch(() => dispatch(NamespaceActions.requestFailed()));
    };
  },

  defaultToServerNamespaces: () => (
    dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>,
    getState: () => KialiAppState
  ) => {
    const state = getState();
    const serverNamespaces = serverConfig.kialiFeatureFlags.uiDefaults.namespaces.map(x => ({ name: x } as Namespace));

    // In general we are only using this on component creation, but if for some
    // reason it is called twice, we try to avoid replacing user input.
    if (state.namespaces.activeNamespaces.length === 0 && serverNamespaces.length > 0) {
      dispatch(NamespaceActions.setActiveNamespaces(serverNamespaces));
    }
  },

  fetchNamespacesIfNeeded: () => {
    // Note that the function also receives getState()
    // which lets you choose what to dispatch next.
    // This is useful for avoiding a network request if
    // a cached value is already available.
    return (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>, getState: () => KialiAppState) => {
      if (shouldFetchNamespaces(getState())) {
        const state = getState().authentication;

        if (!state || !state.session) {
          return Promise.resolve();
        }

        // Dispatch a thunk from thunk!
        return dispatch(NamespaceThunkActions.asyncFetchNamespaces());
      } else {
        // Let the calling code know there's nothing to wait for.
        return Promise.resolve();
      }
    };
  }
};

export default NamespaceThunkActions;
