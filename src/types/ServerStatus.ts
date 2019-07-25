import * as t from 'io-ts';

const ExternalServiceInfoCodec = t.exact(
  // This will strip away any extra field upon decoding
  t.intersection([
    // This merge together 2 types, it serves us to have optional and required arguments
    t.interface({
      // Interface with required arguments
      name: t.string
    }),
    t.partial({
      // Interface with optional arguments
      version: t.string,
      url: t.string
    })
  ]),
  'ExternalServiceInfo'
);

// Why don't we use something like t.union([t.undefined, t.string]); for optional fields instead? Because:
// "name?: string" is not the same as "name: string | undefined"
// In the second case, name is required, but it can have the value undefined, in the first it can be absent.
// https://github.com/gcanti/io-ts/issues/140#issue-300269078

export const ServerStatusCodec = t.exact(
  t.interface({
    status: t.record(t.string, t.string),
    externalServices: t.array(ExternalServiceInfoCodec),
    warningMessages: t.array(t.string)
  }),
  'ServerStatus'
);

// Using extends will show easier to read errors when a type is not correct
export type ServerStatus = t.TypeOf<typeof ServerStatusCodec>;
