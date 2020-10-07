import { TextInputTypes } from '@patternfly/react-core';
import {
  FILTER_ACTION_APPEND,
  FILTER_ACTION_UPDATE,
  FilterTypes,
  presenceValues,
  istioSidecarFilter,
  healthFilter,
  Filter,
  presenceCheck
} from 'types/Filters';
import { WorkloadListItem, WorkloadType } from 'types/Workload';
import { SortField } from 'types/SortFilters';
import { WithWorkloadHealth } from 'types/Health';
import { hasMissingSidecar } from 'components/VirtualList/Config';
import { compareHealth } from 'utils/Compare';
import { labelFilter } from 'helpers/LabelFilterHelper';

const missingLabels = (r: WorkloadListItem): number => {
  return r.appLabel && r.versionLabel ? 0 : r.appLabel || r.versionLabel ? 1 : 2;
};

export const sortFields: SortField<WorkloadListItem>[] = [
  {
    id: 'namespace',
    title: 'Namespace',
    isNumeric: false,
    param: 'ns',
    compare: (a, b) => a.namespace.localeCompare(b.namespace) || a.name.localeCompare(b.name)
  },
  {
    id: 'workloadname',
    title: 'Workload Name',
    isNumeric: false,
    param: 'wn',
    compare: (a, b) => a.name.localeCompare(b.name)
  },
  {
    id: 'workloadtype',
    title: 'Workload Type',
    isNumeric: false,
    param: 'wt',
    compare: (a, b) => a.type.localeCompare(b.type)
  },
  {
    id: 'details',
    title: 'Details',
    isNumeric: false,
    param: 'is',
    compare: (a: WorkloadListItem, b: WorkloadListItem) => {
      // First sort by missing sidecar
      const aSC = hasMissingSidecar(a) ? 1 : 0;
      const bSC = hasMissingSidecar(b) ? 1 : 0;
      if (aSC !== bSC) {
        return aSC - bSC;
      }
      // Then by additional details
      const iconA = a.additionalDetailSample && a.additionalDetailSample.icon;
      const iconB = b.additionalDetailSample && b.additionalDetailSample.icon;
      if (iconA || iconB) {
        if (iconA && iconB) {
          const cmp = iconA.localeCompare(iconB);
          if (cmp !== 0) {
            return cmp;
          }
        } else {
          // Make asc => icon absence is last
          return iconA ? -1 : 1;
        }
      }
      // Second by  missing labels
      const missingA = missingLabels(a);
      const missingB = missingLabels(b);
      if (missingA !== missingB) {
        return missingA > missingB ? 1 : -1;
      }
      // Finally by name
      return a.name.localeCompare(b.name);
    }
  },
  {
    id: 'applabel',
    title: 'App Label',
    isNumeric: false,
    param: 'al',
    compare: (a: WorkloadListItem, b: WorkloadListItem) => {
      if (a.appLabel && !b.appLabel) {
        return -1;
      } else if (!a.appLabel && b.appLabel) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    }
  },
  {
    id: 'versionlabel',
    title: 'Version Label',
    isNumeric: false,
    param: 'vl',
    compare: (a: WorkloadListItem, b: WorkloadListItem) => {
      if (a.versionLabel && !b.versionLabel) {
        return -1;
      } else if (!a.versionLabel && b.versionLabel) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    }
  },
  {
    id: 'labelValidation',
    title: 'Label Validation',
    isNumeric: false,
    param: 'lb',
    compare: (a: WorkloadListItem, b: WorkloadListItem) => {
      if (a.versionLabel && a.appLabel && !(b.versionLabel && b.appLabel)) {
        return -1;
      } else if (!(a.versionLabel && a.appLabel) && b.versionLabel && b.appLabel) {
        return 1;
      } else {
        if (a.appLabel && !b.appLabel) {
          return 1;
        } else if (!a.appLabel && b.appLabel) {
          return -1;
        } else {
          if (a.versionLabel && !b.versionLabel) {
            return 1;
          } else if (!a.versionLabel && b.versionLabel) {
            return -1;
          } else {
            return a.name.localeCompare(b.name);
          }
        }
      }
    }
  },
  {
    id: 'health',
    title: 'Health',
    isNumeric: false,
    param: 'he',
    compare: (a, b) => compareHealth('workload', a, b)
  }
];

const workloadNameFilter: Filter<WorkloadListItem> = {
  id: 'workloadname',
  title: 'Workload Name',
  placeholder: 'Filter by Workload Name',
  filterType: TextInputTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: [],
  check: (item, active) => active.filters.some(f => item.name.includes(f.value))
};

export const appLabelFilter: Filter<WorkloadListItem> = {
  id: 'applabel',
  title: 'App Label',
  placeholder: 'Filter by App Label Validation',
  filterType: FilterTypes.select,
  action: FILTER_ACTION_UPDATE,
  filterValues: presenceValues,
  check: (item, active) => active.filters.some(f => presenceCheck(f, item.appLabel))
};

export const versionLabelFilter: Filter<WorkloadListItem> = {
  id: 'versionlabel',
  title: 'Version Label',
  placeholder: 'Filter by Version Label Validation',
  filterType: FilterTypes.select,
  action: FILTER_ACTION_UPDATE,
  filterValues: presenceValues,
  check: (item, active) => active.filters.some(f => presenceCheck(f, item.versionLabel))
};

const workloadTypeFilter: Filter<WorkloadListItem> = {
  id: 'workloadtype',
  title: 'Workload Type',
  placeholder: 'Filter by Workload Type',
  filterType: FilterTypes.typeAhead,
  action: FILTER_ACTION_APPEND,
  filterValues: [
    {
      id: WorkloadType.CronJob,
      title: WorkloadType.CronJob
    },
    {
      id: WorkloadType.DaemonSet,
      title: WorkloadType.DaemonSet
    },
    {
      id: WorkloadType.Deployment,
      title: WorkloadType.Deployment
    },
    {
      id: WorkloadType.DeploymentConfig,
      title: WorkloadType.DeploymentConfig
    },
    {
      id: WorkloadType.Job,
      title: WorkloadType.Job
    },
    {
      id: WorkloadType.Pod,
      title: WorkloadType.Pod
    },
    {
      id: WorkloadType.ReplicaSet,
      title: WorkloadType.ReplicaSet
    },
    {
      id: WorkloadType.ReplicationController,
      title: WorkloadType.ReplicationController
    },
    {
      id: WorkloadType.StatefulSet,
      title: WorkloadType.StatefulSet
    }
  ],
  check: (item, active) => active.filters.some(f => item.type.includes(f.value))
};

export const availableFilters = [
  workloadNameFilter,
  workloadTypeFilter,
  istioSidecarFilter,
  healthFilter,
  appLabelFilter,
  versionLabelFilter,
  labelFilter
];

/** Sort Method */

export const sortWorkloadsItems = (
  unsorted: WorkloadListItem[],
  sortField: SortField<WorkloadListItem>,
  isAscending: boolean
): Promise<WorkloadListItem[]> => {
  if (sortField.title === 'Health') {
    // In the case of health sorting, we may not have all health promises ready yet
    // So we need to get them all before actually sorting
    const allHealthPromises: Promise<WithWorkloadHealth<WorkloadListItem>>[] = unsorted.map(item => {
      return item.healthPromise.then((health): WithWorkloadHealth<WorkloadListItem> => ({ ...item, health }));
    });
    return Promise.all(allHealthPromises).then(arr => {
      return arr.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
    });
  }
  const sorted = unsorted.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
  return Promise.resolve(sorted);
};
