import { getType } from 'typesafe-actions';
import { LoginState as LoginStateInterface, LoginStatus } from '../store/Store';
import { KialiAppAction } from '../actions/KialiAppAction';
import { LoginActions } from '../actions/LoginActions';
import authenticationConfig from '../config/AuthenticationConfig';
import { updateState } from '../utils/Reducer';

export const INITIAL_LOGIN_STATE: LoginStateInterface = {
  landingRoute: undefined,
  message: '',
  session: undefined,
  status: LoginStatus.loggedOut
};

// This Reducer allows changes to the 'loginState' portion of Redux Store
const loginState = (state: LoginStateInterface = INITIAL_LOGIN_STATE, action: KialiAppAction): LoginStateInterface => {
  switch (action.type) {
    case getType(LoginActions.loginRequest):
      return {
        ...INITIAL_LOGIN_STATE,
        landingRoute: state.landingRoute,
        status: LoginStatus.logging
      };
    case getType(LoginActions.loginSuccess):
      return {
        ...INITIAL_LOGIN_STATE,
        ...action.payload,
        landingRoute: state.landingRoute
      };
    case getType(LoginActions.loginExtend):
      return {
        ...INITIAL_LOGIN_STATE,
        landingRoute: state.landingRoute,
        status: LoginStatus.loggedIn,
        session: action.payload.session
      };
    case getType(LoginActions.loginFailure):
      let message = 'Error connecting to Kiali';

      authenticationConfig.secretMissing = false;
      if (action.payload.error.request.status === 401) {
        message =
          'Unauthorized. The provided credentials are not valid to access Kiali. Please check your credentials and try again.';
      } else if (action.payload.error.request.status === 520) {
        authenticationConfig.secretMissing = true;
      }

      return {
        ...INITIAL_LOGIN_STATE,
        landingRoute: state.landingRoute,
        message: message,
        status: LoginStatus.error
      };
    case getType(LoginActions.logoutSuccess):
      // If login succeeds, we clear the secret missing flag, since the server
      // allowed the authentication
      authenticationConfig.secretMissing = false;
      return INITIAL_LOGIN_STATE;
    case getType(LoginActions.sessionExpired):
      return {
        ...INITIAL_LOGIN_STATE,
        status: LoginStatus.expired,
        message: 'Your session has expired or was terminated in another window.'
      };
    case getType(LoginActions.setLandingRoute):
      return updateState(state, {
        landingRoute: action.payload
      });
    default:
      return state;
  }
};

export default loginState;
