import * as React from 'react';
import { InfoAltIcon } from '@patternfly/react-icons';
import _round from 'lodash/round';

import { HeatMap } from 'components/HeatMap/HeatMap';
import { MetricsStatsQuery, statsQueryToKey, genStatsKey } from 'types/MetricsOptions';
import { MetricsStats } from 'types/Metrics';
import { PfColors } from 'components/Pf/PfColors';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { EnvoySpanInfo, RichSpanData } from 'types/JaegerInfo';

// TODO / follow-up: these variables are to be removed from here and managed from the toolbar
const statsQuantiles = ['0.5', '0.9', '0.99'];
export const statsAvgWithQuantiles = ['avg', ...statsQuantiles];
const allStatsIntervals = ['10m', '60m', '6h'];
const compactStatsIntervals = ['60m', '6h'];
const statsPerPeer = false;
let statsCompareKind: 'app' | 'workload' = 'workload';

const statToText = {
  avg: { short: 'avg', long: 'average' },
  '0.5': { short: 'p50', long: 'median' },
  '0.75': { short: 'p75', long: '75th percentile' },
  '0.8': { short: 'p80', long: '80th percentile' },
  '0.9': { short: 'p90', long: '90th percentile' },
  '0.99': { short: 'p99', long: '99th percentile' },
  '0.999': { short: 'p99.9', long: '99.9th percentile' }
};

export const buildQueriesFromSpans = (items: RichSpanData[]) => {
  const queryTime = Math.floor(Date.now() / 1000);
  // Load stats for first 10 spans, to avoid heavy loading. More stats can be loaded individually.
  const queries = items
    .filter(s => s.type === 'envoy')
    .slice(0, 10)
    .flatMap(item => {
      const info = item.info as EnvoySpanInfo;
      if (!info.direction) {
        console.warn('Could not determine direction from Envoy span.');
        return [];
      }
      if (statsPerPeer && !info.peer) {
        console.warn('Could not determine peer from Envoy span.');
        return [];
      }
      const name = statsCompareKind === 'app' ? item.app : item.workload;
      if (!name) {
        console.warn('Could not determine workload from Envoy span.');
        return [];
      }
      const query: MetricsStatsQuery = {
        queryTime: queryTime,
        target: {
          namespace: item.namespace,
          name: name,
          kind: statsCompareKind
        },
        peerTarget: statsPerPeer ? info.peer : undefined,
        interval: '', // placeholder
        direction: info.direction,
        avg: true,
        quantiles: statsQuantiles
      };
      return allStatsIntervals.map(interval => ({ ...query, interval: interval }));
    });
  return deduplicateMetricQueries(queries);
};

const deduplicateMetricQueries = (queries: MetricsStatsQuery[]) => {
  // Exclude redundant queries based on this keygen as a merger, + hashmap
  const dedup = new Map<string, MetricsStatsQuery>();
  queries.forEach(q => {
    const key = statsQueryToKey(q);
    if (key) {
      dedup.set(key, q);
    }
  });
  return Array.from(dedup.values());
};

export type StatsWithIntervalIndex = MetricsStats & { intervalIndex: number };
export type StatsMatrix = (number | undefined)[][];
export const initStatsMatrix = (intervals: string[]): StatsMatrix => {
  return new Array(statsAvgWithQuantiles.length)
    .fill(0)
    .map(() => new Array(intervals.length).fill(0).map(() => undefined));
};

export const statsToMatrix = (itemStats: StatsWithIntervalIndex[], intervals: string[]): StatsMatrix => {
  const matrix = initStatsMatrix(intervals);
  itemStats.forEach(stats => {
    stats.responseTimes.forEach(stat => {
      const x = statsAvgWithQuantiles.indexOf(stat.name);
      if (x >= 0) {
        matrix[x][stats.intervalIndex] = stat.value;
      }
    });
  });
  return matrix;
};

const renderHeatMap = (
  item: RichSpanData,
  stats: StatsWithIntervalIndex[],
  intervals: string[],
  compactMode: boolean
) => {
  return (
    <HeatMap
      xLabels={statsAvgWithQuantiles.map(s => statToText[s]?.short || s)}
      yLabels={intervals}
      data={statsToMatrix(stats, intervals)}
      displayMode={compactMode ? 'compact' : 'normal'}
      colorMap={HeatMap.HealthColorMap}
      dataRange={{ from: -10, to: 10 }}
      colorUndefined={PfColors.Black200}
      valueFormat={v => (v > 0 ? '+' : '') + _round(v, 1)}
      tooltip={(x, y, v) => {
        // Build explanation tooltip
        const slowOrFast = v > 0 ? 'slower' : 'faster';
        const stat = statToText[statsAvgWithQuantiles[x]]?.long || statsAvgWithQuantiles[x];
        const interval = intervals[y];
        const info = item.info as EnvoySpanInfo;
        let dir = 'from',
          rev = 'to';
        if (info.direction === 'inbound') {
          dir = 'to';
          rev = 'from';
        }
        const thisObj = statsCompareKind === 'app' ? item.app : item.workload;
        const peer = statsPerPeer ? rev + ' ' + info.peer : '';
        return `This request has been ${_round(Math.abs(v), 2)}ms ${slowOrFast} than the ${stat} of all ${
          info.direction
        } requests ${dir} ${thisObj} ${peer} in the last ${interval}`;
      }}
    />
  );
};

export const getSpanStats = (
  item: RichSpanData,
  intervals: string[],
  metricsStats: Map<string, MetricsStats>
): StatsWithIntervalIndex[] => {
  return intervals.flatMap((interval, intervalIndex) => {
    const info = item.info as EnvoySpanInfo;
    const target = {
      namespace: item.namespace,
      name: statsCompareKind === 'app' ? item.app : item.workload!,
      kind: statsCompareKind
    };
    const key = genStatsKey(target, statsPerPeer ? info.peer : undefined, info.direction!, interval);
    if (key) {
      const stats = metricsStats.get(key);
      if (stats) {
        const baseLine = item.duration / 1000;
        const statsDiff = stats.responseTimes.map(stat => {
          return { name: stat.name, value: baseLine - stat.value };
        });
        return [{ responseTimes: statsDiff, intervalIndex: intervalIndex }];
      }
    }
    return [];
  });
};

export const renderMetricsComparison = (
  item: RichSpanData,
  compactMode: boolean,
  metricsStats: Map<string, MetricsStats>,
  load: () => void
) => {
  const intervals = compactMode ? compactStatsIntervals : allStatsIntervals;
  const itemStats = getSpanStats(item, intervals, metricsStats);
  if (itemStats.length > 0) {
    return (
      <>
        {!compactMode && (
          <Tooltip content="This heatmap is a comparison matrix of this request duration against duration statistics aggregated over time. Move the pointer over cells to get more details.">
            <>
              <InfoAltIcon /> <strong>Comparison map: </strong>
            </>
          </Tooltip>
        )}
        {renderHeatMap(item, itemStats, intervals, compactMode)}
      </>
    );
  }
  return (
    <Tooltip content="Click to load more statistics for this request">
      <Button onClick={load} variant={ButtonVariant.link}>
        <strong>Load statistics</strong>
      </Button>
    </Tooltip>
  );
};

export const renderTraceHeatMap = (matrix: StatsMatrix, intervals: string[], compactMode: boolean) => {
  return (
    <HeatMap
      xLabels={statsAvgWithQuantiles.map(s => statToText[s]?.short || s)}
      yLabels={intervals}
      data={matrix}
      displayMode={compactMode ? 'compact' : 'normal'}
      colorMap={HeatMap.HealthColorMap}
      dataRange={{ from: -10, to: 10 }}
      colorUndefined={PfColors.Black200}
      valueFormat={v => (v > 0 ? '+' : '') + _round(v, 1)}
      tooltip={(x, y, v) => {
        // Build explanation tooltip
        const slowOrFast = v > 0 ? 'slower' : 'faster';
        const stat = statToText[statsAvgWithQuantiles[x]]?.long || statsAvgWithQuantiles[x];
        const interval = intervals[y];
        return `Trace requests have been, in average, ${_round(
          Math.abs(v),
          2
        )}ms ${slowOrFast} than the ${stat} of the requests involving the same services in the last ${interval}`;
      }}
    />
  );
};
