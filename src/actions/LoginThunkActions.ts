import moment from 'moment';
import { ThunkDispatch } from 'redux-thunk';
import { HTTP_CODES } from '../types/Common';
import { KialiAppState, LoginState, Session } from '../store/Store';
import { KialiAppAction } from './KialiAppAction';
import HelpDropdownThunkActions from './HelpDropdownThunkActions';
import GrafanaThunkActions from './GrafanaThunkActions';
import { LoginActions } from './LoginActions';
import * as API from '../services/Api';
import { ServerConfigActions } from './ServerConfigActions';

import * as Login from '../services/Login';

type KialiDispatch = ThunkDispatch<KialiAppState, void, KialiAppAction>;

const shouldRelogin = (state?: LoginState): boolean => {
  return !(state && state.session && state.session.token && new Date() < moment(state.session!.expiresOn).toDate());
};

const loginSuccess = async (dispatch: KialiDispatch, session: Session) => {
  const authHeader = `Bearer ${session.token}`;

  try {
    dispatch(LoginActions.loginSuccess(session));

    dispatch(HelpDropdownThunkActions.refresh());
    dispatch(GrafanaThunkActions.getInfo(authHeader));

    const response = await API.getServerConfig(authHeader);

    dispatch(ServerConfigActions.setServerConfig(response.data));
  } catch (error) {
    if (error.response && error.response.status === HTTP_CODES.UNAUTHORIZED) {
      dispatch(LoginActions.logoutSuccess());
    }
  }
};

const performLogin = (dispatch: KialiDispatch, getState: () => KialiAppState, data?: any) => {
  dispatch(LoginActions.loginRequest());

  const dispatcher = new Login.LoginDispatcher();

  dispatcher.prepare();

  dispatcher.perform({ dispatch, getState, data }).then(
    result => loginSuccess(dispatch, result.session!),
    error => {
      return data ? dispatch(LoginActions.loginFailure(error)) : dispatch(LoginActions.logoutSuccess());
    }
  );
};

const LoginThunkActions = {
  extendSession: () => {
    return (dispatch: KialiDispatch, getState: () => KialiAppState) => {
      const session = getState().authentication!.session!;
      dispatch(LoginActions.loginExtend(session));
    };
  },
  checkCredentials: () => {
    return (dispatch: KialiDispatch, getState: () => KialiAppState) => {
      const state: KialiAppState = getState();

      if (shouldRelogin(state.authentication)) {
        performLogin(dispatch, getState);
      } else {
        loginSuccess(dispatch, state.authentication!.session!);
      }
    };
  },
  // action creator that performs the async request
  authenticate: (username: string, password: string) => {
    return (dispatch: KialiDispatch, getState: () => KialiAppState) =>
      performLogin(dispatch, getState, { username, password });
  }
};

export default LoginThunkActions;
