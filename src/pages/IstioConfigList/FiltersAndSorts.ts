import { SortField } from '../../types/SortFilters';
import { IstioConfigItem } from '../../types/IstioConfigList';
import { FILTER_ACTION_APPEND, FilterType, FilterTypes } from '../../types/Filters';

export const sortFields: SortField<IstioConfigItem>[] = [
  {
    id: 'namespace',
    title: 'Namespace',
    isNumeric: false,
    param: 'ns',
    compare: (a: IstioConfigItem, b: IstioConfigItem) => {
      return a.namespace.localeCompare(b.namespace) || a.name.localeCompare(b.name);
    }
  },
  {
    id: 'istiotype',
    title: 'Istio Type',
    isNumeric: false,
    param: 'it',
    compare: (a: IstioConfigItem, b: IstioConfigItem) => {
      return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
    }
  },
  {
    id: 'istioname',
    title: 'Istio Name',
    isNumeric: false,
    param: 'in',
    compare: (a: IstioConfigItem, b: IstioConfigItem) => {
      // On same name order is not well defined, we need some fallback methods
      // This happens specially on adapters/templates where Istio 1.0.x calls them "handler"
      // So, we have a lot of objects with same namespace+name
      return a.name.localeCompare(b.name) || a.namespace.localeCompare(b.namespace) || a.type.localeCompare(b.type);
    }
  },
  {
    id: 'configvalidation',
    title: 'Config',
    isNumeric: false,
    param: 'cv',
    compare: (a: IstioConfigItem, b: IstioConfigItem) => {
      let sortValue = -1;
      if (a.validation && !b.validation) {
        sortValue = -1;
      } else if (!a.validation && b.validation) {
        sortValue = 1;
      } else if (!a.validation && !b.validation) {
        sortValue = 0;
      } else if (a.validation && b.validation) {
        if (a.validation.valid && !b.validation.valid) {
          sortValue = -1;
        } else if (!a.validation.valid && b.validation.valid) {
          sortValue = 1;
        } else if (a.validation.valid && b.validation.valid) {
          sortValue = a.validation.checks.length - b.validation.checks.length;
        } else if (!a.validation.valid && !b.validation.valid) {
          sortValue = b.validation.checks.length - a.validation.checks.length;
        }
      }

      return sortValue || a.name.localeCompare(b.name);
    }
  }
];

export const istioNameFilter: FilterType = {
  id: 'istioname',
  title: 'Istio Name',
  placeholder: 'Filter by Istio Name',
  filterType: FilterTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: []
};

export const istioTypeFilter: FilterType = {
  id: 'istiotype',
  title: 'Istio Type',
  placeholder: 'Filter by Istio Type',
  filterType: FilterTypes.typeAhead,
  action: FILTER_ACTION_APPEND,
  filterValues: [
    {
      id: 'Adapter',
      title: 'Adapter'
    },
    {
      id: 'AttributeManifest',
      title: 'AttributeManifest'
    },
    {
      id: 'AuthorizationPolicy',
      title: 'AuthorizationPolicy'
    },
    {
      id: 'ClusterRbacConfig',
      title: 'ClusterRbacConfig'
    },
    {
      id: 'DestinationRule',
      title: 'DestinationRule'
    },
    {
      id: 'EnvoyFilter',
      title: 'EnvoyFilter'
    },
    {
      id: 'Gateway',
      title: 'Gateway'
    },
    {
      id: 'Handler',
      title: 'Handler'
    },
    {
      id: 'HTTPAPISpec',
      title: 'HTTPAPISpec'
    },
    {
      id: 'HTTPAPISpecBinding',
      title: 'HTTPAPISpecBinding'
    },
    {
      id: 'Instance',
      title: 'Instance'
    },
    {
      id: 'MeshPolicy',
      title: 'MeshPolicy'
    },
    {
      id: 'PeerAuthentication',
      title: 'PeerAuthentication'
    },
    {
      id: 'Policy',
      title: 'Policy'
    },
    {
      id: 'QuotaSpec',
      title: 'QuotaSpec'
    },
    {
      id: 'QuotaSpecBinding',
      title: 'QuotaSpecBinding'
    },
    {
      id: 'RbacConfig',
      title: 'RbacConfig'
    },
    {
      id: 'RequestAuthentication',
      title: 'RequestAuthentication'
    },
    {
      id: 'Rule',
      title: 'Rule'
    },
    {
      id: 'ServiceEntry',
      title: 'ServiceEntry'
    },
    {
      id: 'ServiceRole',
      title: 'ServiceRole'
    },
    {
      id: 'ServiceRoleBinding',
      title: 'ServiceRoleBinding'
    },
    {
      id: 'Sidecar',
      title: 'Sidecar'
    },
    {
      id: 'Template',
      title: 'Template'
    },
    {
      id: 'VirtualService',
      title: 'VirtualService'
    },
    {
      id: 'WorkloadEntry',
      title: 'WorkloadEntry'
    }
  ]
};

export const configValidationFilter: FilterType = {
  id: 'configvalidation',
  title: 'Config',
  placeholder: 'Filter by Config Validation',
  filterType: FilterTypes.select,
  action: FILTER_ACTION_APPEND,
  filterValues: [
    {
      id: 'valid',
      title: 'Valid'
    },
    {
      id: 'warning',
      title: 'Warning'
    },
    {
      id: 'notvalid',
      title: 'Not Valid'
    },
    {
      id: 'notvalidated',
      title: 'Not Validated'
    }
  ]
};

export const availableFilters: FilterType[] = [istioTypeFilter, istioNameFilter, configValidationFilter];

export const sortIstioItems = (
  unsorted: IstioConfigItem[],
  sortField: SortField<IstioConfigItem>,
  isAscending: boolean
) => {
  const sortPromise: Promise<IstioConfigItem[]> = new Promise(resolve => {
    resolve(unsorted.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a)));
  });

  return sortPromise;
};
