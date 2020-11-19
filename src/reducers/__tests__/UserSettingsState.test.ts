import UserSettingsState from '../UserSettingsState';
import { UserSettingsActions } from '../../actions/UserSettingsActions';
import { GlobalActions } from '../../actions/GlobalActions';

describe('UserSettingsState reducer', () => {
  const RealDate = Date.now;
  const currentDate = Date.now();

  const mockDate = date => {
    global.Date.now = jest.fn(() => date) as any;
    return date;
  };

  beforeEach(() => {
    mockDate(currentDate);
  });

  afterEach(() => {
    global.Date.now = RealDate;
  });

  it('should return the initial state', () => {
    expect(UserSettingsState(undefined, GlobalActions.unknown())).toEqual({
      duration: 60,
      interface: { navCollapse: false },
      refreshInterval: 15000,
      replayActive: false,
      replayQueryTime: 0,
      replayWindow: { interval: 0, startTime: 0 },
      timeRange: { rangeDuration: 600 }
    });
  });

  it('should collapse the nav', () => {
    expect(
      UserSettingsState(
        {
          duration: 60,
          interface: { navCollapse: false },
          refreshInterval: 60000,
          replayActive: false,
          replayQueryTime: 0,
          replayWindow: { interval: 0, startTime: 0 },
          timeRange: { rangeDuration: 60 }
        },
        UserSettingsActions.navCollapse(true)
      )
    ).toEqual({
      duration: 60,
      interface: { navCollapse: true },
      refreshInterval: 60000,
      replayActive: false,
      replayQueryTime: 0,
      replayWindow: { interval: 0, startTime: 0 },
      timeRange: { rangeDuration: 60 }
    });
  });

  it('should set duration', () => {
    expect(
      UserSettingsState(
        {
          duration: 60,
          interface: { navCollapse: false },
          refreshInterval: 60000,
          replayActive: false,
          replayQueryTime: 0,
          replayWindow: { interval: 0, startTime: 0 },
          timeRange: { rangeDuration: 60 }
        },
        UserSettingsActions.setDuration(120)
      )
    ).toEqual({
      duration: 120,
      interface: { navCollapse: false },
      refreshInterval: 60000,
      replayActive: false,
      replayQueryTime: 0,
      replayWindow: { interval: 0, startTime: 0 },
      timeRange: { rangeDuration: 60 }
    });
  });

  it('should set refresh interval', () => {
    expect(
      UserSettingsState(
        {
          duration: 60,
          interface: { navCollapse: false },
          refreshInterval: 60000,
          replayActive: false,
          replayQueryTime: 0,
          replayWindow: { interval: 0, startTime: 0 },
          timeRange: { rangeDuration: 60 }
        },
        UserSettingsActions.setRefreshInterval(120000)
      )
    ).toEqual({
      duration: 60,
      interface: { navCollapse: false },
      refreshInterval: 120000,
      replayActive: false,
      replayQueryTime: 0,
      replayWindow: { interval: 0, startTime: 0 },
      timeRange: { rangeDuration: 60 }
    });
  });

  it('should set time range', () => {
    expect(
      UserSettingsState(
        {
          duration: 60,
          interface: { navCollapse: false },
          refreshInterval: 60000,
          replayActive: false,
          replayQueryTime: 0,
          replayWindow: { interval: 0, startTime: 0 },
          timeRange: { rangeDuration: 60 }
        },
        UserSettingsActions.setTimeRange({ rangeDuration: 120 })
      )
    ).toEqual({
      duration: 60,
      interface: { navCollapse: false },
      refreshInterval: 60000,
      replayActive: false,
      replayQueryTime: 0,
      replayWindow: { interval: 0, startTime: 0 },
      timeRange: { rangeDuration: 120 }
    });
  });
});

it('should set replay active', () => {
  expect(
    UserSettingsState(
      {
        duration: 60,
        interface: { navCollapse: false },
        refreshInterval: 60000,
        replayActive: false,
        replayQueryTime: 0,
        replayWindow: { interval: 0, startTime: 0 },
        timeRange: { rangeDuration: 60 }
      },
      UserSettingsActions.toggleReplayActive()
    )
  ).toEqual({
    duration: 60,
    interface: { navCollapse: false },
    refreshInterval: 60000,
    replayActive: true,
    replayQueryTime: 0,
    replayWindow: { interval: 0, startTime: 0 },
    timeRange: { rangeDuration: 60 }
  });
});

it('should set replay window', () => {
  expect(
    UserSettingsState(
      {
        duration: 60,
        interface: { navCollapse: false },
        refreshInterval: 60000,
        replayActive: false,
        replayQueryTime: 0,
        replayWindow: { interval: 0, startTime: 0 },
        timeRange: { rangeDuration: 60 }
      },
      UserSettingsActions.setReplayWindow({ interval: 600, startTime: 1234567890 })
    )
  ).toEqual({
    duration: 60,
    interface: { navCollapse: false },
    refreshInterval: 60000,
    replayActive: false,
    replayQueryTime: 0,
    replayWindow: { interval: 600, startTime: 1234567890 },
    timeRange: { rangeDuration: 60 }
  });
});
