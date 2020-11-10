import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import _ from 'lodash';
import { style } from 'typestyle';
import {
  Button,
  Dropdown,
  DropdownToggle,
  TextInput,
  Tooltip,
  // DropdownItem,
  // DropdownPosition,
  DropdownToggleCheckbox
} from '@patternfly/react-core';
import { KialiAppState } from '../store/Store';
import { activeNamespacesSelector, namespaceFilterSelector, namespaceItemsSelector } from '../store/Selectors';
import { KialiAppAction } from '../actions/KialiAppAction';
import { NamespaceActions } from '../actions/NamespaceAction';
import NamespaceThunkActions from '../actions/NamespaceThunkActions';
import Namespace from '../types/Namespace';
import { HistoryManager, URLParam } from '../app/History';
import {
  BoundingClientAwareComponent,
  PropertyType
} from './BoundingClientAwareComponent/BoundingClientAwareComponent';
import { KialiIcon } from 'config/KialiIcon';
import TourStopContainer from './Tour/TourStop';
import { GraphTourStops } from '../pages/Graph/GraphHelpTour';

type ReduxProps = {
  activeNamespaces: Namespace[];
  filter: string;
  namespaces: Namespace[];
  refresh: () => void;
  setFilter: (filter: string) => void;
  setNamespaces: (namespaces: Namespace[]) => void;
};

type NamespaceDropdownProps = ReduxProps & {
  disabled: boolean;
  clearAll: () => void;
};

type NamespaceDropdownState = {
  isBulkSelectorOpen: boolean;
  isOpen: boolean;
  selectedNamespaces: Namespace[];
};

const checkboxLabelStyle = style({ marginLeft: '0.5em' });

const headerStyle = style({
  height: 40,
  margin: '5px 10px 5px 0.5em',
  width: 375
});

const filterStyle = style({
  float: 'right',
  width: 225
});

const namespaceLabelStyle = style({
  fontWeight: 400
});

const namespaceValueStyle = style({
  fontWeight: 400
});

const popoverMarginBottom = 20;

const namespaceContainerStyle = style({
  overflow: 'auto'
});

export class NamespaceDropdown extends React.PureComponent<NamespaceDropdownProps, NamespaceDropdownState> {
  constructor(props: NamespaceDropdownProps) {
    super(props);
    this.state = {
      isBulkSelectorOpen: false,
      isOpen: false,
      selectedNamespaces: [...this.props.activeNamespaces]
    };
  }

  componentDidMount() {
    this.props.refresh();
    this.syncNamespacesURLParam();
  }

  // update redux with URL namespaces if set, otherwise update URL with redux
  syncNamespacesURLParam = () => {
    const urlNamespaces = (HistoryManager.getParam(URLParam.NAMESPACES) || '').split(',').filter(Boolean);
    if (
      urlNamespaces.length > 0 &&
      _.difference(
        urlNamespaces,
        this.props.activeNamespaces.map(item => item.name)
      )
    ) {
      // We must change the props of namespaces
      const items = urlNamespaces.map(ns => ({ name: ns } as Namespace));
      this.props.setNamespaces(items);
    } else if (urlNamespaces.length === 0 && this.props.activeNamespaces.length !== 0) {
      HistoryManager.setParam(URLParam.NAMESPACES, this.props.activeNamespaces.map(item => item.name).join(','));
    }
  };

  componentDidUpdate(prevProps: NamespaceDropdownProps) {
    if (prevProps.activeNamespaces !== this.props.activeNamespaces) {
      if (this.props.activeNamespaces.length === 0) {
        HistoryManager.deleteParam(URLParam.NAMESPACES);
      } else {
        HistoryManager.setParam(URLParam.NAMESPACES, this.props.activeNamespaces.map(item => item.name).join(','));
      }
      this.setState({ selectedNamespaces: this.props.activeNamespaces });
    }
  }

  private namespaceButtonText() {
    if (this.state.selectedNamespaces.length === 0) {
      return <span className={namespaceValueStyle}>Select Namespaces</span>;
    } else if (this.state.selectedNamespaces.length === 1) {
      return (
        <>
          <span className={namespaceLabelStyle}>Namespace:</span>
          <span>&nbsp;</span>
          <span className={namespaceValueStyle}>{this.state.selectedNamespaces[0].name}</span>
        </>
      );
    } else {
      return (
        <>
          <span className={namespaceLabelStyle}>Namespaces:</span>
          <span>&nbsp;</span>
          <span className={namespaceValueStyle}>{`${this.state.selectedNamespaces.length} namespaces`}</span>
        </>
      );
    }
  }

  private getBulkSelector() {
    const { selectedNamespaces } = this.state;
    const numSelected = selectedNamespaces.length;
    const allSelected = numSelected === this.props.namespaces.length;
    const anySelected = numSelected > 0;
    const someChecked = anySelected ? null : false;
    const isChecked = allSelected ? true : someChecked;

    /*
    const items = [
      <DropdownItem key="bulk-none" onClick={() => this.onBulkNone()}>
        Clear All
      </DropdownItem>,
      <DropdownItem key="bulk-all" onClick={() => this.onBulkAll()}>
        Select all
      </DropdownItem>
    ];
*/
    console.log('BulkSelector');
    return (
      <span style={{ position: 'relative', top: 8 }}>
        <DropdownToggleCheckbox
          id="bulk-select-id"
          key="bulk-select-key"
          aria-label={anySelected ? 'Clear all' : 'Select all'}
          isChecked={isChecked}
          onClick={() => {
            anySelected ? this.onBulkNone() : this.onBulkAll();
          }}
        ></DropdownToggleCheckbox>
        <span className={checkboxLabelStyle}>{anySelected ? 'Clear all' : 'Select all'}</span>
      </span>
    );
  }

  private getHeader() {
    return (
      <div className={headerStyle}>
        {this.getBulkSelector()}
        <span>
          {!!this.props.filter && (
            <Tooltip key="ot_clear_namespace_filter" position="top" content="Clear Filter by Name">
              <Button onClick={this.clearFilter} style={{ float: 'right' }}>
                <KialiIcon.Close />
              </Button>
            </Tooltip>
          )}
          <TextInput
            className={filterStyle}
            aria-label="filter-namespace"
            type="text"
            name="namespace-filter"
            placeholder="Filter by Name..."
            value={this.props.filter}
            onChange={this.onFilterChange}
          />
        </span>
      </div>
    );
  }

  private getBody() {
    if (this.props.namespaces.length > 0) {
      const selectedMap = this.state.selectedNamespaces.reduce((map, namespace) => {
        map[namespace.name] = namespace.name;
        return map;
      }, {});
      const namespaces = this.props.namespaces
        .filter((namespace: Namespace) => namespace.name.includes(this.props.filter))
        .map((namespace: Namespace) => (
          <div
            style={{ marginLeft: '0.5em' }}
            id={`namespace-list-item[${namespace.name}]`}
            key={`namespace-list-item[${namespace.name}]`}
          >
            <label>
              <input
                type="checkbox"
                value={namespace.name}
                checked={!!selectedMap[namespace.name]}
                onChange={this.onNamespaceToggled}
              />
              <span className={checkboxLabelStyle}>{namespace.name}</span>
            </label>
          </div>
        ));

      return (
        <>
          <BoundingClientAwareComponent
            className={namespaceContainerStyle}
            maxHeight={{ type: PropertyType.VIEWPORT_HEIGHT_MINUS_TOP, margin: popoverMarginBottom }}
          >
            {namespaces}
          </BoundingClientAwareComponent>
        </>
      );
    }
    return <div>No namespaces found</div>;
  }

  private getFooter() {
    return (
      <div style={{ padding: '10px 10px 0 10px' }}>
        <Button key="cancel" variant="secondary" onClick={() => this.onClose(false)}>
          Cancel
        </Button>
        <Button style={{ float: 'right' }} key="confirm" variant="primary" onClick={() => this.onClose(true)}>
          OK
        </Button>
      </div>
    );
  }

  render() {
    return (
      <TourStopContainer info={GraphTourStops.Namespaces}>
        <Dropdown
          toggle={
            <DropdownToggle id={'namespace-selector'} onToggle={this.onToggle} isDisabled={this.props.disabled}>
              {this.namespaceButtonText()}
            </DropdownToggle>
          }
          isOpen={this.state.isOpen}
          onKeyDownCapture={this.checkSpecialKey}
        >
          {this.getHeader()}
          {this.getBody()}
          {this.getFooter()}
        </Dropdown>
      </TourStopContainer>
    );
  }

  private onBulkNone = () => {
    this.setState({ selectedNamespaces: [] });
  };

  private onBulkAll = () => {
    this.setState({ selectedNamespaces: [...this.props.namespaces] });
  };

  /*
  private onBulkSelect = () => {
    this.setState({ isBulkSelectorOpen: !this.state.isBulkSelectorOpen });
  };
  */

  onNamespaceToggled = event => {
    const namespace = event.target.value;
    const selectedNamespaces = !!this.state.selectedNamespaces.find(n => n.name === namespace)
      ? this.state.selectedNamespaces.filter(n => n.name !== namespace)
      : this.state.selectedNamespaces.concat([{ name: event.target.value } as Namespace]);
    this.setState({ selectedNamespaces: selectedNamespaces });
  };

  private onFilterChange = (value: string) => {
    this.props.setFilter(value);
  };

  private onToggle = isOpen => {
    if (isOpen) {
      this.props.refresh();
    }
    this.setState({
      isOpen
    });
  };

  private checkSpecialKey = event => {
    const keyCode = event.keyCode ? event.keyCode : event.which;
    switch (keyCode) {
      case 27: // Esc
        this.onClose(false);
        break;
      default:
        break;
    }
  };

  private onClose = (isUpdate: boolean) => {
    if (isUpdate) {
      this.props.setNamespaces(this.state.selectedNamespaces);
    }
    this.setState({ isOpen: false, selectedNamespaces: [...this.props.activeNamespaces] });
  };

  private clearFilter = () => {
    this.props.setFilter('');
  };
}

const mapStateToProps = (state: KialiAppState) => {
  return {
    namespaces: namespaceItemsSelector(state)!,
    activeNamespaces: activeNamespacesSelector(state),
    filter: namespaceFilterSelector(state)
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    refresh: () => {
      dispatch(NamespaceThunkActions.fetchNamespacesIfNeeded());
    },
    clearAll: () => {
      dispatch(NamespaceActions.setActiveNamespaces([]));
    },
    setNamespaces: (namespaces: Namespace[]) => {
      dispatch(NamespaceActions.setActiveNamespaces(namespaces));
    },
    setFilter: (filter: string) => {
      dispatch(NamespaceActions.setFilter(filter));
    }
  };
};

const NamespaceDropdownContainer = connect(mapStateToProps, mapDispatchToProps)(NamespaceDropdown);
export default NamespaceDropdownContainer;
