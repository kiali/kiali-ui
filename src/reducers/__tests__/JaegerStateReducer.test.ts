import JaegerState from '../JaegerState';
import { JaegerActions } from '../../actions/JaegerActions';

const initialState = {
  url: '',
  integration: false,
  namespaceSelector: true,
  integrationMessage: '',
  whiteListIstioSystem: []
};

describe('JaegerState reducer', () => {
  let expectedState;
  beforeEach(() => {
    expectedState = initialState;
  });

  it('should set url', () => {
    const url = 'https://jaeger-query-istio-system.127.0.0.1.nip.io';
    expectedState.url = url;
    expect(JaegerState(initialState, JaegerActions.setUrl(url))).toEqual(expectedState);
  });

  it('should enable integration', () => {
    expectedState.integration = true;
    expect(JaegerState(initialState, JaegerActions.setEnableIntegration(true))).toEqual(expectedState);
  });

  it('should store both url and integration', () => {
    const url = 'https://jaeger-query-istio-system.127.0.0.1.nip.io';
    expectedState.integration = true;
    expectedState.url = url;
    expect(
      JaegerState(
        initialState,
        JaegerActions.setinfo({
          url: url,
          integration: true,
          namespaceSelector: true,
          integrationMessage: '',
          whiteListIstioSystem: []
        })
      )
    ).toEqual(expectedState);
  });
});
