import * as t from 'io-ts';

// from https://github.com/gcanti/io-ts/issues/216#issuecomment-471497998
class EnumType<A> extends t.Type<A> {
  public readonly _tag: 'EnumType' = 'EnumType';
  public enumObject!: object;
  public constructor(e: object, name?: string) {
    super(
      name || 'enum',
      (u): u is A => Object.values(this.enumObject).some(v => v === u),
      (u, c) => (this.is(u) ? t.success(u) : t.failure(u, c)),
      t.identity
    );
    this.enumObject = e;
  }
}

export const enumType = <T>(e: object, name?: string) => new EnumType<T>(e, name);
