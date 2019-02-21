import WorkloadListPage from './pages/WorkloadList/WorkloadListPage';
import ServiceListPage from './pages/ServiceList/ServiceListPage';
import IstioConfigPage from './pages/IstioConfigList/IstioConfigListPage';
import ServiceJaegerPage from './pages/ServiceJaeger/ServiceJaegerPage';
import IstioConfigDetailsPage from './pages/IstioConfigDetails/IstioConfigDetailsPage';
import WorkloadDetailsPage from './pages/WorkloadDetails/WorkloadDetailsPage';
import AppListPage from './pages/AppList/AppListPage';
import AppDetailsPage from './pages/AppDetails/AppDetailsPage';
import OverviewPage from './pages/Overview/OverviewPage';
import { MenuItem, Path } from './types/Routes';
import GraphPageContainer from './containers/GraphPageContainer';
import { icons, paths } from './config';
import ServiceDetailsPageContainer from './containers/ServiceDetailsPageContainer';
import DefaultSecondaryMasthead from './components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';

/**
 * Return array of objects that describe vertical menu
 * @return {array}
 */
const navItems: MenuItem[] = [
  {
    iconClass: icons.menu.overview,
    title: 'Overview',
    to: '/overview',
    pathsActive: [/^\/overview\/(.*)/]
  },
  {
    iconClass: icons.menu.graph,
    title: 'Graph',
    to: '/graph/namespaces/',
    pathsActive: [/^\/graph\/(.*)/]
  },
  {
    iconClass: icons.menu.applications,
    title: 'Applications',
    to: '/' + paths.applications,
    pathsActive: [new RegExp('^/namespaces/(.*)/' + paths.applications + '/(.*)')]
  },
  {
    iconClass: icons.menu.workloads,
    title: 'Workloads',
    to: '/' + paths.workloads,
    pathsActive: [new RegExp('^/namespaces/(.*)/' + paths.workloads + '/(.*)')]
  },
  {
    iconClass: icons.menu.services,
    title: 'Services',
    to: '/' + paths.services,
    pathsActive: [new RegExp('^/namespaces/(.*)/' + paths.services + '/(.*)')]
  },
  {
    iconClass: icons.menu.istioConfig,
    title: 'Istio Config',
    to: '/' + paths.istio,
    pathsActive: [new RegExp('^/namespaces/(.*)/' + paths.istio + '/(.*)')]
  },
  {
    iconClass: icons.menu.distributedTracing,
    title: 'Distributed Tracing',
    to: '/jaeger'
  }
];

const defaultRoute = '/overview';

const pathRoutes: Path[] = [
  {
    path: '/overview',
    component: OverviewPage
  },
  {
    path: '/graph/node/namespaces/:namespace/' + paths.applications + '/:app/versions/:version',
    component: GraphPageContainer
  },
  {
    path: '/graph/node/namespaces/:namespace/' + paths.applications + '/:app',
    component: GraphPageContainer
  },
  {
    path: '/graph/node/namespaces/:namespace/' + paths.services + '/:service',
    component: GraphPageContainer
  },
  {
    path: '/graph/node/namespaces/:namespace/' + paths.workloads + '/:workload',
    component: GraphPageContainer
  },
  {
    path: '/graph/namespaces',
    component: GraphPageContainer
  },
  {
    path: '/namespaces/:namespace/' + paths.services + '/:service',
    component: ServiceDetailsPageContainer
  },
  // NOTE that order on routes is important
  {
    path: '/namespaces/:namespace/' + paths.istio + '/:objectType/:objectSubtype/:object',
    component: IstioConfigDetailsPage
  },
  {
    path: '/namespaces/:namespace/' + paths.istio + '/:objectType/:object',
    component: IstioConfigDetailsPage
  },
  {
    path: '/' + paths.services,
    component: ServiceListPage
  },
  {
    path: '/' + paths.applications,
    component: AppListPage
  },
  {
    path: '/namespaces/:namespace/' + paths.applications + '/:app',
    component: AppDetailsPage
  },
  {
    path: '/' + paths.workloads,
    component: WorkloadListPage
  },
  {
    path: '/namespaces/:namespace/' + paths.workloads + '/:workload',
    component: WorkloadDetailsPage
  },
  {
    path: '/' + paths.istio,
    component: IstioConfigPage
  },
  {
    path: '/jaeger',
    component: ServiceJaegerPage
  }
];

const secondaryMastheadRoutes: Path[] = [
  {
    path: '/graph/namespaces',
    component: DefaultSecondaryMasthead
  },
  {
    path: '/' + paths.applications,
    component: DefaultSecondaryMasthead
  },
  {
    path: '/' + paths.services,
    component: DefaultSecondaryMasthead
  },
  {
    path: '/' + paths.workloads,
    component: DefaultSecondaryMasthead
  },
  {
    path: '/' + paths.istio,
    component: DefaultSecondaryMasthead
  }
];

export { defaultRoute, navItems, pathRoutes, secondaryMastheadRoutes };
