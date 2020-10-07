import { TextInputTypes } from '@patternfly/react-core';
import history from 'app/History';
import { DEFAULT_LABEL_OPERATION, FILTER_ACTION_APPEND, Filter, FilterDefinition } from 'types/Filters';
import { filtersMatchURL, getFiltersFromURL, GlobalFilters, runFilters, setFiltersToURL } from 'utils/Filters';

const managedFilterTypes = [
  {
    id: 'a',
    title: 'A'
  },
  {
    id: 'c',
    title: 'C'
  },
  {
    id: 'd',
    title: 'D'
  }
] as FilterDefinition[];

describe('URL and filters', () => {
  it('sets selected filters from URL', () => {
    history.push('?a=1&b=2&c=3&c=4');
    const filters = getFiltersFromURL(managedFilterTypes);
    expect(filters).toEqual({
      filters: [
        {
          id: 'a',
          title: 'A',
          value: '1'
        },
        {
          id: 'c',
          title: 'C',
          value: '3'
        },
        {
          id: 'c',
          title: 'C',
          value: '4'
        }
      ],
      op: 'or'
    });
  });

  it('sets selected filters to URL', () => {
    history.push('?a=10&b=20&c=30&c=40');
    const cleanFilters = setFiltersToURL(managedFilterTypes, {
      filters: [
        {
          id: 'a',
          title: 'A',
          value: '1'
        },
        {
          id: 'c',
          title: 'C',
          value: '3'
        },
        {
          id: 'c',
          title: 'C',
          value: '4'
        }
      ],
      op: DEFAULT_LABEL_OPERATION
    });
    expect(history.location.search).toEqual('?b=20&a=1&c=3&c=4&opLabel=or');
    expect(cleanFilters.filters).toHaveLength(3);
  });

  it('sets selected filters to URL with OpLabel to and', () => {
    history.push('?a=10&b=20&c=30&c=40');
    const cleanFilters = setFiltersToURL(managedFilterTypes, {
      filters: [
        {
          id: 'a',
          title: 'A',
          value: '1'
        },
        {
          id: 'c',
          title: 'C',
          value: '3'
        },
        {
          id: 'c',
          title: 'C',
          value: '4'
        }
      ],
      op: 'and'
    });
    expect(history.location.search).toEqual('?b=20&a=1&c=3&c=4&opLabel=and');
    expect(cleanFilters.filters).toHaveLength(3);
    expect(cleanFilters.op).toEqual('and');
  });

  it('filters should match URL, ignoring order and non-managed query params', () => {
    history.push('?a=1&b=2&c=3&c=4');
    // Make sure order is ignored
    const match = filtersMatchURL(managedFilterTypes, {
      filters: [
        {
          id: 'c',
          title: 'C',
          value: '3'
        },
        {
          id: 'a',
          title: 'A',
          value: '1'
        },
        {
          id: 'c',
          title: 'C',
          value: '4'
        }
      ],
      op: DEFAULT_LABEL_OPERATION
    });
    expect(match).toBe(true);
  });

  it('filters should not match URL', () => {
    history.push('?a=1&b=2&c=3&c=4');
    // Incorrect value
    let match = filtersMatchURL(managedFilterTypes, {
      filters: [
        {
          id: 'a',
          title: 'A',
          value: '1'
        },
        {
          id: 'c',
          title: 'C',
          value: '3'
        },
        {
          id: 'c',
          title: 'C',
          value: '5'
        }
      ],
      op: DEFAULT_LABEL_OPERATION
    });
    expect(match).toBe(false);

    // Missing value from selection
    match = filtersMatchURL(managedFilterTypes, {
      filters: [
        {
          id: 'a',
          title: 'A',
          value: '1'
        },
        {
          id: 'c',
          title: 'C',
          value: '3'
        }
      ],
      op: DEFAULT_LABEL_OPERATION
    });
    expect(match).toBe(false);

    // Missing value from URL
    match = filtersMatchURL(managedFilterTypes, {
      filters: [
        {
          id: 'a',
          title: 'A',
          value: '1'
        },
        {
          id: 'c',
          title: 'C',
          value: '3'
        },
        {
          id: 'c',
          title: 'C',
          value: '4'
        },
        {
          id: 'c',
          title: 'C',
          value: '5'
        }
      ],
      op: DEFAULT_LABEL_OPERATION
    });
    expect(match).toBe(false);

    // Missing key from selection
    match = filtersMatchURL(managedFilterTypes, {
      filters: [
        {
          id: 'a',
          title: 'A',
          value: '1'
        }
      ],
      op: DEFAULT_LABEL_OPERATION
    });
    expect(match).toBe(false);

    // Missing key from URL
    match = filtersMatchURL(managedFilterTypes, {
      filters: [
        {
          id: 'a',
          title: 'A',
          value: '1'
        },
        {
          id: 'c',
          title: 'C',
          value: '3'
        },
        {
          id: 'c',
          title: 'C',
          value: '4'
        },
        {
          id: 'd',
          title: 'D',
          value: '5'
        }
      ],
      op: DEFAULT_LABEL_OPERATION
    });
    expect(match).toBe(false);
  });
});

const items = [
  { ns: 'ns1', name: 'name1' },
  { ns: 'ns1', name: 'name2' },
  { ns: 'ns2', name: 'name3' }
];
const filters: Filter<{ ns: string; name: string }>[] = [
  {
    id: 'ns',
    title: 'ns',
    placeholder: 'ns',
    filterType: TextInputTypes.text,
    action: FILTER_ACTION_APPEND,
    filterValues: [],
    check: (item, active) => active.filters.some(f => f.value === item.ns)
  },
  {
    id: 'name',
    title: 'name',
    placeholder: 'name',
    filterType: TextInputTypes.text,
    action: FILTER_ACTION_APPEND,
    filterValues: [],
    check: (item, active) => active.filters.some(f => f.value === item.name)
  }
];

describe('Runnable filters', () => {
  it('should return all when no filter active', () => {
    const filtered = runFilters(items, filters);
    expect(filtered).toEqual(items);
  });

  it('should return filtered items with one active filter', () => {
    GlobalFilters.setActive({ filters: [{ id: 'ns', title: 'ns', value: 'ns1' }], op: 'or' });
    const filtered = runFilters(items, filters);
    expect(filtered.map(i => i.ns)).toEqual(['ns1', 'ns1']);
  });

  it('should return filtered items with two active filters', () => {
    GlobalFilters.setActive({
      filters: [
        { id: 'ns', title: 'ns', value: 'ns1' },
        { id: 'name', title: 'name', value: 'name1' }
      ],
      op: 'or'
    });
    const filtered = runFilters(items, filters);
    expect(filtered).toEqual([{ ns: 'ns1', name: 'name1' }]);
  });

  it('should return no item', () => {
    GlobalFilters.setActive({ filters: [{ id: 'name', title: 'name', value: 'no-name' }], op: 'or' });
    const filtered = runFilters(items, filters);
    expect(filtered).toHaveLength(0);
  });
});
