import * as React from 'react';
import {
  Badge,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import { style } from 'typestyle';
import {
  cellWidth,
  IRow,
  ISortBy,
  sortable,
  SortByDirection,
  Table,
  TableBody,
  TableHeader
} from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { TrafficItem, TrafficNode } from './TrafficDetails';
import * as FilterComponent from '../../components/FilterList/FilterComponent';
import { ThresholdStatus, NA } from 'types/Health';
import { NodeType, hasProtocolTraffic, ProtocolTraffic } from 'types/Graph';
import { getTrafficHealth } from 'types/ErrorRate';
import history, { URLParam } from 'app/History';
import { createIcon } from 'components/Health/Helper';

export interface TrafficListItem {
  healthStatus: ThresholdStatus;
  icon: string;
  node: TrafficNode;
  protocol: string;
  trafficRate: string;
  trafficPercent: string; // percent success
}

type TrafficListComponentProps = FilterComponent.Props<TrafficListItem> & {
  direction: 'inbound' | 'outbound';
  trafficItems: TrafficItem[];
};

type TrafficListComponentState = FilterComponent.State<TrafficListItem> & {
  sortBy: ISortBy;
};

const columns = [
  {
    title: 'Name',
    transforms: [sortable]
  },
  {
    title: 'Protocol',
    transforms: [sortable]
  },
  {
    title: 'Rate',
    transforms: [sortable]
  },
  {
    title: 'Percent',
    transforms: [sortable, cellWidth(5) as any]
  },
  {
    title: 'TrafficStatus',
    transforms: [sortable]
  },
  {
    title: 'Actions'
  }
];

// Style constants
const containerPadding = style({ padding: '20px 20px 20px 20px' });

class TrafficListComponent extends React.Component<TrafficListComponentProps, TrafficListComponentState> {
  constructor(props: TrafficListComponentProps) {
    super(props);
    this.state = {
      currentSortField: this.props.currentSortField,
      isSortAscending: this.props.isSortAscending,
      listItems: [],
      sortBy: {}
    };
  }

  // It invokes backend when component is mounted
  componentDidMount() {
    this.updateListItems();
  }

  componentDidUpdate(prevProps: TrafficListComponentProps, _prevState: TrafficListComponentState, _snapshot: any) {
    const paramChange =
      prevProps.trafficItems !== this.props.trafficItems ||
      prevProps.isSortAscending !== this.props.isSortAscending ||
      prevProps.currentSortField.title !== this.props.currentSortField.title;

    if (paramChange) {
      this.setState({
        currentSortField: this.props.currentSortField,
        isSortAscending: this.props.isSortAscending
      });

      this.updateListItems();
    }
  }

  render() {
    return (
      <div className={containerPadding}>
        <Table
          aria-label="Sortable Table"
          sortBy={this.state.sortBy}
          cells={columns}
          rows={this.rows()}
          onSort={this.onSort}
        >
          <TableHeader />
          {this.state.listItems.length > 0 ? (
            <TableBody />
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState variant={EmptyStateVariant.full}>
                  <Title headingLevel="h5" size="lg">
                    `No {this.props.direction} Traffic`
                  </Title>
                  <EmptyStateBody>`No {this.props.direction} Traffic`</EmptyStateBody>
                </EmptyState>
              </td>
            </tr>
          )}
        </Table>
      </div>
    );
  }

  // Helper used for Table to sort handlers based on index column == field
  onSort = (_event, index, sortDirection) => {
    const experimentList = this.state.listItems.sort((a, b) => {
      switch (index) {
        case 0:
          return a.node.name.localeCompare(b.node.name);
        case 1:
          return a.protocol.localeCompare(b.protocol);
        case 2:
          return a.trafficRate.localeCompare(b.trafficRate);
        case 3:
          return a.trafficPercent.localeCompare(b.trafficPercent);
        case 4:
          return a.healthStatus.status.priority - b.healthStatus.status.priority;
      }
      return 0;
    });
    this.setState({
      listItems: sortDirection === SortByDirection.asc ? experimentList : experimentList.reverse(),
      sortBy: {
        index,
        direction: sortDirection
      }
    });
  };

  updateListItems() {
    const listItems = this.props.trafficItems.map(ti => {
      let icon: string;
      switch (ti.node.type) {
        case NodeType.APP:
          icon = 'A';
          break;
        case NodeType.SERVICE:
          icon = 'S';
          break;
        default:
          icon = 'WL';
      }
      const item: TrafficListItem = {
        icon: icon,
        node: ti.node,
        protocol: this.getProtocol(ti.traffic),
        healthStatus: this.getHealthStatus(ti),
        ...this.getTraffic(ti.traffic)
      };
      return item;
    });

    this.setState({ listItems: listItems });
  }

  private getHealthStatus = (item: TrafficItem): ThresholdStatus => {
    const traffic = item.traffic;

    if (traffic.protocol !== 'tcp' && hasProtocolTraffic(traffic)) {
      return getTrafficHealth(item, this.props.direction);
    }

    return { value: 0, status: NA };
  };

  private getTraffic = (traffic: ProtocolTraffic): { trafficRate; trafficPercent } => {
    let rps = '0';
    let percentError = '0';
    let unit = 'rps';
    if (hasProtocolTraffic(traffic)) {
      switch (traffic.protocol) {
        case 'http':
          rps = traffic.rates.http;
          percentError = traffic.rates.httpPercentErr || '0';
          break;
        case 'grpc':
          rps = traffic.rates.grpc;
          percentError = traffic.rates.grpcPercentErr || '0';
          break;
        case 'tcp':
          rps = traffic.rates.tcp;
          break;
      }
    }

    return {
      trafficRate: `${Number(rps).toFixed(2)}${unit}`,
      trafficPercent: `${(100 - Number(percentError)).toFixed(1)}%`
    };
  };

  private getProtocol = (traffic: ProtocolTraffic) => {
    if (!traffic.protocol) {
      return 'N/A';
    }

    return traffic.protocol.toUpperCase();
  };

  // Helper used to build the table content.
  rows = (): IRow[] => {
    return this.state.listItems.map(item => {
      const name = item.node.name;
      const links = this.getLinks(item);
      return {
        cells: [
          <>
            <Tooltip key={`tl_tt_name_ ${name}`} position={TooltipPosition.top} content={<>{name}</>}>
              <Badge className={'virtualitem_badge_definition'}>{item.icon}</Badge>
            </Tooltip>
            {!!links.detail ? (
              <Link key={`link_d_${item.icon}_${name}`} to={links.detail} className={'virtualitem_definition_link'}>
                {name}
              </Link>
            ) : (
              name
            )}
          </>,
          <>{item.protocol}</>,
          <>{item.trafficRate}</>,
          <>{item.trafficPercent}</>,
          <>{createIcon(item.healthStatus.status, 'sm')}</>,
          <>
            {!!links.metrics && (
              <Link key={`link_m_${item.icon}_${name}`} to={links.metrics} className={'virtualitem_definition_link'}>
                View metrics
              </Link>
            )}
          </>
        ]
      };
    });
  };

  private getLinks = (item: TrafficListItem) => {
    if (item.node.isInaccessible) {
      return { detail: '', metrics: '' };
    }

    const detail = `/namespaces/${item.node.namespace}/${this.nodeTypeToType(item.node.type)}/${item.node.name}`;

    const metricsDirection = this.props.direction === 'inbound' ? 'in_metrics' : 'out_metrics';
    let metrics = `${history.location.pathname}?tab=${metricsDirection}`;

    switch (item.node.type) {
      case NodeType.APP:
        // All metrics tabs can filter by remote app. No need to switch context.
        const side = this.props.direction === 'inbound' ? 'source' : 'destination';
        metrics += `& ${URLParam.BY_LABELS}= ${encodeURIComponent(side + '_app=' + item.node.name)}`;
        break;
      case NodeType.SERVICE:
        if (item.node.isServiceEntry) {
          // Service Entries should be only destination nodes. So, don't build a link if direction is inbound.
          if (this.props.direction !== 'inbound' && item.node.destServices && item.node.destServices.length > 0) {
            const svcHosts = item.node.destServices.map(item => item.name).join(',');
            metrics += `&${URLParam.BY_LABELS}=${encodeURIComponent('destination_service_name=' + svcHosts)}`;
          } else {
            metrics = '';
          }
        } else {
          // Filter by remote service only available in the Outbound Metrics tab. For inbound traffic,
          // switch context to the service details page.
          if (this.props.direction === 'outbound') {
            metrics += `&${URLParam.BY_LABELS}=${encodeURIComponent('destination_service_name=' + item.node.name)}`;
          } else {
            // Services have only one metrics tab.
            metrics = `${detail}?tab=metrics`;
          }
        }
        break;
      case NodeType.WORKLOAD:
        // No filters available for workloads. Context switch is mandatory.

        // Since this will switch context (i.e. will redirect the user to the workload details page),
        // user is redirected to the "opposite" metrics. When looking at certain item, if traffic is *incoming*
        // from a certain workload, that traffic is reflected in the *outbound* metrics of the workload (and vice-versa).
        const inverseMetricsDirection = this.props.direction === 'inbound' ? 'out_metrics' : 'in_metrics';
        metrics = `${detail}?tab=${inverseMetricsDirection}`;
        break;
      default:
        metrics = '';
    }

    return { detail: detail, metrics: metrics };
  };

  private nodeTypeToType = (type: NodeType): string => {
    switch (type) {
      case NodeType.APP:
        return 'applications';
      case NodeType.SERVICE:
        return 'services';
      default:
        return 'workloads';
    }
  };
}

export default TrafficListComponent;
