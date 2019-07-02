import { TimeSeries, Histogram } from '../types/Metrics';

type Series = {
  name: string;
  values: number[];
};

type Normalized = {
  x: number[];
  ys: Series[];
};

const compare = (a: number, b: number) => {
  if (Math.abs(a - b) < 1000) {
    // Consider equal
    return 0;
  }
  return a - b;
};

// Exported for test
export const mergeTimestampsAndNormalize = (normalized: Normalized, newX: number[], newY: Series): Normalized => {
  if (normalized.x.length === 0) {
    return {
      x: newX,
      ys: [newY]
    };
  }
  if (newX.length === 0) {
    return normalized;
  }
  const cmp = compare(normalized.x[0], newX[0]);

  if (cmp < 0) {
    // "current" starts before "new" => don't change current timestamps, but fill newY with undefined values
    for (let i = 0; i < normalized.x.length && compare(normalized.x[i], newX[0]) < 0; i++) {
      newY.values.unshift(NaN);
    }
  } else if (cmp > 0) {
    // "new" starts before "current" => prepend "new" in "current", fill all previously normalized Y with undefined values
    const toPrepend: number[] = [];
    for (let i = 0; i < newX.length && compare(normalized.x[0], newX[i]) > 0; i++) {
      toPrepend.push(newX[i]);
      normalized.ys.forEach(y => y.values.unshift(NaN));
    }
    normalized.x.unshift(...toPrepend);
  } else {
    // Same timestamps => nothing to normalize
  }

  normalized.ys.push(newY);
  return normalized;
};

export default {
  histogramToC3Columns(histogram: Histogram) {
    const stats = Object.keys(histogram);
    if (stats.length === 0 || histogram[stats[0]].matrix.length === 0) {
      return [['x'], ['']];
    }

    let normalized: Normalized = { x: [], ys: [] };
    stats.forEach(stat => {
      const matrix = histogram[stat].matrix;
      matrix.forEach(mat => {
        const timestamps = mat.values.map(dp => dp[0] * 1000);
        const y: Series = {
          name: mat.name,
          values: mat.values.map(dp => dp[1])
        };
        normalized = mergeTimestampsAndNormalize(normalized, timestamps, y);
      });
    });

    const x = ['x' as any].concat(normalized.x);
    const ys = normalized.ys.map(y => [y.name as any].concat(y.values));

    // timestamps + data is the format required by C3 (all concatenated: an array with arrays)
    return [x, ...ys];
  },

  toC3Columns(matrix?: TimeSeries[], title?: string): any[] {
    if (!matrix || matrix.length === 0) {
      return [['x'], [title || '']];
    }

    let normalized: Normalized = { x: [], ys: [] };
    matrix.forEach(mat => {
      const timestamps = mat.values.map(dp => dp[0] * 1000);
      const y: Series = {
        name: title || mat.name,
        values: mat.values.map(dp => dp[1])
      };
      normalized = mergeTimestampsAndNormalize(normalized, timestamps, y);
    });

    const x = ['x' as any].concat(normalized.x);
    const ys = normalized.ys.map(y => [y.name as any].concat(y.values));

    // timestamps + data is the format required by C3 (all concatenated: an array with arrays)
    return [x, ...ys];
  }
};
