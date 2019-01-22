import { Icon } from 'patternfly-react';
import { TableGrid } from 'patternfly-react-extensions';
import * as React from 'react';
import { NodeType } from '../../types/Graph';
import { REQUESTS_THRESHOLDS } from '../../types/Health';

type DetailedTrafficProps = {
  direction: 'inbound' | 'outbound';
  traffic: TrafficItem[];
};

export interface TrafficData {
  http?: {
    http: string;
    httpPercentErr?: string;
  };
  tcp?: {
    tcp: string;
  };
}

export interface AppNode {
  id: string;
  type: NodeType.APP;
  namespace: string;
  name: string;
  version: string;
}

export interface WorkloadNode {
  id: string;
  type: NodeType.WORKLOAD;
  namespace: string;
  name: string;
}

export interface ServiceNode {
  id: string;
  type: NodeType.SERVICE;
  namespace: string;
  name: string;
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
  traffic: TrafficData;
}

const healthColumnSizes = {
  md: 1,
  sm: 1,
  xs: 1
};
const minichartColumnSizes = {
  md: 3,
  sm: 3,
  xs: 3
};
const workloadColumnSizes = {
  md: 3,
  sm: 3,
  xs: 3
};
const trafficColumnSizes = workloadColumnSizes;
const typeColumnSizes = healthColumnSizes;

class DetailedTrafficList extends React.Component<DetailedTrafficProps> {
  render() {
    return (
      <TableGrid id="table-grid" bordered={true} selectType="none">
        <TableGrid.Head>
          <TableGrid.ColumnHeader {...healthColumnSizes}>Health</TableGrid.ColumnHeader>
          <TableGrid.ColumnHeader {...workloadColumnSizes}>
            {this.props.direction === 'inbound' ? 'Source' : 'Target'}
          </TableGrid.ColumnHeader>
          <TableGrid.ColumnHeader {...typeColumnSizes}>Type</TableGrid.ColumnHeader>
          <TableGrid.ColumnHeader {...trafficColumnSizes}>Traffic</TableGrid.ColumnHeader>
        </TableGrid.Head>
        <TableGrid.Body>
          {this.getSortedTraffic().map(item => {
            return (
              <TableGrid.Row key={item.node.id}>
                {this.renderHealthColumn(item.traffic)}
                {this.renderWorkloadColumn(item.node)}
                {this.renderTypeColumn(item.traffic)}
                {this.renderTrafficColumn(item.traffic)}
                {this.renderMinichartColumn(item.traffic)}
              </TableGrid.Row>
            );
          })}
        </TableGrid.Body>
      </TableGrid>
    );
  }

  private renderHealthColumn = (traffic: TrafficData) => {
    if (traffic.tcp) {
      return (
        <TableGrid.Col {...healthColumnSizes}>
          <Icon type="pf" name="unknown" />
        </TableGrid.Col>
      );
    } else if (traffic.http) {
      const percentError = traffic.http.httpPercentErr ? Number(traffic.http.httpPercentErr) : 0;
      let healthIcon = <Icon type="pf" name="ok" />;

      if (percentError > REQUESTS_THRESHOLDS.failure) {
        healthIcon = <Icon type="pf" name="error-circle-o" />;
      } else if (percentError > REQUESTS_THRESHOLDS.degraded) {
        healthIcon = <Icon type="pf" name="warning-triangle-o" />;
      }

      return <TableGrid.Col {...healthColumnSizes}>{healthIcon}</TableGrid.Col>;
    }

    return <TableGrid.Col {...healthColumnSizes} />;
  };

  private renderMinichartColumn = (traffic: TrafficData) => {
    if (!traffic.http) {
      return <TableGrid.Col {...minichartColumnSizes} />;
    }

    const httpPercentError = traffic.http.httpPercentErr ? Number(traffic.http.httpPercentErr) : 0;
    return (
      <TableGrid.Col {...minichartColumnSizes}>
        <svg width="100%" height="1.5em">
          <rect x="0" y="20%" width="100%" height="60%" fill="green" />
          <rect x={`${100 - httpPercentError}%`} y="20%" width={`${httpPercentError}%`} height="60%" fill="red" />
          <rect
            x={`${100 - REQUESTS_THRESHOLDS.failure}%`}
            y="0"
            width="0.4em"
            height="100%"
            fill="silver"
            stroke="white"
            strokeWidth="0.2em"
            strokeDasharray="0,0.4em,1.5em,0.4em,1.5em"
          />
        </svg>
      </TableGrid.Col>
    );
  };

  private renderWorkloadColumn = (node: TrafficNode) => {
    let icon = <Icon type="pf" name="unknown" style={{ paddingLeft: '2em' }} />;
    let name = node.name;

    if (NodeType.WORKLOAD === node.type) {
      icon = <Icon type="pf" name="bundle" style={{ paddingLeft: '2em' }} />;
    } else if (NodeType.SERVICE === node.type) {
      icon = <Icon type="pf" name="service" />;
    } else if (NodeType.APP === node.type) {
      icon = <Icon type="pf" name="applications" style={{ paddingLeft: '2em' }} />;
      if (node.version) {
        name = `${node.name} / ${node.version}`;
      }
    }

    return (
      <TableGrid.Col {...workloadColumnSizes}>
        {icon} {name}
      </TableGrid.Col>
    );
  };

  private renderTrafficColumn = (traffic: TrafficData) => {
    if (traffic.tcp) {
      return <TableGrid.Col {...trafficColumnSizes}>{Number(traffic.tcp.tcp).toFixed(2)}</TableGrid.Col>;
    } else if (traffic.http) {
      const httpRps = Number(traffic.http.http);
      const httpPercentError = traffic.http.httpPercentErr ? Number(traffic.http.httpPercentErr) : 0;
      return (
        <TableGrid.Col {...trafficColumnSizes}>
          {httpRps.toFixed(2)}rps | {(100 - httpPercentError).toFixed(1)}% success
        </TableGrid.Col>
      );
    }

    return <TableGrid.Col {...trafficColumnSizes} />;
  };

  private renderTypeColumn = (traffic: TrafficData) => {
    return <TableGrid.Col {...typeColumnSizes}>{traffic.tcp ? 'TCP' : 'HTTP'}</TableGrid.Col>;
  };

  private getSortedTraffic = () => {
    const sortFn = (a: TrafficItem, b: TrafficItem) => {
      if (!a.proxy && !b.proxy) {
        // Comparing two first level items
        return a.node.name.localeCompare(b.node.name);
      } else if (a.proxy && b.proxy) {
        // Comparing two second level items
        const proxyCompare = a.proxy.node.name.localeCompare(b.proxy.node.name);
        if (proxyCompare === 0) {
          return a.node.name.localeCompare(b.node.name);
        }

        return proxyCompare;
      } else {
        // Comparing first level item vs second level
        const proxyedItem: TrafficItem = a.proxy ? a : b;
        const proxyItem: TrafficItem = a.proxy ? b : a;

        if (proxyItem === proxyedItem.proxy) {
          return proxyItem === a ? -1 : 1;
        }

        const cmp = proxyItem.node.name.localeCompare(proxyedItem.proxy!.node.namespace);
        return proxyItem === a ? cmp : -cmp;
      }
    };

    return this.props.traffic.slice().sort(sortFn);
  };
}

export default DetailedTrafficList;
