import * as React from 'react';
import { AxiosError } from 'axios';
import {
  Button,
  Icon,
  ListView,
  ListViewItem,
  ListViewIcon,
  Paginator,
  Sort,
  ToolbarRightContent
} from 'patternfly-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { NamespaceFilter, NamespaceFilterSelected } from '../../components/NamespaceFilter/NamespaceFilter';
import { PfColors } from '../../components/Pf/PfColors';
import * as API from '../../services/Api';
import { Health } from '../../types/Health';
import Namespace from '../../types/Namespace';
import { ActiveFilter, FilterType } from '../../types/NamespaceFilter';
import { Pagination } from '../../types/Pagination';
import { IstioLogo, ServiceItem, ServiceOverview, SortField, overviewToItem } from '../../types/ServiceListComponent';
import { authentication } from '../../utils/Authentication';
import { getRequestErrorsRatio } from '../../utils/Health';
import { removeDuplicatesArray } from '../../utils/Common';
import RateIntervalToolbarItem from './RateIntervalToolbarItem';
import ItemDescription from './ItemDescription';
import './ServiceListComponent.css';

type ServiceItemHealth = ServiceItem & { health: Health };

// Exported for test
export const sortFields: SortField[] = [
  {
    title: 'Namespace',
    isNumeric: false,
    compare: (a: ServiceItem, b: ServiceItem) => {
      let sortValue = a.namespace.localeCompare(b.namespace);
      if (sortValue === 0) {
        sortValue = a.name.localeCompare(b.name);
      }
      return sortValue;
    }
  },
  {
    title: 'Service Name',
    isNumeric: false,
    compare: (a: ServiceItem, b: ServiceItem) => a.name.localeCompare(b.name)
  },
  {
    title: 'Istio Sidecar',
    isNumeric: false,
    compare: (a: ServiceItem, b: ServiceItem) => {
      if (a.istioSidecar && !b.istioSidecar) {
        return -1;
      } else if (!a.istioSidecar && b.istioSidecar) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    }
  },
  {
    title: 'Error Rate',
    isNumeric: true,
    compare: (a: ServiceItemHealth, b: ServiceItemHealth) => {
      const ratioA = getRequestErrorsRatio(a.health.requests).value;
      const ratioB = getRequestErrorsRatio(b.health.requests).value;
      return ratioA === ratioB ? a.name.localeCompare(b.name) : ratioA - ratioB;
    }
  }
];

// Exported for test
export const sortServices = (
  services: ServiceItem[],
  sortField: SortField,
  isAscending: boolean
): Promise<ServiceItem[]> => {
  if (sortField.title === 'Error Rate') {
    // In the case of error rate sorting, we may not have all health promises ready yet
    // So we need to get them all before actually sorting
    const allHealthPromises: Promise<ServiceItemHealth>[] = services.map(item => {
      return item.healthPromise.then(health => {
        const withHealth: any = item;
        withHealth.health = health;
        return withHealth;
      });
    });
    return Promise.all(allHealthPromises).then(arr => {
      return arr.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
    });
  }
  // Default case: sorting is done synchronously
  const sorted = services.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
  return Promise.resolve(sorted);
};

const serviceNameFilter: FilterType = {
  id: 'servicename',
  title: 'Service Name',
  placeholder: 'Filter by Service Name',
  filterType: 'text',
  filterValues: []
};

const istioFilter: FilterType = {
  id: 'istio',
  title: 'Istio Sidecar',
  placeholder: 'Filter by Istio Sidecar',
  filterType: 'select',
  filterValues: [{ id: 'deployed', title: 'Deployed' }, { id: 'undeployed', title: 'Undeployed' }]
};

type ServiceListComponentState = {
  services: ServiceItem[];
  pagination: Pagination;
  currentSortField: SortField;
  isSortAscending: boolean;
};

type ServiceListComponentProps = {
  onError: PropTypes.func;
};

const perPageOptions: number[] = [5, 10, 15];
const defaultRateInterval = 600;

class ServiceListComponent extends React.Component<ServiceListComponentProps, ServiceListComponentState> {
  private rateInterval: number;

  constructor(props: ServiceListComponentProps) {
    super(props);
    this.rateInterval = defaultRateInterval;

    this.state = {
      services: [],
      pagination: { page: 1, perPage: 10, perPageOptions: perPageOptions },
      currentSortField: sortFields[0],
      isSortAscending: true
    };
  }

  componentDidMount() {
    this.updateServices();
  }

  handleError = (error: string) => {
    this.props.onError(error);
  };

  handleAxiosError(message: string, error: AxiosError) {
    const errMsg = API.getErrorMsg(message, error);
    console.error(errMsg);
    this.handleError(errMsg);
  }

  pageSet = (page: number) => {
    this.setState(prevState => {
      return {
        services: prevState.services,
        pagination: {
          page: page,
          perPage: prevState.pagination.perPage,
          perPageOptions: perPageOptions
        }
      };
    });
  };

  pageSelect = (perPage: number) => {
    this.setState(prevState => {
      return {
        services: prevState.services,
        pagination: {
          page: 1,
          perPage: perPage,
          perPageOptions: perPageOptions
        }
      };
    });
  };

  updateSortField = (sortField: SortField) => {
    sortServices(this.state.services, sortField, this.state.isSortAscending).then(sorted => {
      this.setState({
        currentSortField: sortField,
        services: sorted
      });
    });
  };

  updateSortDirection = () => {
    sortServices(this.state.services, this.state.currentSortField, !this.state.isSortAscending).then(sorted => {
      this.setState({
        isSortAscending: !this.state.isSortAscending,
        services: sorted
      });
    });
  };

  updateServices = () => {
    const activeFilters: ActiveFilter[] = NamespaceFilterSelected.getSelected();
    let namespacesSelected: string[] = activeFilters
      .filter(activeFilter => activeFilter.category === 'Namespace')
      .map(activeFilter => activeFilter.value);
    let servicenameFilters: string[] = activeFilters
      .filter(activeFilter => activeFilter.category === 'Service Name')
      .map(activeFilter => activeFilter.value);
    let istioFilters: string[] = activeFilters
      .filter(activeFilter => activeFilter.category === 'Istio Sidecar')
      .map(activeFilter => activeFilter.value);

    /** Remove Duplicates */
    namespacesSelected = removeDuplicatesArray(namespacesSelected);
    servicenameFilters = removeDuplicatesArray(servicenameFilters);
    istioFilters = this.cleanIstioFilters(removeDuplicatesArray(istioFilters));

    if (namespacesSelected.length === 0) {
      API.getNamespaces(authentication())
        .then(namespacesResponse => {
          const namespaces: Namespace[] = namespacesResponse['data'];
          this.fetchServices(namespaces.map(namespace => namespace.name), servicenameFilters, istioFilters);
        })
        .catch(namespacesError => this.handleAxiosError('Could not fetch namespace list.', namespacesError));
    } else {
      this.fetchServices(namespacesSelected, servicenameFilters, istioFilters);
    }
  };

  fetchServices(namespaces: string[], servicenameFilters: string[], istioFilters: string[]) {
    const promises = namespaces.map(ns => API.getServices(authentication(), ns));
    Promise.all(promises)
      .then(servicesResponse => {
        let updatedServices: ServiceItem[] = [];
        servicesResponse.forEach(serviceResponse => {
          const namespace = serviceResponse.data.namespace.name;
          let serviceList = serviceResponse.data.services;
          if (servicenameFilters.length > 0 || istioFilters.length > 0) {
            serviceList = serviceList.filter(service => this.isFiltered(service, servicenameFilters, istioFilters));
          }
          serviceList.forEach(overview => {
            const healthProm = API.getServiceHealth(authentication(), namespace, overview.name, this.rateInterval).then(
              r => r.data
            );
            updatedServices.push(overviewToItem(overview, namespace, healthProm));
          });
        });
        sortServices(updatedServices, this.state.currentSortField, this.state.isSortAscending).then(sorted => {
          this.setState({
            services: sorted,
            pagination: {
              page: 1,
              perPage: this.state.pagination.perPage,
              perPageOptions: perPageOptions
            }
          });
        });
      })
      .catch(servicesError => this.handleAxiosError('Could not fetch service list.', servicesError));
  }

  // Patternfly-react Filter has not a boolean / checkbox filter option, so as we want to use the same component
  // this function is used to optimize potential duplications on 'Deployed', 'Undeployed' values selected.
  cleanIstioFilters(istioFilters: string[]) {
    if (istioFilters.length === 0) {
      return [];
    }
    let cleanArray = istioFilters.filter((iFilter, i) => {
      return istioFilters.indexOf(iFilter) === i;
    });

    if (cleanArray.length === 2) {
      return [];
    }
    return cleanArray;
  }

  isFiltered(service: ServiceOverview, servicenameFilters: string[], istioFilters: string[]) {
    let serviceNameFiltered = true;
    if (servicenameFilters.length > 0) {
      serviceNameFiltered = false;
      for (let i = 0; i < servicenameFilters.length; i++) {
        if (service.name.includes(servicenameFilters[i])) {
          serviceNameFiltered = true;
          break;
        }
      }
    }

    let istioFiltered = true;
    if (istioFilters.length === 1) {
      if (istioFilters[0] === 'Deployed') {
        istioFiltered = service.istioSidecar;
      }
      if (istioFilters[0] === 'Undeployed') {
        istioFiltered = !service.istioSidecar;
      }
    }

    return serviceNameFiltered && istioFiltered;
  }

  render() {
    let serviceList: any = [];
    let pageStart = (this.state.pagination.page - 1) * this.state.pagination.perPage;
    let pageEnd = pageStart + this.state.pagination.perPage;
    pageEnd = pageEnd < this.state.services.length ? pageEnd : this.state.services.length;

    for (let i = pageStart; i < pageEnd; i++) {
      const serviceItem = this.state.services[i];
      const to = '/namespaces/' + serviceItem.namespace + '/services/' + serviceItem.name;

      serviceList.push(
        <Link key={to} to={to} style={{ color: PfColors.Black }}>
          <ListViewItem
            leftContent={<ListViewIcon type="pf" name="service" />}
            heading={
              <div className="ServiceList-Heading">
                <div className="ServiceList-IstioLogo">
                  {serviceItem.istioSidecar && <img className="IstioLogo" src={IstioLogo} alt="Istio sidecar" />}
                </div>
                <div className="ServiceList-Title">
                  {serviceItem.name}
                  <small>{serviceItem.namespace}</small>
                </div>
              </div>
            }
            // Prettier makes irrelevant line-breaking clashing with tslint
            // prettier-ignore
            description={<ItemDescription item={serviceItem} rateInterval={this.rateInterval} />}
          />
        </Link>
      );
    }
    return (
      <div>
        <NamespaceFilter
          initialFilters={[serviceNameFilter, istioFilter]}
          onFilterChange={this.updateServices}
          onError={this.handleError}
        >
          <Sort>
            <Sort.TypeSelector
              sortTypes={sortFields}
              currentSortType={this.state.currentSortField}
              onSortTypeSelected={this.updateSortField}
            />
            <Sort.DirectionSelector
              isNumeric={this.state.currentSortField.isNumeric}
              isAscending={this.state.isSortAscending}
              onClick={this.updateSortDirection}
            />
          </Sort>
          <RateIntervalToolbarItem
            rateIntervalSelected={this.rateInterval}
            onRateIntervalChanged={this.rateIntervalChangedHandler}
          />
          <ToolbarRightContent>
            <Button onClick={this.updateServices}>
              <Icon name="refresh" />
            </Button>
          </ToolbarRightContent>
        </NamespaceFilter>
        <ListView>{serviceList}</ListView>
        <Paginator
          viewType="list"
          pagination={this.state.pagination}
          itemCount={this.state.services.length}
          onPageSet={this.pageSet}
          onPerPageSelect={this.pageSelect}
        />
      </div>
    );
  }

  private rateIntervalChangedHandler = (key: number) => {
    this.rateInterval = key;
    this.updateServices();
  };
}

export default ServiceListComponent;
