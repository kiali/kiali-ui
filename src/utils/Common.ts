import Namespace from '../types/Namespace';

export const removeDuplicatesArray = a => [...Array.from(new Set(a))] as string[];

export const arrayEquals = <T>(a1: T[], a2: T[], comparator: (v1: T, v2: T) => boolean) => {
  if (a1.length !== a2.length) {
    return false;
  }
  for (let i = 0; i < a1.length; ++i) {
    if (!comparator(a1[i], a2[i])) {
      return false;
    }
  }
  return true;
};

export const namespaceEquals = (ns1: Namespace[], ns2: Namespace[]): boolean =>
  arrayEquals(ns1, ns2, (n1, n2) => n1.name === n2.name);
