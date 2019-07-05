import { mergeTimestampsAndNormalize } from '../Graphing';
import graphUtils from '../Graphing';
import { TimeSeries } from 'types/Metrics';

describe('C3 series normalization', () => {
  it('should normalize with ealier metric', () => {
    const current = {
      x: [15000, 20000, 25000, 30000],
      ys: [
        {
          name: 'a',
          values: [5, 6, 6, 5]
        },
        {
          name: 'b',
          values: [9, 7, 7, 9]
        }
      ]
    };
    const newTimestamps = [10001, 15001, 20001, 25001, 30001];
    const newValues = {
      name: 'c',
      values: [3, 2, 3, 2, 3]
    };
    const normalized = mergeTimestampsAndNormalize(current, newTimestamps, newValues);

    expect(normalized.x).toEqual([10001, 15000, 20000, 25000, 30000]);
    expect(normalized.ys).toHaveLength(3);
    expect(normalized.ys[0].name).toEqual('a');
    expect(normalized.ys[1].name).toEqual('b');
    expect(normalized.ys[2].name).toEqual('c');
    expect(normalized.ys[0].values).toEqual([NaN, 5, 6, 6, 5]);
    expect(normalized.ys[1].values).toEqual([NaN, 9, 7, 7, 9]);
    expect(normalized.ys[2].values).toEqual([3, 2, 3, 2, 3]);
  });

  it('should normalize with later metric', () => {
    const current = {
      x: [15000, 20000, 25000, 30000],
      ys: [
        {
          name: 'a',
          values: [5, 6, 6, 5]
        },
        {
          name: 'b',
          values: [9, 7, 7, 9]
        }
      ]
    };
    const newTimestamps = [20001, 25001, 30001];
    const newValues = {
      name: 'c',
      values: [3, 2, 3]
    };
    const normalized = mergeTimestampsAndNormalize(current, newTimestamps, newValues);

    expect(normalized.x).toEqual([15000, 20000, 25000, 30000]);
    expect(normalized.ys).toHaveLength(3);
    expect(normalized.ys[0].name).toEqual('a');
    expect(normalized.ys[1].name).toEqual('b');
    expect(normalized.ys[2].name).toEqual('c');
    expect(normalized.ys[0].values).toEqual([5, 6, 6, 5]);
    expect(normalized.ys[1].values).toEqual([9, 7, 7, 9]);
    expect(normalized.ys[2].values).toEqual([NaN, 3, 2, 3]);
  });
});

describe('C3 conversion', () => {
  it('should convert with normalized metrics', () => {
    const input: TimeSeries[] = [
      {
        name: 'a',
        metric: {},
        values: [[15, 5], [20, 6], [25, 5]]
      },
      {
        name: 'b',
        metric: {},
        values: [[25.5, 10]]
      }
    ];

    const c3Columns = graphUtils.toC3Columns(input);

    expect(c3Columns).toHaveLength(3);
    expect(c3Columns[0]).toEqual(['x', 15000, 20000, 25000]);
    expect(c3Columns[1]).toEqual(['a', 5, 6, 5]);
    expect(c3Columns[2]).toEqual(['b', NaN, NaN, 10]);
  });
});
