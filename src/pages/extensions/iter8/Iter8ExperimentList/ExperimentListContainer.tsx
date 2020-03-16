import * as React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  Toolbar,
  ToolbarSection
} from '@patternfly/react-core';
import { style } from 'typestyle';
import { sortable, Table, TableBody, TableHeader, ISortBy, IRow } from '@patternfly/react-table';
import * as API from '../../../../services/Api';
import * as AlertUtils from '../../../../utils/AlertUtils';
import history from '../../../../app/History';
import { Iter8Info, Iter8Experiment } from '../../../../types/Iter8';
import { Link } from 'react-router-dom';
import * as FilterComponent from '../../../../components/FilterList/FilterComponent';

import RefreshButtonContainer from '../../../../components/Refresh/RefreshButton';
import { KialiAppState } from '../../../../store/Store';
import { activeNamespacesSelector } from '../../../../store/Selectors';
import { connect } from 'react-redux';
import { IstioConfigItem } from '../../../../types/IstioConfigList';
import { SortField } from '../../../../types/SortFilters';
import Namespace from '../../../../types/Namespace';
import { PromisesRegistry } from '../../../../utils/CancelablePromises';
import { namespaceEquals } from '../../../../utils/Common';

// Style constants
const rightToolbar = style({ marginLeft: 'auto' });
const containerPadding = style({ padding: '20px 20px 20px 20px' });

interface Props extends FilterComponent.State<Iter8Experiment> {
  activeNamespaces: Namespace[];
}

// State of the component/page
// It stores the visual state of the components and the experiments fetched from the backend.
interface State extends FilterComponent.State<Iter8Experiment> {
  iter8Info: Iter8Info;
  experimentLists: Iter8Experiment[];
  sortBy: ISortBy; // ?? not used yet
  dropdownOpen: boolean;
}

const columns = [
  {
    title: 'Name',
    transforms: [sortable]
  },
  {
    title: 'Phase',
    transforms: [sortable]
  },
  {
    title: 'Status',
    transforms: [sortable]
  },
  {
    title: 'Baseline',
    transforms: [sortable]
  },
  {
    title: 'Candidate',
    transforms: [sortable]
  },
  {
    title: 'Namespace',
    transforms: [sortable]
  }
];

class ExperimentListPage extends FilterComponent.Component<Props, State, Iter8Experiment> {
  private promises = new PromisesRegistry();

  constructor(props: Props) {
    super(props);
    this.state = {
      iter8Info: {
        enabled: false,
        permissions: {
          create: false,
          update: false,
          delete: false
        }
      },
      experimentLists: [],
      sortBy: {},
      dropdownOpen: false,
      listItems: [],
      currentSortField: this.props.currentSortField,
      isSortAscending: this.props.isSortAscending
    };
  }

  fetchExperiments = (namespaces: string[]) => {
    API.getIter8Info()
      .then(result => {
        const iter8Info = result.data;
        if (iter8Info.enabled) {
          API.getExperiments(namespaces)
            .then(result => {
              this.setState(prevState => {
                return {
                  iter8Info: iter8Info,
                  experimentLists: result.data,
                  sortBy: prevState.sortBy
                };
              });
            })
            .catch(error => {
              AlertUtils.addError('Could not fetch Iter8 Experiments.', error);
            });
        } else {
          AlertUtils.addError('Kiali has Iter8 extension enabled but it is not detected in the cluster');
        }
      })
      .catch(error => {
        AlertUtils.addError('Could not fetch Iter8 Info.', error);
      });
  };

  // It invokes backend when component is mounted
  componentDidMount() {
    this.updateListItems();
  }

  componentDidUpdate(prevProps: Props, _prevState: State, _snapshot: any) {
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

  paramsAreSynced = (prevProps: Props): [boolean, boolean] => {
    const activeNamespacesCompare = namespaceEquals(prevProps.activeNamespaces, this.props.activeNamespaces);
    const paramsSynced =
      activeNamespacesCompare &&
      prevProps.isSortAscending === this.props.isSortAscending &&
      prevProps.currentSortField.title === this.props.currentSortField.title;
    return [paramsSynced, activeNamespacesCompare];
  };

  // place holder, need to decide what is sortable field
  sortItemList(apps: Iter8Experiment[], sortField: SortField<IstioConfigItem>, isAscending: boolean) {
    return this.sortExperimentItems(apps, sortField, isAscending);
  }

  sortExperimentItems = (unsorted: Iter8Experiment[], sortField: SortField<Iter8Experiment>, isAscending: boolean) => {
    const sortPromise: Promise<Iter8Experiment[]> = new Promise(resolve => {
      resolve(unsorted.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a)));
    });

    return sortPromise;
  };

  updateListItems() {
    this.promises.cancelAll();

    const namespacesSelected = this.props.activeNamespaces.map(item => item.name);

    if (namespacesSelected.length === 0) {
      this.promises
        .register('namespaces', API.getNamespaces())
        .then(namespacesResponse => {
          const namespaces: Namespace[] = namespacesResponse.data;
          this.fetchExperiments(namespaces.map(namespace => namespace.name));
        })
        .catch(namespacesError => {
          if (!namespacesError.isCanceled) {
            this.handleAxiosError('Could not fetch namespace list', namespacesError);
          }
        });
    } else {
      this.fetchExperiments(namespacesSelected);
    }
  }

  // Invoke the history object to update and URL and start a routing
  goNewExperimentPage = () => {
    history.push('/extensions/iter8/new');
  };

  // This is a simplified actions toolbar.
  // It contains a create new handler action.
  actionsToolbar = () => {
    return (
      <Dropdown
        id="actions"
        title="Actions"
        toggle={<DropdownToggle onToggle={toggle => this.setState({ dropdownOpen: toggle })}>Actions</DropdownToggle>}
        onSelect={() => this.setState({ dropdownOpen: !this.state.dropdownOpen })}
        position={DropdownPosition.right}
        isOpen={this.state.dropdownOpen}
        dropdownItems={[
          <DropdownItem
            key="createExperiment"
            isDisabled={!this.state.iter8Info.enabled}
            onClick={() => this.goNewExperimentPage()}
          >
            Create New Experiment
          </DropdownItem>
        ]}
      />
    );
  };

  // This is a simplified toolbar for refresh and actions.
  // Kiali has a shared component toolbar for more complex scenarios like filtering
  // It renders actions only if user has permissions
  toolbar = () => {
    return (
      <Toolbar className="pf-l-toolbar pf-u-justify-content-space-between pf-u-mx-xl pf-u-my-md">
        <ToolbarSection aria-label="ToolbarSection">
          <Toolbar className={rightToolbar}>
            <RefreshButtonContainer key={'Refresh'} handleRefresh={() => this.updateListItems()} />
            {this.actionsToolbar()}
          </Toolbar>
        </ToolbarSection>
      </Toolbar>
    );
  };

  // Helper used to build the table content.
  rows = (): IRow[] => {
    return this.state.experimentLists.map(h => {
      return {
        cells: [
          <>
            <Link
              to={`/extensions/iter8/namespaces/${h.namespace}/name/${h.name}`}
              key={'Experiment_' + h.namespace + '_' + h.namespace}
            >
              {h.name}
            </Link>
          </>,
          <>{h.phase}</>,
          <>{h.status}</>,
          <>
            {h.baseline} <br /> {h.baselinePercentage}%
          </>,
          <>
            {h.candidate}
            <br /> {h.candidatePercentage}%
          </>,
          <>{h.namespace}</>
        ]
      };
    });
  };

  render() {
    return (
      <div className={containerPadding}>
        {this.toolbar()}
        <Table aria-label="Sortable Table" sortBy={this.state.sortBy} cells={columns} rows={this.rows()}>
          <TableHeader />
          <TableBody />
        </Table>
      </div>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  activeNamespaces: activeNamespacesSelector(state)
});

const ExperimentListPageContainer = connect(
  mapStateToProps,
  null
)(ExperimentListPage);

export default ExperimentListPageContainer;
