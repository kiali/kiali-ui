import { FilterType } from '../../types/Filters';
import { SortField } from '../../types/SortFilters';
import { TrafficListItem } from './TrafficListComponent';

// Don't alter the index order without also updating TrafficListComponent.onSort
export const sortFields: SortField<TrafficListItem>[] = [
  {
    // index 0 is default sort
    id: 'trafficstatus',
    title: 'Traffic Status',
    isNumeric: false,
    param: 'ts',
    compare: (a: TrafficListItem, b: TrafficListItem) => a.healthStatus.status.priority - b.healthStatus.status.priority
  },
  {
    id: 'name',
    title: 'Name',
    isNumeric: false,
    param: 'na',
    compare: (a: TrafficListItem, b: TrafficListItem) => a.node.name.localeCompare(b.node.name)
  },
  {
    id: 'rate',
    title: 'Rate',
    isNumeric: false,
    param: 'ra',
    compare: (a: TrafficListItem, b: TrafficListItem) => a.trafficRate.localeCompare(b.trafficRate)
  },
  {
    id: 'percent',
    title: 'Percent Success',
    isNumeric: false,
    param: 'pe',
    compare: (a: TrafficListItem, b: TrafficListItem) => a.trafficPercent.localeCompare(b.trafficPercent)
  },
  {
    id: 'protocol',
    title: 'Protocol',
    isNumeric: false,
    param: 'pr',
    compare: (a: TrafficListItem, b: TrafficListItem) => a.protocol.localeCompare(b.protocol)
  }
];

export const availableFilters: FilterType[] = [];
