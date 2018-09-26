import { SortField } from '../../types/SortFilters';
import { IstioConfigItem } from '../../types/IstioConfigList';
import { FILTER_ACTION_APPEND, FILTER_ACTION_UPDATE, FilterType } from '../../types/Filters';
import NamespaceFilter from '../../components/Filters/NamespaceFilter';

export namespace IstioConfigListFilters {
  export const sortFields: SortField<IstioConfigItem>[] = [
    {
      id: 'namespace',
      title: 'Namespace',
      isNumeric: false,
      param: 'ns',
      compare: (a: IstioConfigItem, b: IstioConfigItem) => 1
    },
    {
      id: 'istiotype',
      title: 'Istio Type',
      isNumeric: false,
      param: 'it',
      compare: (a: IstioConfigItem, b: IstioConfigItem) => 1
    },
    {
      id: 'istioname',
      title: 'Istio Name',
      isNumeric: false,
      param: 'in',
      compare: (a: IstioConfigItem, b: IstioConfigItem) => 1
    },
    {
      id: 'configvalidation',
      title: 'Config',
      isNumeric: false,
      param: 'cv',
      compare: (a: IstioConfigItem, b: IstioConfigItem) => 1
    }
  ];

  const istioNameFilter: FilterType = {
    id: 'istioname',
    title: 'Istio Name',
    placeholder: 'Filter by Istio Name',
    filterType: 'text',
    action: FILTER_ACTION_UPDATE,
    filterValues: []
  };

  const istioTypeFilter: FilterType = {
    id: 'istiotype',
    title: 'Istio Type',
    placeholder: 'Filter by Istio Type',
    filterType: 'select',
    action: FILTER_ACTION_APPEND,
    filterValues: [
      {
        id: 'Gateway',
        title: 'Gateway'
      },
      {
        id: 'VirtualService',
        title: 'VirtualService'
      },
      {
        id: 'DestinationRule',
        title: 'DestinationRule'
      },
      {
        id: 'ServiceEntry',
        title: 'ServiceEntry'
      },
      {
        id: 'Rule',
        title: 'Rule'
      },
      {
        id: 'QuotaSpec',
        title: 'QuotaSpec'
      },
      {
        id: 'QuotaSpecBinding',
        title: 'QuotaSpecBinding'
      }
    ]
  };

  const configValidationFilter: FilterType = {
    id: 'configvalidation',
    title: 'Config',
    placeholder: 'Filter by Config Validation',
    filterType: 'select',
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

  export const availableFilters: FilterType[] = [
    NamespaceFilter.create(),
    istioTypeFilter,
    istioNameFilter,
    configValidationFilter
  ];
}
