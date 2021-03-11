import { SortField } from '../../types/SortFilters';
import NamespaceInfo from './NamespaceInfo';

export const sortFields: SortField<NamespaceInfo>[] = [
  {
    id: 'namespace',
    title: 'Name',
    isNumeric: false,
    param: 'ns',
    compare: (a: NamespaceInfo, b: NamespaceInfo) => a.name.localeCompare(b.name)
  },
  {
    id: 'health',
    title: 'Health',
    isNumeric: false,
    param: 'h',
    compare: (a: NamespaceInfo, b: NamespaceInfo) => {
      if (a.status && b.status) {
        let diff = b.status.inError.length - a.status.inError.length;
        if (diff !== 0) {
          return diff;
        }
        diff = b.status.inWarning.length - a.status.inWarning.length;
        if (diff !== 0) {
          return diff;
        }
      } else if (a.status) {
        return -1;
      } else if (b.status) {
        return 1;
      }
      // default comparison fallback
      return a.name.localeCompare(b.name);
    }
  },
  {
    id: 'mtls',
    title: 'mTLS',
    isNumeric: false,
    param: 'm',
    compare: (a: NamespaceInfo, b: NamespaceInfo) => {
      if (a.tlsStatus && b.tlsStatus) {
        return a.tlsStatus.status.localeCompare(b.tlsStatus.status);
      } else if (a.tlsStatus) {
        return -1;
      } else if (b.tlsStatus) {
        return 1;
      }

      // default comparison fallback
      return a.name.localeCompare(b.name);
    }
  },
  {
    id: 'config',
    title: 'Istio Config',
    isNumeric: false,
    param: 'ic',
    compare: (a: NamespaceInfo, b: NamespaceInfo) => {
      if (a.validations && b.validations) {
        if (a.validations.errors === b.validations.errors) {
          if (a.validations.warnings === b.validations.warnings) {
            if (a.validations.objectCount && b.validations.objectCount) {
              if (a.validations.objectCount === b.validations.objectCount) {
                // If all equal, use name for sorting
                return a.name.localeCompare(b.name);
              } else {
                return a.validations.objectCount > b.validations.objectCount ? -1 : 1;
              }
            } else if (a.validations.objectCount) {
              return -1;
            } else if (b.validations.objectCount) {
              return 1;
            }
          } else {
            return a.validations.warnings > b.validations.warnings ? -1 : 1;
          }
        } else {
          return a.validations.errors > b.validations.errors ? -1 : 1;
        }
      } else if (a.validations) {
        return -1;
      } else if (b.validations) {
        return 1;
      }

      // default comparison fallback
      return a.name.localeCompare(b.name);
    }
  }
];

export const sortFunc = (allNamespaces: NamespaceInfo[], sortField: SortField<NamespaceInfo>, isAscending: boolean) => {
  return allNamespaces.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
};
