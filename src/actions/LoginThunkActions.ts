import { ThunkDispatch } from 'redux-thunk';
import { setServerConfig } from '../config';
import { HTTP_CODES } from '../types/Common';
import { KialiAppState } from '../store/Store';
import { KialiAppAction } from './KialiAppAction';
import HelpDropdownThunkActions from './HelpDropdownThunkActions';
import GrafanaThunkActions from './GrafanaThunkActions';
import { LoginActions } from './LoginActions';
import * as API from '../services/Api';

type Dispatch = ThunkDispatch<KialiAppState, void, KialiAppAction>;
type GetState = () => KialiAppState;

const performLogin = (
  dispatch: Dispatch,
  username?: string,
  password?: string
) => {
  dispatch(LoginActions.loginRequest());

  let anonymous = username === undefined;
  let loginUser: string = username === undefined ? 'anonymous' : username;
  let loginPass: string = password === undefined ? 'anonymous' : password;

  API.login(loginUser, loginPass).then(
    (token: API.Response<any>) => {
      dispatch(LoginActions.loginSuccess(token.data));

      const auth = `Bearer ${token['data']['token']}`;

      dispatch(HelpDropdownThunkActions.refresh());
      dispatch(GrafanaThunkActions.getInfo(auth));
    },
    error => {
      if (anonymous) {
        dispatch(LoginActions.logoutSuccess());
      } else {
        dispatch(LoginActions.loginFailure(error));
      }
    }
  );
};

const LoginThunkActions = {
  extendSession: () => {
    return (dispatch: Dispatch, getState: GetState) => {
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
    return (dispatch: Dispatch, getState: GetState) => {
      const actualState = getState() || {};

      /** Check if there is a token in session and if it's still valid */
      if (
        actualState['authentication']['token'] === undefined ||
        new Date().getTime() > getState().authentication!.sessionTimeOut!
      ) {
        API.checkOauth().then(
          response => {
            performLogin(dispatch, '', '');
            LoginThunkActions.loginSuccess(dispatch, getState, 'not-necessary');
          },
          error => {
            if (error.response && error.response.status === HTTP_CODES.UNAUTHORIZED) {
              dispatch(LoginActions.loginFailure(error));
            }
          }
        );
      } else {
        const token = actualState.authentication!.token!.token!;

        LoginThunkActions.loginSuccess(dispatch, getState, token);
      }
    };
  },
  // action creator that performs the async request
  authenticate: (username: string, password: string) => {
    return dispatch => performLogin(dispatch, username, password);
  },
  loginSuccess: (dispatch: Dispatch, getState: GetState, token: string) => {
    return () => {
      /** Check if the token is valid */
      const auth = `Bearer ${token}`;

      API.getServerConfig(auth).then(
        response => {
          /** Login success */
          dispatch(LoginThunkActions.extendSession());
          dispatch(HelpDropdownThunkActions.refresh());
          dispatch(GrafanaThunkActions.getInfo(auth));

          setServerConfig(response.data);
        },
        error => {
          /** Logout user */
          if (error.response && error.response.status === HTTP_CODES.UNAUTHORIZED) {
            dispatch(LoginActions.logoutSuccess());
          }
        }
      );
    };
  }
};

export default LoginThunkActions;
