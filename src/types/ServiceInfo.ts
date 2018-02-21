interface ServiceInfo {
  labels?: Map<string, string>;
  type: string;
  ip: string;
  ports?: Port[];
  endpoints?: Endpoint;
  pods?: Pod[];
  rules?: any;
  dependencies?: Source[];
}

interface Endpoint {
  addresses?: EndpointAddress[];
  ports?: Port[];
}

interface EndpointAddress {
  ip: string;
  kind?: string;
  name?: string;
}

interface Port {
  protocol: string;
  port: number;
  name: string;
}

interface Pod {
  name: string;
  labels?: Map<string, string>;
}
interface Source {
  destination: string;
  source: string;
}

class Info implements ServiceInfo {
  labels?: Map<string, string>;
  type: string;
  ip: string;
  ports?: Port[];
  endpoints?: Endpoint;
  pods?: Pod[];
  rules?: any;
  dependencies?: Source[];

  constructor(data: any) {
    this.labels = data.labels;
    this.type = data.type;
    this.ip = data.ip;
    this.ports = data.ports;
    this.endpoints = data.endpoints;
    this.pods = data.pods || [];
    this.rules = data.rules;
    this.dependencies = data.dependencies;
  }
  GetPorts = () => {
    if (this.endpoints) {
      return this.endpoints.ports;
    }
    return [];
  }

  GetAddresses = () => {
    if (this.endpoints) {
      return this.endpoints.addresses;
    }
    return [];
  }

  GetNumberAddresses = () => {
    if (this.endpoints) {
      return this.endpoints.addresses ? this.endpoints.addresses.length : 0;
    }
    return 0;
  }

  GetNumberPods = () => {
    return this.pods ? this.pods.length : 0;
  }
}

export default Info;
