import * as t from 'io-ts';
import * as tutils from '../utils/Io-ts';

export enum AuthStrategy {
  login = 'login',
  anonymous = 'anonymous',
  openshift = 'openshift'
}

export const AuthStrategyCodec = tutils.enumType<AuthStrategy>(AuthStrategy, 'AuthStrategy');

const AuthConfigCodecRequired = t.interface({
  strategy: AuthStrategyCodec
});

const AuthConfigCodecPartial = t.partial({
  authorizationEndpoint: t.string,
  logoutEndpoint: t.string,
  logoutRedirect: t.string,
  secretMissing: t.boolean
});

export const AuthConfigCodec = t.exact(t.intersection([AuthConfigCodecRequired, AuthConfigCodecPartial]), 'AuthConfig');

export const SessionInfoCodec = t.exact(
  t.interface({
    username: t.string,
    expiresOn: t.string
  }),
  'SessionInfo'
);

export const AuthInfoCodec = t.exact(
  t.intersection([
    t.interface({
      sessionInfo: SessionInfoCodec
    }),
    AuthConfigCodecRequired,
    AuthConfigCodecPartial
  ]),
  'AuthInfo'
);

export interface AuthConfig extends t.TypeOf<typeof AuthConfigCodec> {}
export interface AuthInfo extends t.TypeOf<typeof AuthInfoCodec> {}
export interface SessionInfo extends t.TypeOf<typeof SessionInfoCodec> {}

// Stores the result of a computation:
// hold = stop all computation and wait for a side-effect, such as a redirect
// continue = continue...
// success = authentication was a success, session is available
// failure = authentication failed, session is undefined but error is available
export enum AuthResult {
  HOLD = 'hold',
  CONTINUE = 'continue',
  SUCCESS = 'success',
  FAILURE = 'failure'
}
