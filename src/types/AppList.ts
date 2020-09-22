import Namespace from './Namespace';
import { AppHealth } from './Health';
import { BaseItem } from 'components/VirtualList/Config';

export interface AppList {
  namespace: Namespace;
  applications: AppOverview[];
}

export interface AppOverview extends BaseItem {
  istioSidecar: boolean;
  labels: { [key: string]: string };
}

export interface AppListItem extends AppOverview {
  healthPromise: Promise<AppHealth>;
}
