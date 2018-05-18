import { userConstants } from '../config';

let user = sessionStorage.getItem('user');
const INITIAL_STATE = user
  ? { loggedIn: true, user: user, error: null, message: '' }
  : { loggedIn: false, user: null, error: null, message: '' };

const authentication = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case userConstants.LOGIN_REQUEST:
      return {
        loggingIn: false,
        user: null,
        error: null,
        message: ''
      };
    case userConstants.LOGIN_SUCCESS:
      return {
        loggedIn: true,
        user: action.user
      };
    case userConstants.LOGIN_FAILURE:
      return {
        loggedIn: false,
        user: null,
        error: action.error,
        message: 'User or Password incorrect'
      };
    case userConstants.LOGOUT:
      return state;
    default:
      return state;
  }
};

export default authentication;
