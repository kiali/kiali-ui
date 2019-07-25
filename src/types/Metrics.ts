import * as t from 'io-ts';
import { LabelDisplayName, SingleLabelValues } from '@kiali/k-charted-pf3';

// First is timestamp, second is value
const DatapointCodec = t.tuple([t.number, t.number], 'Datapoint');
const MetricCodec = t.record(t.string, t.string, 'Metric');

const TimeSeriesCodec = t.exact(
  t.interface({
    metric: MetricCodec,
    values: t.array(DatapointCodec),
    name: t.string
  }),
  'TimeSeries'
);

const MetricGroupCodec = t.exact(
  t.interface({
    matrix: t.array(TimeSeriesCodec)
  }),
  'MetricsGroup'
);

const HistogramCodec = t.record(t.string, MetricGroupCodec, 'Histogram');

export const MetricsCodec = t.exact(
  t.interface({
    metrics: t.record(t.string, MetricGroupCodec),
    histograms: t.record(t.string, HistogramCodec)
  }),
  'Metrics'
);

export type Metric = t.TypeOf<typeof MetricCodec>;

export interface TimeSeries extends t.TypeOf<typeof TimeSeriesCodec> {}

export interface Metrics extends t.TypeOf<typeof MetricsCodec> {}

export type Histogram = t.TypeOf<typeof HistogramCodec>;

export interface MetricGroup extends t.TypeOf<typeof MetricGroupCodec> {}

export type Datapoint = t.TypeOf<typeof DatapointCodec>;

export enum MetricsObjectTypes {
  SERVICE,
  WORKLOAD,
  APP
}

// Map of all labels, each with its set of values
export type AllLabelsValues = Map<LabelDisplayName, SingleLabelValues>;
