type KeyValuePair = {
  key: string;
  type: string;
  value: string;
};

export type Tag = KeyValuePair;

export type Log = {
  timestamp: number;
  fields: Array<KeyValuePair>;
};

export type Process = {
  serviceName: string;
  tags: Array<Tag>;
};

export type SpanReference = {
  refType: 'CHILD_OF' | 'FOLLOWS_FROM';
  spanID: string;
  traceID: string;
};

export type SpanData = {
  spanID: string;
  traceID: string;
  processID: string;
  operationName: string;
  startTime: number;
  duration: number;
  logs: Array<Log>;
  tags: Array<Tag>;
  references: Array<SpanReference>;
};

export type Span = SpanData & {
  depth: number;
  hasChildren: boolean;
  process: Process;
  relativeStartTime: number;
};

export type TraceData = {
  processes: Map<string, Process>;
  traceID: string;
};

export type Trace = TraceData & {
  duration: number;
  endTime: number;
  spans: Span[];
  startTime: number;
};
/**
 * Type used to summarize traces for the search page.
 */
export type TraceSummary = {
  /**
   * Duration of trace in milliseconds.
   */
  duration: number;
  /**
   * Start time of trace in milliseconds.
   */
  timestamp: number;
  traceName: string;
  traceID: string;
  numberOfErredSpans: number;
  numberOfSpans: number;
  services: { name: string; numberOfSpans: number }[];
};

export type TraceSummaries = {
  /**
   * Duration of longest trace in `traces` in milliseconds.
   */
  maxDuration: number;
  traces: (TraceSummary | null)[];
};
