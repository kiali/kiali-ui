import { calculateErrorRate } from 'types/ErrorRate';
import { ErrorRateKind } from 'types/ErrorRate/ErrorRate';
import { hasHealth } from 'types/Health';

export const compareNullable = <T>(a: T | undefined, b: T | undefined, safeComp: (a2: T, b2: T) => number): number => {
  if (!a) {
    return !b ? 0 : 1;
  }
  if (!b) {
    return -1;
  }
  return safeComp(a, b);
};

export const compareHealth = (
  kind: ErrorRateKind,
  a: { name: string; namespace: string },
  b: { name: string; namespace: string }
): number => {
  if (hasHealth(a) && hasHealth(b)) {
    const statusForA = a.health.getGlobalStatus();
    const statusForB = b.health.getGlobalStatus();

    if (statusForA.priority === statusForB.priority) {
      // If both apps have same health status, use error rate to determine order.
      const ratioA = calculateErrorRate(a.namespace, a.name, kind, a.health.requests).errorRatio.global.status.value;
      const ratioB = calculateErrorRate(b.namespace, b.name, kind, b.health.requests).errorRatio.global.status.value;
      return ratioA === ratioB ? a.name.localeCompare(b.name) : ratioB - ratioA;
    }

    return statusForB.priority - statusForA.priority;
  } else {
    return 0;
  }
};
