import * as React from 'react';

import Namespace from '../types/Namespace';
import ToolbarDropdown from './ToolbarDropdown/ToolbarDropdown';

interface NamespaceListType {
  activeNamespace: Namespace;
  items: Namespace[];
  onSelect: (namespace: Namespace) => void;
  refresh: () => void;
}

export class NamespaceDropdown extends React.PureComponent<NamespaceListType, {}> {
  constructor(props: NamespaceListType) {
    super(props);
  }

  componentDidMount() {
    this.props.refresh();
  }

  handleSelectNamespace = (namespace: string) => this.props.onSelect({ name: namespace });

  render() {
    let items = this.props.items.map(ns => {
      return ns.name;
    });

    return (
      <ToolbarDropdown
        disabled={false}
        useName={true}
        id="namespace-selector"
        initialLabel={this.props.activeNamespace.name}
        handleSelect={this.handleSelectNamespace}
        value={this.props.activeNamespace.name}
        options={items}
      />
    );
  }
}
