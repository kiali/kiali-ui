import {
  ApplicationsIcon,
  BundleIcon,
  ErrorCircleOIcon,
  InfoAltIcon,
  OkIcon,
  ServiceIcon,
  UnknownIcon,
  WarningTriangleIcon
} from '@patternfly/react-icons';
import { TableGrid } from 'patternfly-react-extensions';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { NodeType, ProtocolTraffic, hasProtocolTraffic } from '../../types/Graph';
import { Direction } from '../../types/MetricsOptions';
import { REQUESTS_THRESHOLDS } from '../../types/Health';
import history, { URLParam } from '../../app/History';

type DetailedTrafficProps = {
  direction: Direction;
  traffic: TrafficItem[];
};

export interface AppNode {
  id: string;
  type: NodeType.APP;
  namespace: string;
  name: string;
  version: string;
  isInaccessible: boolean;
}

export interface WorkloadNode {
  id: string;
  type: NodeType.WORKLOAD;
  namespace: string;
  name: string;
  isInaccessible: boolean;
}

export interface ServiceNode {
  id: string;
  type: NodeType.SERVICE;
  namespace: string;
  name: string;
  isServiceEntry?: string;
  isInaccessible: boolean;
  destServices?: { namespace: string; name: string }[];
}

export interface UnknownNode {
  id: string;
  type: NodeType.UNKNOWN;
  namespace: string;
  name: 'unknown';
}

export type TrafficNode = WorkloadNode | ServiceNode | UnknownNode | AppNode;

export interface TrafficItem {
  node: TrafficNode;
  proxy?: TrafficItem;
  traffic: ProtocolTraffic;
}

const statusColumnSizes = {
  md: 1,
  sm: 1,
  xs: 1
};
const workloadColumnSizes = {
  md: 3,
  sm: 3,
  xs: 3
};
const metricsLinksColumnsSizes = workloadColumnSizes;
const typeColumnSizes = statusColumnSizes;
const trafficColumnSizes = workloadColumnSizes;

class DetailedTrafficList extends React.Component<DetailedTrafficProps> {
  static STATUS_COLUMN_IDX = 0;
  static WORKLOAD_COLUMN_IDX = 1;
  static PROTOCOL_COLUMN_IDX = 2;
  static TRAFFIC_COLUMN_IDX = 3;
  static METRICS_LINK_COLUMN_IDX = 4;

  render() {
    const sortedTraffic = this.getSortedTraffic();

    return (
      <TableGrid id="table-grid" bordered={true} selectType="none" style={{ clear: 'both' }}>
        <TableGrid.Head>
          <TableGrid.ColumnHeader {...statusColumnSizes}>Status</TableGrid.ColumnHeader>
          <TableGrid.ColumnHeader {...workloadColumnSizes}>
            {this.props.direction === 'inbound' ? 'Source' : 'Destination'}
          </TableGrid.ColumnHeader>
          <TableGrid.ColumnHeader {...typeColumnSizes}>Type</TableGrid.ColumnHeader>
          <TableGrid.ColumnHeader {...trafficColumnSizes}>Traffic</TableGrid.ColumnHeader>
        </TableGrid.Head>
        <TableGrid.Body>
          {sortedTraffic.length === 0 && (
            <TableGrid.Row>
              <TableGrid.Col md={10} sm={10} xs={10}>
                <InfoAltIcon /> Not enough {this.props.direction} traffic to generate info
              </TableGrid.Col>
            </TableGrid.Row>
          )}
          {sortedTraffic.map(item => {
            return (
              <TableGrid.Row key={item.node.id}>
                {this.renderStatusColumn(item.traffic)}
                {this.renderWorkloadColumn(item.node, item.proxy !== undefined)}
                {this.renderTypeColumn(item.traffic)}
                {this.renderTrafficColumn(item.traffic)}
                {this.renderMetricsLinksColumn(item.node)}
              </TableGrid.Row>
            );
          })}
        </TableGrid.Body>
      </TableGrid>
    );
  }

  private renderMetricsLinksColumn = (node: TrafficNode) => {
    const metricsDirection = this.props.direction === 'inbound' ? 'in_metrics' : 'out_metrics';
    let metricsLink = history.location.pathname + '?';
    metricsLink += `tab=${metricsDirection}`;

    if (node.type === NodeType.APP) {
      // All metrics tabs can filter by remote app. No need to switch context.
      const side = this.props.direction === 'inbound' ? 'source' : 'destination';
      metricsLink += '&' + URLParam.BY_LABELS + '=' + encodeURIComponent(side + '_app=' + node.name);
    } else if (node.type === NodeType.SERVICE) {
      if (node.isServiceEntry) {
        // Service Entries should be only destination nodes. So, don't build a link if direction is inbound.
        if (this.props.direction === 'inbound') {
          return null;
        }

        if (node.destServices && node.destServices.length > 0) {
          const svcHosts = node.destServices.map(item => item.name).join(',');
          metricsLink += '&' + URLParam.BY_LABELS + '=' + encodeURIComponent('destination_service_name=' + svcHosts);
        } else {
          return null;
        }
      } else {
        // Filter by remote service only available in the Outbound Metrics tab. For inbound traffic,
        // switch context to the service details page.
        if (this.props.direction === 'outbound') {
          metricsLink += '&' + URLParam.BY_LABELS + '=' + encodeURIComponent('destination_service_name=' + node.name);
        } else {
          // Services have only one metrics tab.
          metricsLink = `/namespaces/${node.namespace}/services/${node.name}?tab=metrics`;
        }
      }
    } else if (node.type === NodeType.WORKLOAD) {
      // No filters available for workloads. Context switch is mandatory.

      // Since this will switch context (i.e. will redirect the user to the workload details page),
      // user is redirected to the "opposite" metrics. When looking at certain item, if traffic is *incoming*
      // from a certain workload, that traffic is reflected in the *outbound* metrics of the workload (and vice-versa).
      const inverseMetricsDirection = this.props.direction === 'inbound' ? 'out_metrics' : 'in_metrics';
      metricsLink = `/namespaces/${node.namespace}/workloads/${node.name}?tab=${inverseMetricsDirection}`;
    } else {
      return null;
    }

    return (
      <TableGrid.Col {...metricsLinksColumnsSizes}>
        <Link to={metricsLink}>View metrics</Link>
      </TableGrid.Col>
    );
  };

  private renderStatusColumn = (traffic: ProtocolTraffic) => {
    if (hasProtocolTraffic(traffic) && traffic.protocol !== 'tcp') {
      let percentError: number;
      if (traffic.protocol === 'http') {
        percentError = traffic.rates.httpPercentErr ? Number(traffic.rates.httpPercentErr) : 0;
      } else {
        percentError = traffic.rates.grpcPercentErr ? Number(traffic.rates.grpcPercentErr) : 0;
      }
      let healthIcon = <OkIcon />;

      if (percentError > REQUESTS_THRESHOLDS.failure) {
        healthIcon = <ErrorCircleOIcon />;
      } else if (percentError > REQUESTS_THRESHOLDS.degraded) {
        healthIcon = <WarningTriangleIcon />;
      }

      return <TableGrid.Col {...statusColumnSizes}>{healthIcon}</TableGrid.Col>;
    } else {
      return (
        <TableGrid.Col {...statusColumnSizes}>
          <UnknownIcon />
        </TableGrid.Col>
      );
    }
  };

  private renderWorkloadColumn = (node: TrafficNode, isProxyed: boolean) => {
    const style = isProxyed ? { paddingLeft: '2em', paddingRight: '4px' } : { paddingRight: '4px' };
    let icon = <UnknownIcon style={style} />;
    let name = <>{node.name}</>;

    if (NodeType.WORKLOAD === node.type) {
      icon = <BundleIcon style={style} />;
      if (!node.isInaccessible) {
        name = (
          <Link to={`/namespaces/${encodeURIComponent(node.namespace)}/workloads/${encodeURIComponent(node.name)}`}>
            {node.name}
          </Link>
        );
      }
    } else if (NodeType.SERVICE === node.type) {
      icon = <ServiceIcon style={style} />;
      if (!node.isServiceEntry && !node.isInaccessible) {
        name = (
          <Link to={`/namespaces/${encodeURIComponent(node.namespace)}/services/${encodeURIComponent(node.name)}`}>
            {node.name}
          </Link>
        );
      }
    } else if (NodeType.APP === node.type) {
      icon = <ApplicationsIcon style={style} />;
      if (!node.isInaccessible) {
        name = (
          <Link to={`/namespaces/${encodeURIComponent(node.namespace)}/applications/${encodeURIComponent(node.name)}`}>
            {node.name}
          </Link>
        );
        if (node.version) {
          name = (
            <Link
              to={`/namespaces/${encodeURIComponent(node.namespace)}/applications/${encodeURIComponent(node.name)}`}
            >
              {`${node.name} / ${node.version}`}
            </Link>
          );
        }
      }
    }

    return (
      <TableGrid.Col {...workloadColumnSizes}>
        {icon} {name}
      </TableGrid.Col>
    );
  };

  private renderTrafficColumn = (traffic: ProtocolTraffic) => {
    if (hasProtocolTraffic(traffic)) {
      if (traffic.protocol === 'tcp') {
        return <TableGrid.Col {...trafficColumnSizes}>{Number(traffic.rates.tcp).toFixed(2)}</TableGrid.Col>;
      } else {
        let rps: number;
        let percentError: number;

        if (traffic.protocol === 'http') {
          rps = Number(traffic.rates.http);
          percentError = traffic.rates.httpPercentErr ? Number(traffic.rates.httpPercentErr) : 0;
        } else {
          rps = Number(traffic.rates.grpc);
          percentError = traffic.rates.grpcPercentErr ? Number(traffic.rates.grpcPercentErr) : 0;
        }

        return (
          <TableGrid.Col {...trafficColumnSizes}>
            {rps.toFixed(2)}rps | {(100 - percentError).toFixed(1)}% success
          </TableGrid.Col>
        );
      }
    } else {
      return <TableGrid.Col {...trafficColumnSizes}>N/A</TableGrid.Col>;
    }
  };

  private renderTypeColumn = (traffic: ProtocolTraffic) => {
    if (!traffic.protocol) {
      return <TableGrid.Col {...typeColumnSizes}>N/A</TableGrid.Col>;
    }

    return <TableGrid.Col {...typeColumnSizes}>{traffic.protocol.toUpperCase()}</TableGrid.Col>;
  };

  private getSortedTraffic = () => {
    const sortFn = (a: TrafficItem, b: TrafficItem) => {
      if (!a.proxy && !b.proxy) {
        return a.node.name.localeCompare(b.node.name);
      } else if (a.proxy && b.proxy) {
        const proxyCompare = a.proxy.node.name.localeCompare(b.proxy.node.name);
        if (proxyCompare === 0) {
          return a.node.name.localeCompare(b.node.name);
        }

        return proxyCompare;
      } else {
        const proxyedItem: TrafficItem = a.proxy ? a : b;
        const proxyItem: TrafficItem = a.proxy ? b : a;

        if (proxyItem === proxyedItem.proxy) {
          return proxyItem === a ? -1 : 1;
        }

        const cmp = proxyItem.node.name.localeCompare(proxyedItem.proxy!.node.name);
        return proxyItem === a ? cmp : -cmp;
      }
    };

    return this.props.traffic.slice().sort(sortFn);
  };
}

export default DetailedTrafficList;
