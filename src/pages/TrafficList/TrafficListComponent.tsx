import * as React from 'react';
import * as TrafficListFilters from './FiltersAndSorts';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import * as FilterComponent from '../../components/FilterList/FilterComponent';
import { NA, ThresholdStatus } from 'types/Health';
import { ProtocolTraffic, hasProtocolTraffic, NodeType } from '../../types/Graph';
import { getTrafficHealth } from 'types/ErrorRate';
import VirtualList from 'components/VirtualList/VirtualList';
import { SortField } from 'types/SortFilters';
import { BaseItem } from 'components/VirtualList/Config';
import { TrafficItem } from './TrafficDetails';

export interface TrafficListItem extends BaseItem {
  isInaccessible: boolean;
  protocol: string;
  healthStatus: ThresholdStatus;
  trafficRate: string;
  trafficPercent: string; // percent success
}

type TrafficListComponentState = FilterComponent.State<TrafficListItem>;

type TrafficListComponentProps = FilterComponent.Props<TrafficListItem> & {
  direction: 'inbound' | 'outbound';
  trafficItems: TrafficItem[];
};

class TrafficListComponent extends FilterComponent.Component<
  TrafficListComponentProps,
  TrafficListComponentState,
  TrafficListItem
> {
  private promises = new PromisesRegistry();

  constructor(props: TrafficListComponentProps) {
    super(props);
    this.state = {
      listItems: [],
      currentSortField: this.props.currentSortField,
      isSortAscending: this.props.isSortAscending
    };
  }

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

  componentWillUnmount() {
    this.promises.cancelAll();
  }

  render() {
    return <VirtualList type="traffic" rows={this.state.listItems}></VirtualList>;
  }

  updateListItems() {
    this.promises.cancelAll();

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
        isInaccessible: ti.node.isInaccessible,
        name: ti.node.name,
        namespace: ti.node.namespace,
        protocol: this.getProtocol(ti.traffic),
        healthStatus: this.getHealthStatus(ti),
        ...this.getTraffic(ti.traffic)
      };
      return item;
    });

    this.sortItemList(listItems, this.state.currentSortField, this.state.isSortAscending)
      .then(sorted => {
        this.setState({
          listItems: sorted
        });
      })
      .catch(err => {
        if (!err.isCanceled) {
          console.debug(err);
        }
      });
  }

  sortItemList(
    listItems: TrafficListItem[],
    sortField: SortField<TrafficListItem>,
    isAscending: boolean
  ): Promise<TrafficListItem[]> {
    const sorted = TrafficListFilters.sortTrafficListItems(listItems, sortField, isAscending);
    return Promise.resolve(sorted);
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
}

export default TrafficListComponent;
