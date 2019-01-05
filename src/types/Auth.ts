export enum AuthStrategy {
  login = 'login',
  anonymous = 'anonymous',
  openshift = 'openshift'
}

export interface AuthInfo {
  strategy: AuthStrategy;
  authorizationEndpoint?: string;
}
