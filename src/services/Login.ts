import * as API from './Api';

import { AuthInfo, AuthStrategy } from '../types/Auth';
import { Session } from 'src/store/Store';

// We just mock the types for state for now, to avoid injecting more
// dependencies on the service.
type Dispatch = any;
type AppState = any;

// Stores the result of a computation:
// hold = stop all computation and wait for a side-effect, such as a redirect
// continue = continue...
// success = authentication was a success, session is available
// failure = authentication failed, session is undefined but error is available
export enum Result {
  hold = 'hold',
  continue = 'continue',
  success = 'success',
  failure = 'failure'
}

export interface LoginResult {
  status: Result;
  session?: Session;
  error?: any;
}

interface LoginStrategy<T = {}> {
  prepare: (info: AuthInfo) => Promise<Result>;
  perform: (request: DispatchRequest<T>) => Promise<LoginResult>;
}

interface DispatchRequest<T> {
  dispatch: Dispatch;
  getState: () => AppState;
  data: T;
}

class AnonymousLogin implements LoginStrategy {
  public async prepare(info: AuthInfo) {
    return Result.continue;
  }

  public async perform(request: DispatchRequest<{}>): Promise<LoginResult> {
    const session: Session = (await API.login()).data;

    return {
      status: Result.success,
      session: session
    };
  }
}

interface WebLoginData {
  username: string;
  password: string;
}

class WebLogin implements LoginStrategy<WebLoginData> {
  public async prepare(info: AuthInfo) {
    return Result.continue;
  }

  public async perform(request: DispatchRequest<WebLoginData>): Promise<LoginResult> {
    const session = (await API.login(request.data)).data;

    return {
      status: Result.success,
      session: session
    };
  }
}

class OpenshiftLogin implements LoginStrategy {
  public async prepare(info: AuthInfo) {
    if (info.authorizationEndpoint === undefined) {
      return Result.failure;
    }

    if (window.location.hash.startsWith('#access_token')) {
      return Result.continue;
    } else {
      window.location.href = info.authorizationEndpoint!;

      return Result.hold;
    }
  }

  public async perform(request: DispatchRequest<any>): Promise<LoginResult> {
    const session = (await API.checkOpenshiftAuth(window.location.hash.substring(1))).data;

    console.log(`Session: ${JSON.stringify(session)}`);

    return {
      status: Result.success,
      session: session
    };
  }
}

export class LoginDispatcher {
  strategyMapping: Map<AuthStrategy, LoginStrategy>;
  info?: AuthInfo;

  constructor() {
    this.strategyMapping = new Map<AuthStrategy, LoginStrategy>();

    this.strategyMapping.set(AuthStrategy.anonymous, new AnonymousLogin());
    this.strategyMapping.set(AuthStrategy.login, new WebLogin());
    this.strategyMapping.set(AuthStrategy.openshift, new OpenshiftLogin());
  }

  public async prepare(): Promise<Result> {
    const info = await this.getInfo();
    const strategy = this.strategyMapping.get(info.strategy)!;

    try {
      const delay = async (ms: number = 3000) => {
        return new Promise(resolve => setTimeout(resolve, ms));
      };

      const result = await strategy.prepare(info);

      // If preparation requires a hold time, with things such as redirects that
      // require the auth flow to stop running for a while, we do that.
      //
      // If it fails to run for a while, we return a failure state.
      // This assume that the user is leaving the page for auth, which should be
      // the case for oauth implementations.
      if (result === Result.hold) {
        await delay();

        return Promise.reject({
          status: Result.failure,
          error: 'Failed to redirect user to authentication page.'
        });
      } else {
        return result;
      }
    } catch (error) {
      return Promise.reject({ status: Result.failure, error });
    }
  }

  public async perform(request: DispatchRequest<any>): Promise<LoginResult> {
    const strategy = this.strategyMapping.get((await this.getInfo()).strategy)!;

    try {
      return await strategy.perform(request);
    } catch (error) {
      return Promise.reject({ status: Result.failure, error });
    }
  }

  private async getInfo(): Promise<AuthInfo> {
    if (this.info) {
      return this.info;
    }

    this.info = await (await API.getAuthInfo()).data;

    return this.info;
  }
}
