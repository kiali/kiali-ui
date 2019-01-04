export enum AuthStrategy {
  login = 'login',
  anonymous = 'anonymous'
}

export interface AuthInfo {
  strategy: AuthStrategy;
  authorizationEndpoint?: string;
}
