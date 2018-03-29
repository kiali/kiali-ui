import * as React from 'react';
import { observer } from 'mobx-react';
import { ButtonGroup, DropdownButton, MenuItem, Toolbar } from 'patternfly-react';
import { ButtonToolbar } from 'react-bootstrap';

import { GraphFilterProps, GraphFilterState } from '../../types/GraphFilter';
import Namespace from '../../types/Namespace';
import { DurationButtonGroup } from './DurationButtonGroup';
import { LayoutButtonGroup } from './LayoutButtonGroup';
import { namespaceStore } from '../../model/Namespace';

type DropdownListType = {
  list: Namespace[];
  current: Namespace;
  onSelect: Function;
};

export class DropdownList extends React.PureComponent<DropdownListType, {}> {
  render() {
    return this.props.list.map(ns => (
      <MenuItem
        key={ns.name}
        active={ns.name === this.props.current.name}
        eventKey={ns.name}
        onSelect={this.props.onSelect}
      >
        {ns.name}
      </MenuItem>
    ));
  }
}

@observer
export class GraphFilter extends React.Component<GraphFilterProps, GraphFilterState> {
  constructor(props: GraphFilterProps) {
    super(props);
  }

  componentDidMount() {
    this.reloadData();
  }

  reloadData = () => {
    namespaceStore.fetchNamespacesFromBackend();
  };

  setNamespaces = (response: any) => {
    this.setState({ availableNamespaces: response['data'] });
  };

  updateDuration = (value: string) => {
    if (this.props.activeDuration.value !== value) {
      // notify callback
      this.props.onFilterChange({ value: value });
    }
  };

  updateLayout = (value: string) => {
    if (this.props.activeLayout.name !== value) {
      // notify callback
      this.props.onLayoutChange({ name: value });
    }
  };

  updateNamespace = (selected: string) => {
    if (this.props.activeNamespace.name !== selected) {
      // notify callback
      this.props.onNamespaceChange({ name: selected });
    }
  };

  render() {
    return (
      <div>
        <ButtonToolbar>
          <ButtonGroup>
            <DropdownButton id="namespace-selector" title={this.props.activeNamespace.name} onClick={this.reloadData}>
              <DropdownList
                list={namespaceStore.namespaceList}
                current={this.props.activeNamespace}
                onSelect={this.updateNamespace}
              />
            </DropdownButton>
          </ButtonGroup>
          <DurationButtonGroup onClick={this.updateDuration} initialDuration={this.props.activeDuration.value} />
          <LayoutButtonGroup onClick={this.updateLayout} initialLayout={this.props.activeLayout.name} />
        </ButtonToolbar>
        <Toolbar />
      </div>
    );
  }
}

export default GraphFilter;
