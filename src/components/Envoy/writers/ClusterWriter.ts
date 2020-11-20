import { SummaryWriter, SummaryWriterRenderer } from './BaseWriter';

interface ClusterSummary {
  service_fqdn: string;
  port: number;
  subset: string;
  direction: string;
  type: number;
}

export class ClusterWriter implements SummaryWriter {
  summaries: ClusterSummary[];

  constructor(summaries: ClusterSummary[]) {
    this.summaries = summaries;
  }

  head(): string[] {
    return ["Service FQDN", "Port", "Subset", "Direction", "Type"];
  }

  rows(): string[][] {
    return this.summaries.map((summary: ClusterSummary) => {
      return [
        summary.service_fqdn,
        summary.port.toString(),
        summary.subset,
        summary.direction,
        summary.type.toString(),
      ];
    });
  }
}

export const ClusterSummaryWriter = SummaryWriterRenderer<ClusterWriter>();
