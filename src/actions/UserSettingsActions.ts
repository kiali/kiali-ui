import { ActionType, createAction, createStandardAction } from 'typesafe-actions';
import { DurationInSeconds, PollIntervalInMs, TimeInMilliseconds } from '../types/Common';
import { ActionKeys } from './ActionKeys';

export const UserSettingsActions = {
  navCollapse: createAction(ActionKeys.NAV_COLLAPSE, resolve => (collapsed: boolean) =>
    resolve({ collapse: collapsed })
  ),
  setDuration: createStandardAction(ActionKeys.SET_DURATION)<DurationInSeconds>(),
  setRefreshInterval: createStandardAction(ActionKeys.SET_REFRESH_INTERVAL)<PollIntervalInMs>(),
  setLastRefreshAt: createStandardAction(ActionKeys.SET_LAST_REFRESH)<TimeInMilliseconds>()
};

export type UserSettingsAction = ActionType<typeof UserSettingsActions>;
