import moment from 'moment';
import { HTTP_CODES } from '../types/Common';
import { KialiAppState, LoginState, LoginSession } from '../store/Store';
import HelpDropdownThunkActions from './HelpDropdownThunkActions';
import GrafanaThunkActions from './GrafanaThunkActions';
import { LoginActions } from './LoginActions';
import * as API from '../services/Api';
import { ServerConfigActions } from './ServerConfigActions';

import * as Login from '../services/Login';
import { AuthResult } from '../types/Auth';
import { KialiDispatch } from '../types/Redux';
import { MessageCenterActions } from './MessageCenterActions';

const Dispatcher = new Login.LoginDispatcher();

const shouldRelogin = (state?: LoginState): boolean =>
  !state ||
  !state.session ||
  moment(state.session!.expiresOn).diff(moment()) > 0 ||
  moment(state.uiExpiresOn).diff(moment()) > 0;

const loginSuccess = async (dispatch: KialiDispatch, session: LoginSession) => {
  try {
    dispatch(LoginActions.loginSuccess(session));

    dispatch(HelpDropdownThunkActions.refresh());
    dispatch(GrafanaThunkActions.getInfo());

    const response = await API.getServerConfig();

    dispatch(ServerConfigActions.setServerConfig(response.data));
  } catch (error) {
    if (error.response && error.response.status === HTTP_CODES.UNAUTHORIZED) {
      dispatch(LoginActions.logoutSuccess());
    }
  }
};

// Performs the user login, dispatching to the proper login implementations.
// The `data` argument is defined as `any` because the dispatchers receive
// different kinds of data (such as e-mail/password, tokens).
const performLogin = (dispatch: KialiDispatch, state: KialiAppState, data?: any) => {
  const bail = (loginResult: Login.LoginResult) =>
    data ? dispatch(LoginActions.loginFailure(loginResult.error)) : dispatch(LoginActions.logoutSuccess());

  Dispatcher.prepare().then((result: AuthResult) => {
    if (result === AuthResult.CONTINUE) {
      Dispatcher.perform({ dispatch, state, data }).then(
        loginResult => loginSuccess(dispatch, loginResult.session!),
        error => bail(error)
      );
    } else {
      bail({ status: AuthResult.FAILURE, error: 'Preparation for login failed, try again.' });
    }
  });
};

const LoginThunkActions = {
  authenticate: (username: string, password: string) => {
    return (dispatch: KialiDispatch, getState: () => KialiAppState) =>
      performLogin(dispatch, getState(), { username, password });
  },
  checkCredentials: () => {
    return (dispatch: KialiDispatch, getState: () => KialiAppState) => {
      const state: KialiAppState = getState();

      dispatch(LoginActions.loginRequest());

      if (shouldRelogin(state.authentication)) {
        performLogin(dispatch, state);
      } else {
        loginSuccess(dispatch, state.authentication!.session!);
      }
    };
  },
  extendSession: () => {
    return (dispatch: KialiDispatch, getState: () => KialiAppState) => {
      const session = getState().authentication!.session!;
      dispatch(LoginActions.loginExtend(session));
    };
  },
  logout: () => {
    return async (dispatch: KialiDispatch) => {
      try {
        const response = await API.logout();

        if (response.status === 204) {
          dispatch(LoginActions.logoutSuccess());
          dispatch(LoginThunkActions.checkCredentials());
        }
      } catch (err) {
        dispatch(MessageCenterActions.addMessage(API.getErrorMsg('Logout failed', err)));
      }
    };
  }
};

export default LoginThunkActions;
