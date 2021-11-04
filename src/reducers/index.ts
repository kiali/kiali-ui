import { combineReducers } from 'redux';

import { KialiAppState } from '../store/Store';
import messageCenter from './MessageCenter';
import loginState from './LoginState';
import HelpDropdownState from './HelpDropdownState';
import globalState from './GlobalState';
import namespaceState from './NamespaceState';
import UserSettingsState from './UserSettingsState';
import TourState from './TourState';
import { KialiAppAction } from '../actions/KialiAppAction';
import MeshTlsState from './MeshTlsState';
import IstioStatusState from './IstioStatusState';
import JaegerStateReducer from './JaegerState';
import MetricsStatsReducer from './MetricsStatsState';
import IstioCertsInfoState from './IstioCertsInfoState';
import graphSettingsSlice from '../pages/Graph/GraphToolbar/graphSettingsSlice';

const rootReducer = combineReducers<KialiAppState, KialiAppAction>({
  authentication: loginState,
  globalState: globalState,
  graph: graphSettingsSlice,
  messageCenter,
  namespaces: namespaceState,
  statusState: HelpDropdownState,
  userSettings: UserSettingsState,
  jaegerState: JaegerStateReducer,
  meshTLSStatus: MeshTlsState,
  istioStatus: IstioStatusState,
  istioCertsInfo: IstioCertsInfoState,
  tourState: TourState,
  metricsStats: MetricsStatsReducer
});

export default rootReducer;
