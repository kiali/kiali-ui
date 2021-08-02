import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import AuthenticationController from '../AuthenticationController';
import Namespace from 'types/Namespace';
import { JaegerInfo } from 'types/JaegerInfo';
import { TLSStatus } from 'types/TLSStatus';
import { ServerStatus } from 'types/ServerStatus';
import { DurationInSeconds, IntervalInMilliseconds } from 'types/Common';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { LoginStatus } from '../../store/Store';

const mockStore = configureMockStore([thunk]);

describe('AuthenticationController', () => {
  it('calls publicAreaComponent with postLoginError if not logging in', () => {
    const spy = jest.fn((_isPostLoginPerforming: boolean, _errorMsg?: string) => (
      <div className="publicAreaComponent" />
    ));
    const props = {
      authenticated: false,
      isLoginError: false,
      logout: () => {},
      setActiveNamespaces: (_namespaces: Namespace[]) => {},
      setDuration: (_duration: DurationInSeconds) => {},
      setJaegerInfo: (_jaegerInfo: JaegerInfo | null) => {},
      setLandingRoute: (_route: string | undefined) => {},
      setMeshTlsStatus: (_meshStatus: TLSStatus) => {},
      setNamespaces: (_namespaces: Namespace[], _receivedAt: Date) => {},
      setRefreshInterval: (_interval: IntervalInMilliseconds) => {},
      setServerStatus: (_serverStatus: ServerStatus) => {},
      checkCredentials: () => {},
      protectedAreaComponent: <div />,
      publicAreaComponent: spy
    };

    const store = mockStore({
      authentication: {
        status: LoginStatus.logging
      }
    });

    mount(
      <Provider store={store}>
        <AuthenticationController {...props} />
      </Provider>
    );

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(false, undefined);
  });
});
