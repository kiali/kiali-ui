import * as React from 'react';
import { AxiosError } from 'axios';
import {
  Button,
  Icon,
  ListView,
  ListViewIcon,
  ListViewItem,
  Paginator,
  Sort,
  ToolbarRightContent
} from 'patternfly-react';
import { Link } from 'react-router-dom';
import { FilterSelected, StatefulFilters } from '../../components/Filters/StatefulFilters';
import { NamespaceFilter } from '../../components/Filters/NamespaceFilter';
import { PfColors } from '../../components/Pf/PfColors';
import * as API from '../../services/Api';
import Namespace from '../../types/Namespace';
import { ActiveFilter, FilterType } from '../../types/Filters';
import { Pagination } from '../../types/Pagination';
import { ServiceList, ServiceListItem } from '../../types/ServiceList';
import { IstioLogo } from '../../config';
import { authentication } from '../../utils/Authentication';
import { removeDuplicatesArray } from '../../utils/Common';
import RateIntervalToolbarItem from './RateIntervalToolbarItem';
import ItemDescription from './ItemDescription';
import { ListPage } from '../../components/ListPage/ListPage';
import { ServiceListFilters } from './FiltersAndSorts';
import { SortField } from '../../types/SortFilters';

import './ServiceListComponent.css';

const availableFilters: FilterType[] = [
  NamespaceFilter.create(),
  ServiceListFilters.serviceNameFilter,
  ServiceListFilters.istioFilter
];

type ServiceListComponentState = {
  services: ServiceListItem[];
  pagination: Pagination;
  currentSortField: SortField;
  isSortAscending: boolean;
  rateInterval: number;
};

type ServiceListComponentProps = {
  pageHooks: ListPage.Hooks;
  pagination: Pagination;
  currentSortField: SortField;
  isSortAscending: boolean;
  rateInterval: number;
};

class ServiceListComponent extends React.Component<ServiceListComponentProps, ServiceListComponentState> {
  constructor(props: ServiceListComponentProps) {
    super(props);
    this.state = {
      services: [],
      pagination: this.props.pagination,
      currentSortField: this.props.currentSortField,
      isSortAscending: this.props.isSortAscending,
      rateInterval: this.props.rateInterval
    };
  }

  componentDidMount() {
    this.updateServices();
  }

  componentDidUpdate(prevProps: ServiceListComponentProps, prevState: ServiceListComponentState, snapshot: any) {
    if (!this.paramsAreSynced(prevProps)) {
      this.setState({
        pagination: this.props.pagination,
        currentSortField: this.props.currentSortField,
        isSortAscending: this.props.isSortAscending,
        rateInterval: this.props.rateInterval
      });

      this.updateServices();
    }
  }

  paramsAreSynced(prevProps: ServiceListComponentProps) {
    return (
      prevProps.pagination.page === this.props.pagination.page &&
      prevProps.pagination.perPage === this.props.pagination.perPage &&
      prevProps.rateInterval === this.props.rateInterval &&
      prevProps.isSortAscending === this.props.isSortAscending &&
      prevProps.currentSortField.title === this.props.currentSortField.title
    );
  }

  onFilterChange = () => {
    // Resetting pagination when filters change
    this.props.pageHooks.onParamChange([{ name: 'page', value: '' }]);
    this.updateServices(true);
  };

  handleError = (error: string) => {
    this.props.pageHooks.handleError(error);
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
          perPageOptions: ListPage.perPageOptions
        }
      };
    });

    this.props.pageHooks.onParamChange([{ name: 'page', value: String(page) }]);
  };

  perPageSelect = (perPage: number) => {
    this.setState(prevState => {
      return {
        services: prevState.services,
        pagination: {
          page: 1,
          perPage: perPage,
          perPageOptions: ListPage.perPageOptions
        }
      };
    });

    this.props.pageHooks.onParamChange([{ name: 'page', value: '1' }, { name: 'perPage', value: String(perPage) }]);
  };

  updateSortField = (sortField: SortField) => {
    ServiceListFilters.sortServices(this.state.services, sortField, this.state.isSortAscending).then(sorted => {
      this.setState({
        currentSortField: sortField,
        services: sorted
      });

      this.props.pageHooks.onParamChange([{ name: 'sort', value: sortField.param }]);
    });
  };

  updateSortDirection = () => {
    ServiceListFilters.sortServices(this.state.services, this.state.currentSortField, !this.state.isSortAscending).then(
      sorted => {
        this.setState({
          isSortAscending: !this.state.isSortAscending,
          services: sorted
        });

        this.props.pageHooks.onParamChange([{ name: 'direction', value: this.state.isSortAscending ? 'asc' : 'desc' }]);
      }
    );
  };

  updateServices = (resetPagination?: boolean) => {
    const activeFilters: ActiveFilter[] = FilterSelected.getSelected();
    let namespacesSelected: string[] = activeFilters
      .filter(activeFilter => activeFilter.category === 'Namespace')
      .map(activeFilter => activeFilter.value);

    /** Remove Duplicates */
    namespacesSelected = removeDuplicatesArray(namespacesSelected);

    if (namespacesSelected.length === 0) {
      API.getNamespaces(authentication())
        .then(namespacesResponse => {
          const namespaces: Namespace[] = namespacesResponse['data'];
          this.fetchServices(
            namespaces.map(namespace => namespace.name),
            activeFilters,
            this.state.rateInterval,
            resetPagination
          );
        })
        .catch(namespacesError => this.handleAxiosError('Could not fetch namespace list.', namespacesError));
    } else {
      this.fetchServices(namespacesSelected, activeFilters, this.state.rateInterval, resetPagination);
    }
  };

  getServiceItem(data: ServiceList, rateInterval: number): ServiceListItem[] {
    let serviceItems: ServiceListItem[] = [];
    if (data.services) {
      data.services.forEach(service => {
        const healthProm = API.getServiceHealth(authentication(), data.namespace.name, service.name, rateInterval);
        serviceItems.push({
          name: service.name,
          istioSidecar: service.istioSidecar,
          namespace: data.namespace.name,
          healthPromise: healthProm
        });
      });
    }
    return serviceItems;
  }

  fetchServices(namespaces: string[], filters: ActiveFilter[], rateInterval: number, resetPagination?: boolean) {
    const servicesPromises = namespaces.map(ns => API.getServices(authentication(), ns));

    Promise.all(servicesPromises).then(responses => {
      const currentPage = resetPagination ? 1 : this.state.pagination.page;

      let serviceListItems: ServiceListItem[] = [];
      responses.forEach(response => {
        serviceListItems = serviceListItems.concat(
          ServiceListFilters.filterBy(this.getServiceItem(response.data, rateInterval), filters)
        );
      });

      ServiceListFilters.sortServices(serviceListItems, this.state.currentSortField, this.state.isSortAscending).then(
        sorted => {
          this.setState(prevState => {
            return {
              services: sorted,
              pagination: {
                page: currentPage,
                perPage: prevState.pagination.perPage,
                perPageOptions: ListPage.perPageOptions
              }
            };
          });
        }
      );
    });
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
            description={<ItemDescription item={serviceItem} />}
          />
        </Link>
      );
    }
    return (
      <div>
        <StatefulFilters
          initialFilters={availableFilters}
          pageHooks={this.props.pageHooks}
          onFilterChange={this.onFilterChange}
        >
          <Sort>
            <Sort.TypeSelector
              sortTypes={ServiceListFilters.sortFields}
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
            rateIntervalSelected={this.state.rateInterval}
            onRateIntervalChanged={this.rateIntervalChangedHandler}
          />
          <ToolbarRightContent>
            <Button onClick={this.updateServices}>
              <Icon name="refresh" />
            </Button>
          </ToolbarRightContent>
        </StatefulFilters>
        <ListView>{serviceList}</ListView>
        <Paginator
          viewType="list"
          pagination={this.state.pagination}
          itemCount={this.state.services.length}
          onPageSet={this.pageSet}
          onPerPageSelect={this.perPageSelect}
        />
      </div>
    );
  }

  private rateIntervalChangedHandler = (key: number) => {
    this.setState({ rateInterval: key });
    this.props.pageHooks.onParamChange([{ name: 'rate', value: String(key) }]);
    this.updateServices();
  };
}

export default ServiceListComponent;
