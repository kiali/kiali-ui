import * as t from 'io-ts';

const NamespaceCodec = t.exact(
  t.interface({
    name: t.string
  })
);

export const NamespaceArrayCodec = t.array(NamespaceCodec);

export default interface Namespace extends t.TypeOf<typeof NamespaceCodec> {}

export const namespaceFromString = (namespace: string) => ({ name: namespace });

export const namespacesFromString = (namespaces: string) => {
  return namespaces.split(',').map(name => namespaceFromString(name));
};

export const namespacesToString = (namespaces: Namespace[]) => namespaces.map(namespace => namespace.name).join(',');
