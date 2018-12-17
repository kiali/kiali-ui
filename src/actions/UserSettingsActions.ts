import { ActionType, createAction, createStandardAction } from 'typesafe-actions';
import { DurationInSeconds, PollIntervalInMs } from '../types/Common';

enum UserSettingsActionKeys {
  NAV_COLLAPSE = 'NAV_COLLAPSE',
  SET_DURATION = 'SET_DURATION',
  SET_REFRESH_INTERVAL = 'SET_REFRESH_INTERVAL',
  SET_PF_NEXT = 'SET_PF_NEXT'
}

export const UserSettingsActions = {
  navCollapse: createAction(UserSettingsActionKeys.NAV_COLLAPSE, resolve => (collapsed: boolean) =>
    resolve({ collapse: collapsed })
  ),
  setDuration: createStandardAction(UserSettingsActionKeys.SET_DURATION)<DurationInSeconds>(),
  setRefreshInterval: createStandardAction(UserSettingsActionKeys.SET_REFRESH_INTERVAL)<PollIntervalInMs>(),
  setPfNext: createStandardAction(UserSettingsActionKeys.SET_PF_NEXT)<boolean>()
};

export type UserSettingsAction = ActionType<typeof UserSettingsActions>;
