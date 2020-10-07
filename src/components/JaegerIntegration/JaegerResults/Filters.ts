import { FILTER_ACTION_APPEND, FILTER_ACTION_UPDATE, FilterTypes, FilterValue, Filter } from 'types/Filters';
import { SpanTableItem } from './SpanTableItem';

const byWorkload = (workloads: FilterValue[]): Filter<SpanTableItem> => {
  return {
    id: 'workload',
    title: 'Workload',
    placeholder: 'Filter by Workload',
    filterType: FilterTypes.typeAhead,
    action: FILTER_ACTION_APPEND,
    filterValues: workloads,
    check: (item, active) => active.filters.some(f => f.value === item.workload)
  };
};

const byApp = (apps: FilterValue[]): Filter<SpanTableItem> => {
  return {
    id: 'app',
    title: 'App',
    placeholder: 'Filter by App',
    filterType: FilterTypes.typeAhead,
    action: FILTER_ACTION_APPEND,
    filterValues: apps,
    check: (item, active) => active.filters.some(f => f.value === item.app)
  };
};

const byComponent = (components: FilterValue[]): Filter<SpanTableItem> => {
  return {
    id: 'type',
    title: 'Component',
    placeholder: 'Filter by Span Component',
    filterType: FilterTypes.typeAhead,
    action: FILTER_ACTION_APPEND,
    filterValues: components,
    check: (item, active) => active.filters.some(f => f.value === item.component)
  };
};

const byOperation = (ops: FilterValue[]): Filter<SpanTableItem> => {
  return {
    id: 'operation',
    title: 'Operation',
    placeholder: 'Filter by Operation Name',
    filterType: FilterTypes.typeAhead,
    action: FILTER_ACTION_APPEND,
    filterValues: ops,
    check: (item, active) => active.filters.some(f => f.value === item.operationName)
  };
};

const byError: Filter<SpanTableItem> = {
  id: 'error',
  title: 'Error',
  placeholder: 'Filter by Error',
  filterType: FilterTypes.select,
  action: FILTER_ACTION_UPDATE,
  filterValues: [
    { id: 'yes', title: 'Yes' },
    { id: 'no', title: 'No' }
  ],
  check: (item, active) => active.filters.some(f => f.value === (item.hasError ? 'Yes' : 'No'))
};

export const spanFilters = (spans: SpanTableItem[]): Filter<SpanTableItem>[] => {
  const workloads = new Set<string>();
  const apps = new Set<string>();
  const components = new Set<string>();
  const operations = new Set<string>();
  spans.forEach(s => {
    workloads.add(s.workload || 'unknown');
    apps.add(s.app);
    components.add(s.component);
    operations.add(s.operationName);
  });
  return [
    byWorkload(Array.from(workloads).map(w => ({ id: w, title: w }))),
    byApp(Array.from(apps).map(w => ({ id: w, title: w }))),
    byComponent(Array.from(components).map(w => ({ id: w, title: w }))),
    byOperation(Array.from(operations).map(w => ({ id: w, title: w }))),
    byError
  ];
};
