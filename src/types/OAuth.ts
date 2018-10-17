export interface OAuthMetadata {
  issuer: string,
  authorizationEndpoint: string,
  tokenEndpoint: string,
  scopesSupported: string[],
  grantTypesSupported: string[],
  codeChallengeMethodsSupported: string[]
}
