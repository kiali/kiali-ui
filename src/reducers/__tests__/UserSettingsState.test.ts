import UserSettingsState from '../UserSettingsState';
import { GlobalActions } from '../../actions/GlobalActions';
import { UserSettingsActions } from '../../actions/UserSettingsActions';

describe('UserSettingsState reducer', () => {
  const RealDate = Date;
  const currentDate = Date.now();

  const mockDate = date => {
    global.Date = jest.fn(() => date) as any;
    return date;
  };

  beforeEach(() => {
    mockDate(currentDate);
  });

  afterEach(() => {
    global.Date = RealDate;
  });

  it('should return the initial state', () => {
    expect(UserSettingsState(undefined, GlobalActions.unknown())).toEqual({
      interface: { navCollapse: false },
      duration: 60,
      refreshInterval: 15000,
      lastRefreshAt: currentDate
    });
  });

  it('should collapse the nav', () => {
    expect(
      UserSettingsState(
        {
          interface: { navCollapse: false },
          duration: 60,
          refreshInterval: 60,
          lastRefreshAt: currentDate
        },
        UserSettingsActions.navCollapse(true)
      )
    ).toEqual({
      interface: { navCollapse: true },
      duration: 60,
      refreshInterval: 60,
      lastRefreshAt: currentDate
    });
  });

  it('should set duration', () => {
    expect(
      UserSettingsState(
        {
          interface: { navCollapse: false },
          duration: 60,
          refreshInterval: 60,
          lastRefreshAt: currentDate
        },
        UserSettingsActions.setDuration(120)
      )
    ).toEqual({
      interface: { navCollapse: false },
      duration: 120,
      refreshInterval: 60,
      lastRefreshAt: currentDate
    });
  });

  it('should set refresh interval', () => {
    expect(
      UserSettingsState(
        {
          interface: { navCollapse: false },
          duration: 60,
          refreshInterval: 60,
          lastRefreshAt: currentDate
        },
        UserSettingsActions.setRefreshInterval(120)
      )
    ).toEqual({
      interface: { navCollapse: false },
      duration: 60,
      refreshInterval: 120,
      lastRefreshAt: currentDate
    });
  });
});
