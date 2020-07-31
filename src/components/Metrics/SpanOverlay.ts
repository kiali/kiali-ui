import { PfColors, PFAlertColor } from 'components/Pf/PfColors';
import { toOverlay, OverlayInfo, Overlay, LineInfo } from '@kiali/k-charted-pf4';

import * as API from '../../services/Api';
import { TimeRange, durationToBounds, guardTimeRange } from '../../types/Common';
import * as AlertUtils from '../../utils/AlertUtils';
import { Span, TracingQuery } from 'types/Tracing';

export type JaegerLineInfo = LineInfo & { traceId?: string };

export class SpanOverlay {
  private spans: Span[] = [];
  private lastFetchError = false;

  constructor(
    private namespace: string,
    private service: string,
    public onChange: (overlay?: Overlay<JaegerLineInfo>) => void
  ) {}

  fetch(range: TimeRange) {
    const boundsMillis = guardTimeRange(range, durationToBounds, b => b);
    const opts: TracingQuery = {
      startMicros: boundsMillis.from * 1000,
      endMicros: boundsMillis.to ? boundsMillis.to * 1000 : undefined
    };
    // Remove any out-of-bound spans
    this.spans = this.spans.filter(
      s => s.startTime >= opts.startMicros && (opts.endMicros === undefined || s.startTime <= opts.endMicros)
    );
    // Start fetching from last fetched data when available
    if (this.spans.length > 0) {
      opts.startMicros = 1 + Math.max(...this.spans.map(s => s.startTime));
    }
    API.getAppSpans(this.namespace, this.service, opts)
      .then(res => {
        this.lastFetchError = false;
        // Incremental refresh: we keep existing spans
        this.spans = this.spans.concat(res.data);
        this.onChange(this.buildOverlay());
      })
      .catch(err => {
        if (!this.lastFetchError) {
          AlertUtils.addError('Could not fetch spans.', err);
          this.lastFetchError = true;
        }
      });
  }

  private buildOverlay(): Overlay<JaegerLineInfo> | undefined {
    if (this.spans.length > 0) {
      const info: OverlayInfo<JaegerLineInfo> = {
        lineInfo: {
          name: 'Span duration',
          unit: 'seconds',
          color: PfColors.Cyan300,
          symbol: 'circle',
          size: 10
        },
        dataStyle: { fill: ({ datum }) => (datum.error ? PFAlertColor.Danger : PfColors.Cyan300), fillOpacity: 0.6 },
        buckets: this.spans.length > 1000 ? 15 : 0
      };
      const dps = this.spans.map(span => {
        const hasError = span.tags.some(tag => tag.key === 'error' && tag.value);
        return {
          name: span.operationName,
          x: new Date(span.startTime / 1000),
          y: Number(span.duration / 1000000),
          error: hasError,
          color: hasError ? PFAlertColor.Danger : PfColors.Cyan300,
          size: 4,
          traceId: span.traceID
        };
      });
      return toOverlay(info, dps);
    }
    return undefined;
  }
}
