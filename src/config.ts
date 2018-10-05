import deepFreeze from 'deep-freeze';
import { UNIT_TIME, MILLISECONDS } from './types/Common';

const conf = {
  version: '0.1',
  /** Configuration related with session */
  session: {
    /** TimeOut in Minutes default 24 hours */
    sessionTimeOut: 24 * UNIT_TIME.HOUR * MILLISECONDS,
    /** Extended Session in Minutes default 30 minutes */
    extendedSessionTimeOut: 30 * UNIT_TIME.MINUTE * MILLISECONDS,
    /** TimeOut Session remain for warning user default 1 minute */
    timeOutforWarningUser: 1 * UNIT_TIME.MINUTE * MILLISECONDS
  },
  /** Toolbar Configuration */
  toolbar: {
    /** Duration default in 1 minute */
    defaultDuration: 1 * UNIT_TIME.MINUTE,
    /** Options in interval duration */
    intervalDuration: {
      60: 'Last min',
      300: 'Last 5 min',
      600: 'Last 10 min',
      1800: 'Last 30 min',
      3600: 'Last hour',
      10800: 'Last 3 hours',
      21600: 'Last 6 hours',
      43200: 'Last 12 hours',
      86400: 'Last day',
      604800: 'Last 7 days',
      2592000: 'Last 30 days'
    },
    /** By default refresh is 15 seconds */
    defaultPollInterval: 15 * MILLISECONDS,
    /** Options in refresh */
    pollInterval: {
      0: 'Pause',
      5000: '5 sec',
      10000: '10 sec',
      15000: '15 sec',
      30000: '30 sec',
      60000: '1 min',
      300000: '5 min'
    },
    /** Graphs layouts types */
    graphLayouts: {
      cola: 'Cola',
      'cose-bilkent': 'Cose',
      dagre: 'Dagre'
    }
  },
  /** About dialog configuration */
  about: {
    project: {
      url: 'https://github.com/kiali',
      iconName: 'github',
      iconType: 'fa',
      linkText: 'Find us on GitHub'
    },
    website: {
      url: 'http://kiali.io',
      iconName: 'home',
      iconType: 'fa',
      linkText: 'Visit our web page'
    }
  },
  /**  Login configuration */
  login: {
    headers: {
      'X-Auth-Type-Kiali-UI': '1'
    }
  }
};

export const config = () => {
  return deepFreeze(conf) as typeof conf;
};

/** Istio logo */
export const IstioLogo = require('./assets/img/istio-logo.svg');

/** Kiali logo */
export const KialiLogo = require('./assets/img/logo-alt.svg');
