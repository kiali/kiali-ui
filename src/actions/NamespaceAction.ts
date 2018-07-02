import * as Api from '../services/Api';

export enum NamespaceActionKeys {
  NAMESPACE_RELOAD = 'NAMESPACE_RELOAD',
  NAMESPACE_START = 'NAMESPACE_START',
  NAMESPACE_SUCCESS = 'NAMESPACE_SUCCESS',
  NAMESPACE_FAILED = 'NAMESPACE_FAILED'
}

export const reload = () => {
  return {
    type: NamespaceActionKeys.NAMESPACE_RELOAD
  };
};

export const apiInitiateRequest = () => {
  return {
    type: NamespaceActionKeys.NAMESPACE_START
  };
};

export const apiReceiveList = newList => {
  return {
    type: NamespaceActionKeys.NAMESPACE_SUCCESS,
    list: newList,
    receivedAt: Date.now()
  };
};

export const apiRequestFailed = () => {
  return {
    type: NamespaceActionKeys.NAMESPACE_FAILED
  };
};

export const asyncFetchNamespaces = (auth: any) => {
  return dispatch => {
    dispatch(apiInitiateRequest());
    return Api.getNamespaces(auth)
      .then(response => response['data'])
      .then(data => dispatch(apiReceiveList(data)))
      .catch(() => dispatch(apiRequestFailed()));
  };
};

const shouldFetchNamespaces = state => {
  if (!state) {
    return true;
  } else {
    return !state.namespaces.isFetching;
  }
};

export const fetchNamespacesIfNeeded = () => {
  // Note that the function also receives getState()
  // which lets you choose what to dispatch next.
  // This is useful for avoiding a network request if
  // a cached value is already available.
  return (dispatch, getState) => {
    if (shouldFetchNamespaces(getState())) {
      // Dispatch a thunk from thunk!
      if (getState()['authentication']['token'] === undefined) {
        return Promise.resolve();
      }
      const auth = 'Bearer ' + getState().authentication.token.token;
      return dispatch(asyncFetchNamespaces(auth));
    } else {
      // Let the calling code know there's nothing to wait for.
      return Promise.resolve();
    }
  };
};
