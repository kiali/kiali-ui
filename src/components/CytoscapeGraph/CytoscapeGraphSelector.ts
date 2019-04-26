export type CytoscapeGraphSelector = string;

interface CytoscapeElementData {
  app?: string;
  id?: string;
  namespace?: string;
  nodeType?: string;
  service?: string;
  version?: string;
  workload?: string;
}

export class CytoscapeGraphSelectorBuilder {
  private data: CytoscapeElementData = {};

  app(app: string) {
    this.data.app = app;
    return this;
  }

  id(id: string) {
    this.data.id = id;
    return this;
  }

  namespace(namespace: string) {
    this.data.namespace = namespace;
    return this;
  }

  nodeType(nodeType: string) {
    this.data.nodeType = nodeType;
    return this;
  }

  service(service: string) {
    this.data.service = service;
    return this;
  }

  version(version: string) {
    this.data.version = version;
    return this;
  }

  workload(workload: string) {
    this.data.workload = workload;
    return this;
  }

  build() {
    return 'node' + this.buildDataSelector();
  }

  private buildDataSelector() {
    return Object.keys(this.data).reduce((dataSelector: string, key: string) => {
      return dataSelector + `[${key}="${this.data[key]}"]`;
    }, '');
  }
}
