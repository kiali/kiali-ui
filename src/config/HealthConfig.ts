import { HealthConfig, RegexConfig } from '../types/ServerConfig';

const allMatch = new RegExp('.*');

export const parseHealthConfig = (healthConfig: HealthConfig) => {
  for (let [key, r] of Object.entries(healthConfig.rate)) {
    healthConfig.rate[key].namespace = getExpr(healthConfig.rate[key].namespace);
    healthConfig.rate[key].name = getExpr(healthConfig.rate[key].name);
    healthConfig.rate[key].kind = getExpr(healthConfig.rate[key].kind);
    for (let t of Object.values(r.tolerance)) {
      t.code = getExpr(t.code, true);
      t.direction = getExpr(t.direction);
      t.protocol = getExpr(t.protocol);
    }
  }
  return healthConfig;
};

export const getExpr = (value: RegexConfig | undefined, code: boolean = false): RegExp => {
  if (value) {
    if (typeof value === 'string' && value !== '') {
      const v = value.replace('\\\\', '\\');
      return new RegExp(code ? replaceXCode(v) : v);
    }
    if (typeof value === 'object' && value.toString() !== '/(?:)/') {
      return value;
    }
  }
  return allMatch;
};

const replaceXCode = (value: string): string => {
  return value.replace(/x|X/g, '\\d');
};

/*
 Export for tests
*/
export const allMatchTEST = allMatch;
export const getExprTEST = getExpr;
