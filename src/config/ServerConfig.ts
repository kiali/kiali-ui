import deepFreeze from 'deep-freeze';
import { store } from '../store/ConfigStore';
import { KialiAppState, ServerConfig } from '../store/Store';
import { PersistPartial } from 'redux-persist';

// It's not great to access the store directly for convenience but the alternative is
// a huge code ripple just to access some server config. better to just have this one utility.
export const serverConfig = (): ServerConfig => {
  const actualState = store.getState() || ({} as KialiAppState & PersistPartial);
  return deepFreeze(actualState.serverConfig);
};
