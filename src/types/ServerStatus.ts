export interface ServerStatus {
  status: { [key: string]: string };
  externalServices: ExternalServiceInfo[];
  warningMessages: string[];
  istioEnvironment: IstioEnvironment;
}

interface ExternalServiceInfo {
  name: string;
  version?: string;
  url?: string;
}

interface IstioEnvironment {
  isMaistra: boolean;
}
