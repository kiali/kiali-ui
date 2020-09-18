import * as React from 'react';
import * as TrafficListFilters from './FiltersAndSorts';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import * as FilterComponent from '../../components/FilterList/FilterComponent';
import { TrafficItem } from 'components/Details/DetailedTrafficList';
import { NA } from 'types/Health';
import { NodeType, ProtocolTraffic, hasProtocolTraffic } from '../../types/Graph';
import { getTrafficHealth } from 'types/ErrorRate';
import { createIcon } from 'components/Health/Helper';
import VirtualList from 'components/VirtualList/VirtualList';
import { SortField } from 'types/SortFilters';

type TrafficListComponentState = FilterComponent.State<TrafficListItem>;

type TrafficListComponentProps = FilterComponent.Props<TrafficListItem> & {
  direction: 'inbound' | 'outbound';
  trafficItems: TrafficItem[];
};

export interface TrafficListItem {
  name: string;
  nodeType: NodeType;
  protocol: string;
  health: any;
  trafficRate: string;
  trafficPercent: string;
}

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
    return <VirtualList rows={this.state.listItems}></VirtualList>;
  }

  updateListItems = () => {
    this.promises.cancelAll();

    const listItems = this.props.trafficItems.map(ti => {
      const item: TrafficListItem = {
        name: ti.node.name,
        nodeType: ti.node.type,
        protocol: this.renderProtocolColumn(ti.traffic),
        health: this.renderHealthColumn(ti),
        ...this.renderTrafficColumns(ti.traffic)
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
  };

  sortItemList(
    listItems: TrafficListItem[],
    sortField: SortField<TrafficListItem>,
    isAscending: boolean
  ): Promise<TrafficListItem[]> {
    const sorted = TrafficListFilters.sortTrafficListItems(listItems, sortField, isAscending);
    return Promise.resolve(sorted);
  }

  private renderHealthColumn = (item: TrafficItem) => {
    const traffic = item.traffic;
    if (traffic.protocol !== 'tcp' && hasProtocolTraffic(traffic)) {
      const status = getTrafficHealth(item, this.props.direction);
      return createIcon(status.status, 'sm');
    }
    return createIcon(NA, 'sm');
  };

  private renderTrafficColumns = (traffic: ProtocolTraffic): { trafficRate; trafficPercent } => {
    if (hasProtocolTraffic(traffic)) {
      if (traffic.protocol === 'tcp') {
        return { trafficRate: Number(traffic.rates.tcp).toFixed(2), trafficPercent: '100%' };
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
        return { trafficRate: `${rps.toFixed(2)}rps`, trafficPercent: `${(100 - percentError).toFixed(1)}% success` };
      }
    } else {
      return { trafficRate: 'N/A', trafficPercent: 'N/A' };
    }
  };

  private renderProtocolColumn = (traffic: ProtocolTraffic) => {
    if (!traffic.protocol) {
      return 'N/A';
    }

    return traffic.protocol.toUpperCase();
  };
}

export default TrafficListComponent;
