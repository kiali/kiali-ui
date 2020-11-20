import { SummaryWriter, SummaryWriterRenderer } from './BaseWriter';

interface RouteSummary {
  name: string;
  domains: string;
  match: string;
  virtual_service: string;
}

export class RouteWriter implements SummaryWriter {
  summaries: RouteSummary[];

  constructor(summaries: RouteSummary[]) {
    this.summaries = summaries;
  }

  head(): string[] {
    return ["Name", "Domains", "Match", "Virtual Service"];
  }

  rows(): string[][] {
    return this.summaries.map((summary: RouteSummary) => {
      return [
        summary.name,
        summary.domains,
        summary.match,
        summary.virtual_service,
      ];
    });
  }
}

export const RouteSummaryWriter = SummaryWriterRenderer<RouteWriter>();
