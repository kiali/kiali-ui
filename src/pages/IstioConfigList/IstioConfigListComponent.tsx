import * as React from 'react';
import { connect } from 'react-redux';
import { StatefulFilters } from '../../components/Filters/StatefulFilters';
import { ActiveFiltersInfo } from '../../types/Filters';
import * as API from '../../services/Api';
import Namespace from '../../types/Namespace';
import {
  dicIstioType,
  filterByConfigValidation,
  filterByName,
  IstioConfigItem,
  toIstioItems
} from '../../types/IstioConfigList';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import * as IstioConfigListFilters from './FiltersAndSorts';
import { SortField } from '../../types/SortFilters';
import { namespaceEquals } from '../../utils/Common';
import { KialiAppState } from '../../store/Store';
import { activeNamespacesSelector } from '../../store/Selectors';
import RefreshButtonContainer from '../../components/Refresh/RefreshButton';
import VirtualList from '../../components/VirtualList/VirtualList';
import { showInMessageCenter } from '../../utils/IstioValidationUtils';
import { ObjectValidation } from '../../types/IstioObjects';
import IstioActionsNamespaceDropdown from '../../components/IstioActions/IstioActionsNamespaceDropdown';
import { ListComponentProps, ListComponentState } from 'helpers/ListComponentHelper';
import { getFilterSelectedValues, GlobalFilters } from 'utils/Filters';
import { addError } from 'utils/AlertUtils';

interface IstioConfigListComponentState extends ListComponentState<IstioConfigItem> {}
interface IstioConfigListComponentProps extends ListComponentProps<IstioConfigItem> {
  // We keep this as Optional because it does not come from the params
  activeNamespaces?: Namespace[];
}

class IstioConfigListComponent extends React.Component<IstioConfigListComponentProps, IstioConfigListComponentState> {
  private promises = new PromisesRegistry();

  constructor(props: IstioConfigListComponentProps) {
    super({ ...props, activeNamespaces: props.activeNamespaces || [] });
    this.state = {
      listItems: [],
      currentSortField: this.props.currentSortField,
      isSortAscending: this.props.isSortAscending
    };
  }

  componentDidMount() {
    this.updateListItems();
  }

  componentDidUpdate(
    prevProps: IstioConfigListComponentProps,
    _prevState: IstioConfigListComponentState,
    _snapshot: any
  ) {
    const [paramsSynced] = this.paramsAreSynced(prevProps);
    if (!paramsSynced) {
      this.setState({
        currentSortField: this.props.currentSortField,
        isSortAscending: this.props.isSortAscending
      });

      this.updateListItems();
    }
  }

  componentWillUnmount() {
    this.promises.cancelAll();
  }

  paramsAreSynced = (prevProps: IstioConfigListComponentProps): [boolean, boolean] => {
    const activeNamespacesCompare = namespaceEquals(prevProps.activeNamespaces!, this.props.activeNamespaces!);
    const paramsSynced =
      activeNamespacesCompare &&
      prevProps.isSortAscending === this.props.isSortAscending &&
      prevProps.currentSortField.title === this.props.currentSortField.title;
    return [paramsSynced, activeNamespacesCompare];
  };

  sortItemList(apps: IstioConfigItem[], sortField: SortField<IstioConfigItem>, isAscending: boolean) {
    return IstioConfigListFilters.sortIstioItems(apps, sortField, isAscending);
  }

  private updateListItems = () => {
    this.promises.cancelAll();

    const activeFilters: ActiveFiltersInfo = GlobalFilters.getActive();
    const namespacesSelected = this.props.activeNamespaces!.map(item => item.name);
    const istioTypeFilters = getFilterSelectedValues(IstioConfigListFilters.istioTypeFilter, activeFilters).map(
      value => dicIstioType[value]
    );
    const istioNameFilters = getFilterSelectedValues(IstioConfigListFilters.istioNameFilter, activeFilters);
    const configValidationFilters = getFilterSelectedValues(
      IstioConfigListFilters.configValidationFilter,
      activeFilters
    );

    if (namespacesSelected.length === 0) {
      this.promises
        .register('namespaces', API.getNamespaces())
        .then(namespacesResponse => {
          const namespaces: Namespace[] = namespacesResponse.data;
          this.fetchConfigs(
            namespaces.map(namespace => namespace.name),
            istioTypeFilters,
            istioNameFilters,
            configValidationFilters
          );
        })
        .catch(namespacesError => {
          if (!namespacesError.isCanceled) {
            addError('Could not fetch namespace list', namespacesError);
          }
        });
    } else {
      this.fetchConfigs(namespacesSelected, istioTypeFilters, istioNameFilters, configValidationFilters);
    }
  };

  fetchConfigs(
    namespaces: string[],
    istioTypeFilters: string[],
    istioNameFilters: string[],
    configValidationFilters: string[]
  ) {
    const configsPromises = this.fetchIstioConfigs(namespaces, istioTypeFilters, istioNameFilters);

    configsPromises
      .then(items =>
        items
          .map(item => item.validation)
          .filter((validation): validation is ObjectValidation => validation !== undefined)
      )
      .then(validations => showInMessageCenter(validations));

    configsPromises
      .then(items =>
        IstioConfigListFilters.sortIstioItems(items, this.state.currentSortField, this.state.isSortAscending)
      )
      .then(configItems => filterByConfigValidation(configItems, configValidationFilters))
      .then(sorted => {
        // Update the view when data is fetched
        this.setState({
          listItems: sorted
        });
      })
      .catch(istioError => {
        console.log(istioError);
        if (!istioError.isCanceled) {
          addError('Could not fetch Istio objects list', istioError);
        }
      });
  }

  // Fetch the Istio configs, apply filters and map them into flattened list items
  fetchIstioConfigs(namespaces: string[], typeFilters: string[], istioNameFilters: string[]) {
    return this.promises
      .registerAll(
        'configs',
        namespaces.map(ns => API.getIstioConfig(ns, typeFilters, true, '', ''))
      )
      .then(responses => {
        let istioItems: IstioConfigItem[] = [];
        responses.forEach(response => {
          istioItems = istioItems.concat(toIstioItems(filterByName(response.data, istioNameFilters)));
        });
        return istioItems;
      });
  }

  render() {
    return (
      <VirtualList rows={this.state.listItems}>
        <StatefulFilters
          initialFilters={IstioConfigListFilters.availableFilters}
          onFilterChange={this.updateListItems}
          rightToolbar={[
            <RefreshButtonContainer key={'Refresh'} handleRefresh={this.updateListItems} />,
            <IstioActionsNamespaceDropdown key={'Actions'} />
          ]}
        />
      </VirtualList>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  activeNamespaces: activeNamespacesSelector(state)
});

const IstioConfigListContainer = connect(mapStateToProps, null)(IstioConfigListComponent);
export default IstioConfigListContainer;
