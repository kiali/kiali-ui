import { TraceSummary, Trace, TraceSummaries } from '../../types/Jaeger';
import _values from 'lodash/values';

export const MOST_RECENT = 'MOST_RECENT';
export const LONGEST_FIRST = 'LONGEST_FIRST';
export const SHORTEST_FIRST = 'SHORTEST_FIRST';
export const MOST_SPANS = 'MOST_SPANS';
export const LEAST_SPANS = 'LEAST_SPANS';

const isErrorTag = ({ key, value }) => key === 'error' && (value === true || value === 'true');

export const getTraceSummary = (trace: Trace): TraceSummary => {
  const { processes, spans, traceID } = trace;

  let traceName = '';
  let minTs = Number.MAX_SAFE_INTEGER;
  let maxTs = Number.MIN_SAFE_INTEGER;
  let numErrorSpans = 0;
  // serviceName -> { name, numberOfSpans }
  const serviceMap = {};
  for (let i = 0; i < spans.length; i++) {
    const { duration, processID, references, startTime, tags } = spans[i];
    // time bounds of trace
    minTs = minTs > startTime ? startTime : minTs;
    maxTs = maxTs < startTime + duration ? startTime + duration : maxTs;
    // number of error tags
    if (tags.some(isErrorTag)) {
      numErrorSpans += 1;
    }
    // number of span per service
    const { serviceName } = processes[processID];
    let svcData = serviceMap[serviceName];
    if (svcData) {
      svcData.numberOfSpans += 1;
    } else {
      svcData = {
        name: serviceName,
        numberOfSpans: 1
      };
      serviceMap[serviceName] = svcData;
    }
    if (!references || !references.length) {
      const { operationName } = spans[i];
      traceName = `${svcData.name}: ${operationName}`;
    }
  }
  return {
    traceName,
    traceID,
    duration: (maxTs - minTs) / 1000,
    numberOfErredSpans: numErrorSpans,
    numberOfSpans: spans.length,
    services: _values(serviceMap),
    timestamp: minTs / 1000
  };
};

/**
 * Transforms `Trace` values into `TraceSummary` values and finds the max duration of the traces.
 *
 * @param  {(Trace | Error)[]} _traces The trace data in the format from the HTTP request.
 * @return {TraceSummaries} The `{ traces, maxDuration }` value.
 */
export const getTraceSummaries = (_traces: (Trace | Error)[]): TraceSummaries => {
  const traces = _traces
    .map(item => {
      if (item instanceof Error) {
        return null;
      }
      return getTraceSummary(item);
    })
    .filter(Boolean);
  const maxDuration = Math.max.apply(
    Math,
    traces.map(o => {
      return o ? o.duration : 0;
    })
  );

  return { maxDuration: maxDuration, traces: traces };
};

const comparators = {
  [MOST_RECENT]: (a, b) => +(b.timestamp > a.timestamp) || +(a.timestamp === b.timestamp) - 1,
  [SHORTEST_FIRST]: (a, b) => +(a.duration > b.duration) || +(a.duration === b.duration) - 1,
  [LONGEST_FIRST]: (a, b) => +(b.duration > a.duration) || +(a.duration === b.duration) - 1,
  [MOST_SPANS]: (a, b) => +(b.numberOfSpans > a.numberOfSpans) || +(a.numberOfSpans === b.numberOfSpans) - 1,
  [LEAST_SPANS]: (a, b) => +(a.numberOfSpans > b.numberOfSpans) || +(a.numberOfSpans === b.numberOfSpans) - 1
};

/**
 * Sorts `TraceSummary[]`, in place.
 *
 * @param  {TraceSummary[]} traces The `TraceSummary` array to sort.
 * @param  {string} sortBy A sort specification, see ./order-by.js.
 */
export const sortTraces = (traces: TraceSummary[], sortBy: string) => {
  const comparator = comparators[sortBy] || comparators[LONGEST_FIRST];
  traces.sort(comparator);
  return traces;
};
