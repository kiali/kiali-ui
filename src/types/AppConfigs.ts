import { AuthConfig } from './Auth';

interface Configs {
  authenticationConfig?: AuthConfig;
}

const AppConfigs: Configs = {};

export default AppConfigs;

export interface StatusInfo {
  status: { [key: string]: string };
  externalServices: ExternalServiceInfo[];
  warningMessages: string[];
}

interface ExternalServiceInfo {
  name: string;
  version?: string;
  url?: string;
}
