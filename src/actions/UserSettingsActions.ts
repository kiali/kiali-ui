import { ActionType, createAction, createStandardAction } from 'typesafe-actions';
import { DurationInSeconds, RefreshIntervalInMs, ReplayIntervalInSeconds, TimeInSeconds } from '../types/Common';
import { ActionKeys } from './ActionKeys';

export const UserSettingsActions = {
  navCollapse: createAction(ActionKeys.NAV_COLLAPSE, resolve => (collapsed: boolean) =>
    resolve({ collapse: collapsed })
  ),
  setDuration: createStandardAction(ActionKeys.SET_DURATION)<DurationInSeconds>(),
  setRefreshInterval: createStandardAction(ActionKeys.SET_REFRESH_INTERVAL)<RefreshIntervalInMs>(),
  setReplayInterval: createStandardAction(ActionKeys.SET_REPLAY_INTERVAL)<ReplayIntervalInSeconds>(),
  setReplayQueryTime: createStandardAction(ActionKeys.SET_REPLAY_QUERY_TIME)<TimeInSeconds>(),
  toggleReplayActive: createAction(ActionKeys.TOGGLE_REPLAY_ACTIVE)
};

export type UserSettingsAction = ActionType<typeof UserSettingsActions>;
