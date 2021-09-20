import { Namespace as GeneratedNamespace } from 'generated';

type Namespace = GeneratedNamespace;
export default Namespace;

export const namespaceFromString = (namespace: string) => ({ name: namespace });

export const namespacesFromString = (namespaces: string) => {
  return namespaces.split(',').map(name => namespaceFromString(name));
};

export const namespacesToString = (namespaces: Namespace[]) => namespaces.map(namespace => namespace.name).join(',');
