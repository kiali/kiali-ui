import deepFreeze from 'deep-freeze';

export const config = () => {
  return deepFreeze({
    version: '0.1',
    toolbar: {
      defaultDuration: 60,
      intervalDuration: {
        60: 'Last minute',
        300: 'Last 5 minutes',
        600: 'Last 10 minutes',
        1800: 'Last 30 minutes',
        3600: 'Last hour',
        10800: 'Last 3 hours',
        21600: 'Last 6 hours',
        43200: 'Last 12 hours',
        86400: 'Last day',
        604800: 'Last 7 days',
        2592000: 'last 30 days'
      },
      defaultPollInterval: 5000,
      pollInterval: {
        0: 'Pause',
        5000: '5 seconds',
        10000: '10 seconds',
        30000: '30 seconds',
        60000: '1 minute',
        300000: '5 minutes'
      },
      graphLayouts: {
        breadthfirst: 'Breadthfirst',
        cola: 'Cola',
        cose: 'Cose',
        dagre: 'Dagre',
        klay: 'Klay'
      }
    }
  });
};

export const userConstants = {
  LOGIN_REQUEST: 'USERS_LOGIN_REQUEST',
  LOGIN_SUCCESS: 'USERS_LOGIN_SUCCESS',
  LOGIN_FAILURE: 'USERS_LOGIN_FAILURE',

  LOGOUT: 'USERS_LOGOUT'
};

export const alertConstants = {
  SUCCESS: 'ALERT_SUCCESS',
  ERROR: 'ALERT_ERROR',
  CLEAR: 'ALERT_CLEAR'
};

export const KEY_CODES = { TAB_KEY: 9, ENTER_KEY: 13, ESCAPE_KEY: 27 };
