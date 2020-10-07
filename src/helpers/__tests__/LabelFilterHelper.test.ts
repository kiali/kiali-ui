import { AppListItem } from '../../types/AppList';
import { WorkloadListItem } from '../../types/Workload';
import { ServiceListItem } from '../../types/ServiceList';
import { runSingleFilter } from 'utils/Filters';
import { labelFilter } from 'helpers/LabelFilterHelper';
import { ActiveFilter, ActiveFiltersInfo, LabelOperation } from 'types/Filters';

const appList: AppListItem[] = [
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'ratings',
    istioSidecar: false,
    labels: { app: 'ratings', service: 'ratings', version: 'v1' }
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'productpage',
    istioSidecar: false,
    labels: { app: 'productpage', service: 'productpage', version: 'v1' }
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'details',
    istioSidecar: false,
    labels: { app: 'details', service: 'details', version: 'v1' }
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'reviews',
    istioSidecar: false,
    labels: { app: 'reviews', service: 'reviews', version: 'v1,v2,v3' }
  }
];

const workloadList: WorkloadListItem[] = [
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'details-v1',
    type: 'Deployment',
    istioSidecar: false,
    labels: { app: 'details', version: 'v1' },
    appLabel: true,
    versionLabel: true
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'productpage-v1',
    type: 'Deployment',
    istioSidecar: false,
    labels: { app: 'productpage', version: 'v1' },
    appLabel: true,
    versionLabel: true
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'ratings-v1',
    type: 'Deployment',
    istioSidecar: false,
    labels: { app: 'ratings', version: 'v1' },
    appLabel: true,
    versionLabel: true
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'reviews-v1',
    type: 'Deployment',
    istioSidecar: false,
    labels: { app: 'reviews', version: 'v1' },
    appLabel: true,
    versionLabel: true
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'reviews-v2',
    type: 'Deployment',
    istioSidecar: false,
    labels: { app: 'reviews', version: 'v2' },
    appLabel: true,
    versionLabel: true
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'reviews-v3',
    type: 'Deployment',
    istioSidecar: false,
    labels: { app: 'reviews', version: 'v3' },
    appLabel: true,
    versionLabel: true
  }
];

const serviceList: ServiceListItem[] = [
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'details',
    istioSidecar: false,
    labels: { app: 'details', service: 'details' },
    validation: { name: 'details', objectType: 'service', valid: true, checks: [] }
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'reviews',
    istioSidecar: false,
    labels: { app: 'reviews', service: 'reviews' },
    validation: { name: 'reviews', objectType: 'service', valid: true, checks: [] }
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'ratings',
    istioSidecar: false,
    labels: { app: 'ratings', service: 'ratings' },
    validation: { name: 'ratings', objectType: 'service', valid: true, checks: [] }
  },
  {
    namespace: 'bookinfo',
    healthPromise: new Promise(() => {}),
    name: 'productpage',
    istioSidecar: false,
    labels: { app: 'productpage', service: 'productpage' },
    validation: { name: 'productpage', objectType: 'service', valid: true, checks: [] }
  }
];

const genActiveFilterInfo = (values: string[], op: LabelOperation): ActiveFiltersInfo => {
  return { filters: values.map(v => ({ id: labelFilter.id, value: v } as ActiveFilter)), op: op };
};

describe('LabelFilter', () => {
  it('check Label Filter with AppList and OR Operation', () => {
    const active = genActiveFilterInfo(['app', 'service:details'], 'or');
    const result = runSingleFilter(appList, labelFilter, active);
    expect(result).toEqual(appList);
  });

  it('check Label Filter with AppList and AND Operation', () => {
    const active = genActiveFilterInfo(['app', 'service:details'], 'and');
    const result = runSingleFilter(appList, labelFilter, active);
    expect(result).toEqual([
      {
        namespace: 'bookinfo',
        healthPromise: new Promise(() => {}),
        name: 'details',
        istioSidecar: false,
        labels: { app: 'details', service: 'details', version: 'v1' }
      }
    ]);
  });

  it('check Label Filter with AppList and AND Operation with multiple values', () => {
    const active = genActiveFilterInfo(['app', 'version:v2'], 'and');
    const result = runSingleFilter(appList, labelFilter, active);
    expect(result).toEqual([
      {
        namespace: 'bookinfo',
        healthPromise: new Promise(() => {}),
        name: 'reviews',
        istioSidecar: false,
        labels: { app: 'reviews', service: 'reviews', version: 'v1,v2,v3' }
      }
    ]);
  });

  it('check Label Filter with WorkloadList and OR Operation', () => {
    const active = genActiveFilterInfo(['app', 'version:v1'], 'or');
    const result = runSingleFilter(workloadList, labelFilter, active);
    expect(result).toEqual(workloadList);
  });

  it('check Label Filter with WorkloadList and AND Operation', () => {
    const active = genActiveFilterInfo(['app:reviews', 'version'], 'and');
    const result = runSingleFilter(workloadList, labelFilter, active);
    expect(result).toEqual([
      {
        namespace: 'bookinfo',
        healthPromise: new Promise(() => {}),
        name: 'reviews-v1',
        type: 'Deployment',
        istioSidecar: false,
        labels: { app: 'reviews', version: 'v1' },
        appLabel: true,
        versionLabel: true
      },
      {
        namespace: 'bookinfo',
        healthPromise: new Promise(() => {}),
        name: 'reviews-v2',
        type: 'Deployment',
        istioSidecar: false,
        labels: { app: 'reviews', version: 'v2' },
        appLabel: true,
        versionLabel: true
      },
      {
        namespace: 'bookinfo',
        healthPromise: new Promise(() => {}),
        name: 'reviews-v3',
        type: 'Deployment',
        istioSidecar: false,
        labels: { app: 'reviews', version: 'v3' },
        appLabel: true,
        versionLabel: true
      }
    ]);
  });

  it('check Label Filter with ServiceList and OR Operation', () => {
    const active = genActiveFilterInfo(['app', 'service:details'], 'or');
    const result = runSingleFilter(serviceList, labelFilter, active);
    expect(result).toEqual(serviceList);
  });

  it('check Label Filter with ServiceList and AND Operation', () => {
    const active = genActiveFilterInfo(['app', 'service:de'], 'and');
    const result = runSingleFilter(serviceList, labelFilter, active);
    expect(result).toEqual([
      {
        namespace: 'bookinfo',
        healthPromise: new Promise(() => {}),
        name: 'details',
        istioSidecar: false,
        labels: { app: 'details', service: 'details' },
        validation: { name: 'details', objectType: 'service', valid: true, checks: [] }
      }
    ]);
  });
});
