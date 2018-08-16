import * as React from 'react';
import * as API from '../../services/Api';
import { authentication } from '../../utils/Authentication';
import Namespace from '../../types/Namespace';
import { AxiosError } from 'axios';
import { WorkloadListItem } from '../../types/Workload';
import { WorkloadListFilters } from './FiltersAndSorts';
import { WorkloadList } from './WorkloadListClass';
import {
  defaultNamespaceFilter,
  NamespaceFilter,
  NamespaceFilterSelected
} from '../../components/NamespaceFilter/NamespaceFilter';
import { ListView, Sort, Paginator, ToolbarRightContent, Button, Icon } from 'patternfly-react';
import { Pagination } from '../../types/Pagination';
import PropTypes from 'prop-types';
import { ActiveFilter, FilterType } from '../../types/NamespaceFilter';
import { removeDuplicatesArray } from '../../utils/Common';
import { URLParameter } from '../../types/Parameters';

export const availableFilters: FilterType[] = [
  defaultNamespaceFilter,
  WorkloadListFilters.workloadNameFilter,
  WorkloadListFilters.workloadTypeFilter,
  WorkloadListFilters.istioSidecarFilter,
  WorkloadListFilters.appLabelFilter,
  WorkloadListFilters.versionLabelFilter
];

type WorkloadListComponentState = {
  workloadItems: WorkloadListItem[];
  pagination: Pagination;
  currentSortField: WorkloadListFilters.SortField;
  isSortAscending: boolean;
};

type WorkloadListComponentProps = {
  onError: PropTypes.func;
  pagination: Pagination;
  queryParam: PropTypes.func;
  onParamChange: PropTypes.func;
  currentSortField: WorkloadListFilters.SortField;
  isSortAscending: boolean;
};

const perPageOptions: number[] = [5, 10, 15];

class WorkloadListComponent extends React.Component<WorkloadListComponentProps, WorkloadListComponentState> {
  constructor(props: WorkloadListComponentProps) {
    super(props);
    this.state = {
      workloadItems: [],
      pagination: this.props.pagination,
      currentSortField: this.props.currentSortField,
      isSortAscending: this.props.isSortAscending
    };
    this.setActiveFiltersToURL();
  }

  componentDidMount() {
    this.updateWorkloads();
  }

  updateWorkloads = () => {
    const activeFilters: ActiveFilter[] = NamespaceFilterSelected.getSelected();
    let namespacesSelected: string[] = activeFilters
      .filter(activeFilter => activeFilter.category === 'Namespace')
      .map(activeFilter => activeFilter.value);

    /** Remove duplicates  */
    namespacesSelected = removeDuplicatesArray(namespacesSelected);

    if (namespacesSelected.length === 0) {
      API.getNamespaces(authentication())
        .then(namespacesResponse => {
          const namespaces: Namespace[] = namespacesResponse['data'];
          this.fetchWorkloads(namespaces.map(namespace => namespace.name), activeFilters);
        })
        .catch(namespacesError => this.handleAxiosError('Could not fetch namespace list.', namespacesError));
    } else {
      this.fetchWorkloads(namespacesSelected, activeFilters);
    }
  };

  setActiveFiltersToURL() {
    const params = NamespaceFilterSelected.getSelected()
      .map(activeFilter => {
        const availableFilter = availableFilters.find(filter => {
          return filter.title === activeFilter.category;
        });

        if (typeof availableFilter === 'undefined') {
          NamespaceFilterSelected.setSelected(
            NamespaceFilterSelected.getSelected().filter(nfs => {
              return nfs.category === activeFilter.category;
            })
          );
          return null;
        }

        return {
          name: availableFilter.id,
          value: activeFilter.value
        };
      })
      .filter(filter => filter !== null);

    this.props.onParamChange(params, 'append');
  }

  fetchWorkloads(namespaces: string[], filters: ActiveFilter[]) {
    const workloadsConfigPromises = namespaces.map(namespace => API.getWorkloads(authentication(), namespace));
    Promise.all(workloadsConfigPromises).then(responses => {
      let workloadsItems: WorkloadListItem[] = [];
      responses.forEach(response => {
        workloadsItems = workloadsItems.concat(
          WorkloadListFilters.filterBy(WorkloadList.getDeploymentItems(response.data), filters)
        );
      });

      workloadsItems = WorkloadListFilters.sortWorkloadsItems(
        workloadsItems,
        this.state.currentSortField,
        this.state.isSortAscending
      );
      this.setState(prevState => {
        return {
          workloadItems: workloadsItems,
          pagination: {
            page: this.state.pagination.page,
            perPage: prevState.pagination.perPage,
            perPageOptions: perPageOptions
          }
        };
      });
    });
  }

  pageSet = (page: number) => {
    this.setState(prevState => {
      return {
        workloadItems: prevState.workloadItems,
        pagination: {
          page: page,
          perPage: prevState.pagination.perPage,
          perPageOptions: perPageOptions
        }
      };
    });

    this.props.onParamChange([{ name: 'page', value: page }]);
  };

  pageSelect = (perPage: number) => {
    this.setState(prevState => {
      return {
        workloadItems: prevState.workloadItems,
        pagination: {
          page: 1,
          perPage: perPage,
          perPageOptions: perPageOptions
        }
      };
    });

    this.props.onParamChange([{ name: 'page', value: 1 }, { name: 'perPage', value: perPage }]);
  };

  selectedFilters() {
    let activeFilters: ActiveFilter[] = [];
    availableFilters.forEach(filter => {
      this.props.queryParam(filter.id, []).forEach(value => {
        activeFilters.push({
          label: filter.title + ': ' + value,
          category: filter.title,
          value: value
        });
      });
    });

    return activeFilters;
  }

  updateSortField = (sortField: WorkloadListFilters.SortField) => {
    this.setState({
      currentSortField: sortField,
      workloadItems: WorkloadListFilters.sortWorkloadsItems(
        this.state.workloadItems,
        sortField,
        this.state.isSortAscending
      )
    });
    this.props.onParamChange([{ name: 'sort', value: sortField.param }]);
  };

  updateSortDirection = () => {
    this.setState(prevState => {
      return {
        isSortAscending: !prevState.isSortAscending,
        workloadItems: WorkloadListFilters.sortWorkloadsItems(
          prevState.workloadItems,
          prevState.currentSortField,
          !prevState.isSortAscending
        )
      };
    });

    this.props.onParamChange([{ name: 'direction', value: this.state.isSortAscending ? 'desc' : 'asc' }]);
  };

  handleAxiosError(message: string, error: AxiosError) {
    const errMsg = API.getErrorMsg(message, error);
    console.error(errMsg);
  }

  updateParams(params: URLParameter[], looking: string, id: string, value: string) {
    let newParams = params;
    const index = newParams.findIndex(param => param.name === looking && param.value.length > 0);
    if (index >= 0) {
      newParams[index].value = value;
    } else {
      newParams.push({
        name: id,
        value: value
      });
    }
    return newParams;
  }

  onFilterChange = (filters: ActiveFilter[]) => {
    let params: URLParameter[] = [];
    availableFilters.forEach(availableFilter => {
      params.push({ name: availableFilter.id, value: '' });
    });
    filters.forEach(activeFilter => {
      let filterId = (
        availableFilters.find(filter => {
          return filter.title === activeFilter.category;
        }) || availableFilters[2]
      ).id;
      switch (activeFilter.category) {
        case 'Istio Sidecar': {
          params = this.updateParams(params, 'istiosidecar', filterId, activeFilter.value);
          break;
        }
        case 'App Label': {
          params = this.updateParams(params, 'applabel', filterId, activeFilter.value);
          break;
        }
        case 'Version Label': {
          params = this.updateParams(params, 'versionlabel', filterId, activeFilter.value);
          break;
        }
        default: {
          params.push({
            name: filterId,
            value: activeFilter.value
          });
        }
      }
    });
    this.props.onParamChange(params, 'append');

    this.updateWorkloads();
  };

  handleError = (error: string) => {
    this.props.onError(error);
  };

  render() {
    let workloadList: React.ReactElement<{}>[] = [];
    let pageStart = (this.state.pagination.page - 1) * this.state.pagination.perPage;
    let pageEnd = pageStart + this.state.pagination.perPage;
    pageEnd = pageEnd < this.state.workloadItems.length ? pageEnd : this.state.workloadItems.length;

    for (let i = pageStart; i < pageEnd; i++) {
      workloadList.push(WorkloadList.renderWorkloadListItem(this.state.workloadItems[i], i));
    }

    return (
      <>
        <NamespaceFilter
          initialFilters={[
            WorkloadListFilters.workloadNameFilter,
            WorkloadListFilters.workloadTypeFilter,
            WorkloadListFilters.istioSidecarFilter,
            WorkloadListFilters.appLabelFilter,
            WorkloadListFilters.versionLabelFilter
          ]}
          initialActiveFilters={this.selectedFilters()}
          onFilterChange={this.onFilterChange}
          onError={this.handleError}
        >
          <Sort>
            <Sort.TypeSelector
              sortTypes={WorkloadListFilters.sortFields}
              currentSortType={this.state.currentSortField}
              onSortTypeSelected={this.updateSortField}
            />
            <Sort.DirectionSelector
              isNumeric={false}
              isAscending={this.state.isSortAscending}
              onClick={this.updateSortDirection}
            />
          </Sort>
          <ToolbarRightContent>
            <Button onClick={this.updateWorkloads}>
              <Icon name="refresh" />
            </Button>
          </ToolbarRightContent>
        </NamespaceFilter>
        <ListView>{workloadList}</ListView>
        <Paginator
          viewType="list"
          pagination={this.state.pagination}
          itemCount={this.state.workloadItems.length}
          onPageSet={this.pageSet}
          onPerPageSelect={this.pageSelect}
        />
      </>
    );
  }
}

export default WorkloadListComponent;
