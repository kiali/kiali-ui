import { ThunkDispatch } from 'redux-thunk';
import { HTTP_CODES } from '../types/Common';
import { KialiAppState, Token, ServerConfig } from '../store/Store';
import { KialiAppAction } from './KialiAppAction';
import HelpDropdownThunkActions from './HelpDropdownThunkActions';
import GrafanaThunkActions from './GrafanaThunkActions';
import { LoginActions } from './LoginActions';
import * as API from '../services/Api';
import { ServerConfigActions } from './ServerConfigActions';

type KialiDispatch = ThunkDispatch<KialiAppState, void, KialiAppAction>;

const performLogin = (dispatch: KialiDispatch, username?: string, password?: string) => {
  dispatch(LoginActions.loginRequest());

  const loginUser: string = username === undefined ? ANONYMOUS : username;
  const loginPass: string = password === undefined ? ANONYMOUS : password;

  API.login(loginUser, loginPass).then(
    token => {
      completeLogin(dispatch, token['data'], loginUser);
    },
    error => {
      if (loginUser === ANONYMOUS) {
        dispatch(LoginActions.logoutSuccess());
      } else {
        dispatch(LoginActions.loginFailure(error));
      }
    }
  );
};

const LoginThunkActions = {
  extendSession: () => {
    return (dispatch: KialiDispatch, getState: () => KialiAppState) => {
      const actualState = getState() || {};
      dispatch(
        LoginActions.loginExtend(
          actualState.authentication.token!,
          actualState.authentication.username!,
          actualState.authentication.sessionTimeOut!
        )
      );
    };
  },
  checkCredentials: () => {
    return (dispatch: KialiDispatch, getState: () => KialiAppState) => {
      const actualState = getState() || {};
      const token = actualState['authentication']['token'];
      const username = actualState['authentication']['username'];
      const sessionTimeout = actualState['authentication']['sessionTimeOut'];

      /** Check if there is a token in session */
      if (!token) {
        /** log in as anonymous user - this will logout the user if no anonymous access is allowed */
        performLogin(dispatch);
      } else {
        /** Check the session timeout */
        if (new Date().getTime() > sessionTimeout!) {
          // if anonymous access is allowed, re-login automatically; otherwise, log out
          performLogin(dispatch);
        } else {
          completeLogin(dispatch, token, username!, sessionTimeout!);
        }
      }
    };
  },
  // action creator that performs the async request
  authenticate: (username: string, password: string) => {
    return (dispatch: KialiDispatch) => performLogin(dispatch, username, password);
  }
};

export default LoginThunkActions;
