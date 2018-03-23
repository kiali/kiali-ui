import * as React from 'react';
import { ListView, ListViewItem, ListViewIcon, Sort } from 'patternfly-react';
import { Link } from 'react-router-dom';
import { NamespaceFilter, NamespaceFilterSelected } from '../../components/NamespaceFilter/NamespaceFilter';
import { Paginator } from 'patternfly-react';
import { ActiveFilter, FilterType } from '../../types/NamespaceFilter';
import * as API from '../../services/Api';
import { Namespace } from '../../types/Namespace';
import { Pagination } from '../../types/Pagination';
import { RuleItem, RuleList } from '../../types/IstioRuleListComponent';
import PropTypes from 'prop-types';
import { bindMethods } from '../../utils/helpers';

type SortField = {
  id: string;
  title: string;
  isNumeric: boolean;
};

const sortFields: SortField[] = [
  {
    id: 'namespace',
    title: 'Namespace',
    isNumeric: false
  },
  {
    id: 'rulename',
    title: 'Rule Name',
    isNumeric: false
  }
];

const ruleNameFilter: FilterType = {
  id: 'rulename',
  title: 'Rule Name',
  placeholder: 'Filter by Rule Name',
  filterType: 'text',
  filterValues: []
};

type IstioRuleListComponentState = {
  loading: boolean;
  rules: RuleItem[];
  pagination: Pagination;
  currentSortField: SortField;
  isSortAscending: boolean;
};

type IstioRuleListComponentProps = {
  onError: PropTypes.func;
};

const perPageOptions: number[] = [5, 10, 15];

class IstioRuleListComponent extends React.Component<IstioRuleListComponentProps, IstioRuleListComponentState> {
  constructor(props: IstioRuleListComponentProps) {
    super(props);

    bindMethods(this, [
      'filterChange',
      'handleError',
      'pageSet',
      'pageSelect',
      'updateSortField',
      'updateSortDirection'
    ]);

    this.state = {
      loading: true,
      rules: [],
      pagination: { page: 1, perPage: 10, perPageOptions: perPageOptions },
      currentSortField: sortFields[0],
      isSortAscending: true
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.updateRules();
  }

  filterChange() {
    this.setState({ loading: true });
    this.updateRules();
  }

  handleError(error: string) {
    this.props.onError(error);
    this.setState({ loading: false });
  }

  pageSet(page: number) {
    this.setState(prevState => {
      return {
        loading: prevState.loading,
        rules: prevState.rules,
        pagination: {
          page: page,
          perPage: prevState.pagination.perPage,
          perPageOptions: perPageOptions
        }
      };
    });
  }

  pageSelect(perPage: number) {
    this.setState(prevState => {
      return {
        loading: prevState.loading,
        rules: prevState.rules,
        pagination: {
          page: 1,
          perPage: perPage,
          perPageOptions: perPageOptions
        }
      };
    });
  }

  updateSortField(sortField: SortField) {
    this.setState(prevState => {
      return {
        currentSortField: sortField,
        rules: this.sortRules(prevState.rules, sortField, prevState.isSortAscending)
      };
    });
  }

  updateSortDirection() {
    this.setState(prevState => {
      return {
        isSortAscending: !prevState.isSortAscending,
        rules: this.sortRules(prevState.rules, prevState.currentSortField, !prevState.isSortAscending)
      };
    });
  }

  updateRules() {
    const activeFilters: ActiveFilter[] = NamespaceFilterSelected.getSelected();
    let namespacesSelected: string[] = activeFilters
      .filter(activeFilter => activeFilter.category === 'Namespace')
      .map(activeFilter => activeFilter.value);
    let rulenameFilters: string[] = activeFilters
      .filter(activeFilter => activeFilter.category === 'Rule Name')
      .map(activeFilter => activeFilter.value);

    if (namespacesSelected.length === 0) {
      API.GetNamespaces()
        .then(namespacesResponse => {
          const namespaces: Namespace[] = namespacesResponse['data'];
          this.fetchRules(namespaces.map(namespace => namespace.name), rulenameFilters);
        })
        .catch(namespacesError => {
          console.error(JSON.stringify(namespacesError));
          this.handleError('Error fetching namespace list.');
        });
    } else {
      this.fetchRules(namespacesSelected, rulenameFilters);
    }
  }

  fetchRules(namespaces: string[], rulenameFilters: string[]) {
    const promises = namespaces.map(ns => API.GetIstioRules(ns));
    Promise.all(promises)
      .then(rulesResponse => {
        let updatedRules: RuleItem[] = [];
        rulesResponse.forEach(ruleResponse => {
          const ruleList: RuleList = ruleResponse['data'];
          const namespace = ruleList.namespace;
          ruleList.rules.forEach(ruleItem => {
            ruleItem.namespace = namespace.name;
            updatedRules.push(ruleItem);
          });
        });
        if (rulenameFilters.length > 0) {
          updatedRules = this.filterRules(updatedRules, rulenameFilters);
        }
        updatedRules = this.sortRules(updatedRules, this.state.currentSortField, this.state.isSortAscending);
        this.setState(prevState => {
          return {
            loading: false,
            rules: updatedRules,
            pagination: {
              page: 1,
              perPage: prevState.pagination.perPage,
              perPageOptions: perPageOptions
            }
          };
        });
      })
      .catch(servicesError => {
        console.error(JSON.stringify(servicesError));
        this.handleError(' Error fetching service list.');
      });
  }

  isFiltered(rule: RuleItem, rulenameFilters: string[]) {
    for (let i = 0; i < rulenameFilters.length; i++) {
      if (rule.name.includes(rulenameFilters[i])) {
        return true;
      }
    }
    return false;
  }

  filterRules(rules: RuleItem[], rulenameFilters: string[]) {
    let filteredRules: RuleItem[] = rules.filter(service => this.isFiltered(service, rulenameFilters));
    return filteredRules;
  }

  sortRules(services: RuleItem[], sortField: SortField, isAscending: boolean): RuleItem[] {
    let sorted: RuleItem[] = services.sort((a: RuleItem, b: RuleItem) => {
      let sortValue = -1;
      if (sortField.id === 'namespace') {
        sortValue = a.namespace.localeCompare(b.namespace);
        if (sortValue === 0) {
          sortValue = a.name.localeCompare(b.name);
        }
      } else {
        sortValue = a.name.localeCompare(b.name);
      }
      return isAscending ? sortValue : sortValue * -1;
    });
    return sorted;
  }

  render() {
    let ruleList: any = [];
    let pageStart = (this.state.pagination.page - 1) * this.state.pagination.perPage;
    let pageEnd = pageStart + this.state.pagination.perPage;
    pageEnd = pageEnd < this.state.rules.length ? pageEnd : this.state.rules.length;

    for (let i = pageStart; i < pageEnd; i++) {
      let ruleItem = this.state.rules[i];
      let to = '/namespaces/' + ruleItem.namespace + '/rules/' + ruleItem.name;
      let ruleActions: any = [];
      for (let j = 0; j < ruleItem.actions.length; j++) {
        let ruleAction = ruleItem.actions[j];
        ruleActions.push(
          <div key={'rule' + j}>
            <div>
              <strong>Handler</strong>
              {': '}
              {ruleAction.handler}
            </div>
            <div>
              <strong>Instances</strong>
              {': '}
              {ruleAction.instances.join(', ')}
            </div>
          </div>
        );
      }
      ruleList.push(
        <Link key={to} to={to} style={{ color: 'black' }}>
          <ListViewItem
            leftContent={<ListViewIcon type="pf" name="migration" />}
            heading={
              <span>
                {ruleItem.name}
                <small>{ruleItem.namespace}</small>
              </span>
            }
            description={<div>{ruleActions}</div>}
          />
        </Link>
      );
    }

    let ruleListComponent;
    if (this.state.loading) {
      ruleListComponent = <div className="spinner spinner-sm left-spinner" />;
    } else {
      ruleListComponent = (
        <div>
          <NamespaceFilter
            initialFilters={[ruleNameFilter]}
            onFilterChange={this.filterChange}
            onError={this.handleError}
          >
            <Sort>
              <Sort.TypeSelector
                sortTypes={sortFields}
                currentSortType={this.state.currentSortField}
                onSortTypeSelected={this.updateSortField}
              />
              <Sort.DirectionSelector
                isNumeric={false}
                isAscending={this.state.isSortAscending}
                onClick={this.updateSortDirection}
              />
            </Sort>
          </NamespaceFilter>
          <ListView>{ruleList}</ListView>
          <Paginator
            viewType="list"
            pagination={this.state.pagination}
            itemCount={this.state.rules.length}
            onPageSet={this.pageSet}
            onPerPageSelect={this.pageSelect}
          />
        </div>
      );
    }
    return <div>{ruleListComponent}</div>;
  }
}

export default IstioRuleListComponent;
