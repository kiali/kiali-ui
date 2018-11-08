// import { NamespaceActionKeys } from '../../actions/NamespaceAction';
import namespaceState from '../NamespaceState';
import { NamespaceActionKeys } from '../../actions/NamespaceAction';

describe('Namespaces reducer', () => {
  it('should return the initial state', () => {
    expect(namespaceState(undefined, {})).toEqual({
      isFetching: false,
      activeNamespaces: [],
      items: [],
      lastUpdated: undefined
    });
  });

  it('should handle ACTIVE_NAMESPACE', () => {
    const currentState = {
      activeNamespaces: [{ name: 'my-namespace' }],
      isFetching: false,
      items: [],
      lastUpdated: undefined
    };
    const requestStartedAction = {
      type: NamespaceActionKeys.SET_ACTIVE_NAMESPACES,
      payload: [{ name: 'istio' }]
    };
    const expectedState = {
      activeNamespaces: [{ name: 'istio' }],
      isFetching: false,
      items: [],
      lastUpdated: undefined
    };
    expect(namespaceState(currentState, requestStartedAction)).toEqual(expectedState);
  });

  it('should handle NAMESPACE_REQUEST_STARTED', () => {
    const currentState = {
      activeNamespaces: [{ name: 'my-namespace' }],
      isFetching: false,
      items: [],
      lastUpdated: undefined
    };
    const requestStartedAction = {
      type: NamespaceActionKeys.NAMESPACE_REQUEST_STARTED
    };
    const expectedState = {
      activeNamespaces: [{ name: 'my-namespace' }],
      isFetching: true,
      items: [],
      lastUpdated: undefined
    };
    expect(namespaceState(currentState, requestStartedAction)).toEqual(expectedState);
  });

  it('should handle NAMESPACE_FAILED', () => {
    const currentState = {
      activeNamespaces: [{ name: 'my-namespace' }],
      isFetching: true,
      items: []
    };
    const requestStartedAction = {
      type: NamespaceActionKeys.NAMESPACE_FAILED
    };
    const expectedState = {
      activeNamespaces: [{ name: 'my-namespace' }],
      isFetching: false,
      items: []
    };
    expect(namespaceState(currentState, requestStartedAction)).toEqual(expectedState);
  });

  it('should handle NAMESPACE_SUCCESS', () => {
    const currentDate = new Date();
    const currentState = {
      activeNamespaces: [{ name: 'my-namespace' }],
      isFetching: true,
      items: ['old', 'namespace'],
      lastUpdated: undefined
    };
    const requestStartedAction = {
      type: NamespaceActionKeys.NAMESPACE_SUCCESS,
      list: ['a', 'b', 'c'],
      receivedAt: currentDate
    };
    const expectedState = {
      activeNamespaces: [{ name: 'my-namespace' }],
      isFetching: false,
      items: ['a', 'b', 'c'],
      lastUpdated: currentDate
    };
    expect(namespaceState(currentState, requestStartedAction)).toEqual(expectedState);
  });
});
