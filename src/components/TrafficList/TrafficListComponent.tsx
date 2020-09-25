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
  IRow,
  ISortBy,
  sortable,
  SortByDirection,
  Table,
  TableBody,
  TableHeader,
  cellWidth
} from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { TrafficItem, TrafficNode } from './TrafficDetails';
import * as FilterComponent from '../FilterList/FilterComponent';
import { ThresholdStatus, NA } from 'types/Health';
import { NodeType, hasProtocolTraffic, ProtocolTraffic } from 'types/Graph';
import { getTrafficHealth } from 'types/ErrorRate';
import history, { URLParam } from 'app/History';
import { createIcon } from 'components/Health/Helper';
import { sortFields } from './FiltersAndSorts';
import { SortField } from 'types/SortFilters';

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
    title: 'Status',
    transforms: [sortable, cellWidth(10)]
  },
  {
    title: 'Name',
    transforms: [sortable, cellWidth(30)]
  },
  {
    title: 'Rate',
    transforms: [sortable, cellWidth(12)]
  },
  {
    title: 'Percent',
    transforms: [sortable, cellWidth(12)]
  },
  {
    title: 'Protocol',
    transforms: [sortable, cellWidth(12)]
  },
  {
    title: 'Actions'
  }
];

// Style constants
const containerPadding = style({ padding: '20px' });

class TrafficListComponent extends FilterComponent.Component<
  TrafficListComponentProps,
  TrafficListComponentState,
  TrafficListItem
> {
  constructor(props: TrafficListComponentProps) {
    super(props);
    const sortIndex = sortFields.findIndex(sf => sf.id === props.currentSortField.id);
    const sortDirection = props.isSortAscending ? SortByDirection.asc : SortByDirection.desc;
    this.state = {
      currentSortField: props.currentSortField,
      isSortAscending: props.isSortAscending,
      listItems: this.trafficToListItems(props.trafficItems),
      sortBy: { index: sortIndex, direction: sortDirection }
    };
  }

  componentDidMount() {
    // ensure the initial sort field is relfected in the URL
    this.updateSortField(this.state.currentSortField);
  }

  componentDidUpdate(prevProps: TrafficListComponentProps, _prevState: TrafficListComponentState, _snapshot: any) {
    // we only care about new TrafficItems, sorting is managed locally after initial render
    if (prevProps.trafficItems !== this.props.trafficItems) {
      const listItems = this.trafficToListItems(this.props.trafficItems);
      this.sortItemList(listItems, this.state.currentSortField, this.state.isSortAscending).then(sorted => {
        this.setState({ listItems: sorted });
      });
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
                    No {this.props.direction} Traffic
                  </Title>
                  <EmptyStateBody>No {this.props.direction} Traffic</EmptyStateBody>
                </EmptyState>
              </td>
            </tr>
          )}
        </Table>
      </div>
    );
  }

  // abstract FilterComponent.updateListItems
  updateListItems() {
    // we don't react to filter changes in this class, so this is a no-op
  }

  // abstract FilterComponent.sortItemList
  sortItemList(
    listItems: TrafficListItem[],
    sortField: SortField<TrafficListItem>,
    isAscending: boolean
  ): Promise<TrafficListItem[]> {
    const sorted = listItems.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
    return Promise.resolve(sorted);
  }

  // Helper used for Table to sort handlers based on index column == field
  onSort = (_event, index, sortDirection) => {
    // Map the column index to the correct sortField index (currently ordered with the same indexes)
    let sortField = sortFields[index];

    const isSortAscending = sortDirection === SortByDirection.asc;
    if (sortField.id !== this.state.currentSortField.id) {
      this.updateSortField(sortField);
    } else if (isSortAscending !== this.state.isSortAscending) {
      this.updateSortDirection();
    }

    this.setState({ sortBy: { index: index, direction: sortDirection } });
  };

  trafficToListItems(trafficItems: TrafficItem[]) {
    const listItems = trafficItems.map(ti => {
      let icon: string;
      switch (ti.node.type) {
        case NodeType.APP:
          icon = 'A';
          break;
        case NodeType.SERVICE:
          icon = 'S';
          break;
        default:
          icon = 'W';
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

    return listItems;
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
    return this.state.listItems.map((item, i) => {
      const name = item.node.name;
      const links = this.getLinks(item);
      return {
        cells: [
          <>
            <Tooltip
              key={`tt_status_${i}`}
              position={TooltipPosition.top}
              content={<>Traffic Status: {item.healthStatus.status.name}</>}
            >
              {createIcon(item.healthStatus.status, 'sm')}
            </Tooltip>
          </>,
          <>
            <Tooltip
              key={`tt_badge_${i}`}
              position={TooltipPosition.top}
              content={<>{this.nodeTypeToType(item.node.type)}</>}
            >
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
          <>{item.trafficRate}</>,
          <>{item.trafficPercent}</>,
          <>{item.protocol}</>,
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

    const detail = `/namespaces/${item.node.namespace}/${this.nodeTypeToType(item.node.type, true)}/${item.node.name}`;

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

  private nodeTypeToType = (type: NodeType, isURL?: boolean): string => {
    switch (type) {
      case NodeType.APP:
        return isURL ? 'applications' : 'Application';
      case NodeType.SERVICE:
        return isURL ? 'services' : 'Service';
      default:
        return isURL ? 'workloads' : 'Workload';
    }
  };
}

export default TrafficListComponent;
