import * as API from './Api';

import { AuthInfo, AuthStrategy } from '../types/Auth';
import { Session } from 'src/store/Store';

// We just mock the types for state for now, to avoid injecting more
// dependencies on the service.
type Dispatch = any;
type AppState = any;

enum Result {
  continue,
  success,
  failure
}

interface LoginResult {
  status: Result;
  session?: Session;
  error?: any;
}

interface LoginStrategy<T = {}> {
  prepare: () => Promise<Result>;
  perform: (request: DispatchRequest<T>) => Promise<LoginResult>;
}

interface DispatchRequest<T> {
  dispatch: Dispatch;
  getState: () => AppState;
  data: T;
}

class AnonymousLogin implements LoginStrategy {
  public async prepare() {
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
  public async prepare() {
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

export class LoginDispatcher implements LoginStrategy<any> {
  strategyMapping: Map<AuthStrategy, LoginStrategy>;
  info?: AuthInfo;

  constructor() {
    this.strategyMapping = new Map<AuthStrategy, LoginStrategy>();

    this.strategyMapping.set(AuthStrategy.anonymous, new AnonymousLogin());
    this.strategyMapping.set(AuthStrategy.login, new WebLogin());
  }

  public async prepare(): Promise<Result> {
    const strategy = this.strategyMapping.get((await this.getInfo()).strategy)!;

    try {
      return await strategy.prepare();
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
