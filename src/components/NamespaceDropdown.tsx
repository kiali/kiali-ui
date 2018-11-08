import * as React from 'react';
import { Button, Icon, OverlayTrigger, Popover } from 'patternfly-react';
import Namespace from '../types/Namespace';
import { style } from 'typestyle';

interface NamespaceListType {
  disabled: boolean;
  activeNamespaces: Namespace[];
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

  onChange = (a: any) => {
    this.props.onSelect({ name: a.target.value });
  };

  namespaceButtonText() {
    if (this.props.activeNamespaces.length === 0) {
      return 'Select a namespace';
    } else if (this.props.activeNamespaces.length === 1) {
      return this.props.activeNamespaces[0].name;
    } else {
      return `${this.props.activeNamespaces.length} selected`;
    }
  }

  handleToggle = (isOpen: boolean) => isOpen && this.props.refresh();

  render() {
    const activeMap = this.props.activeNamespaces.reduce((map, namespace) => {
      map[namespace.name] = namespace.name;
      return map;
    }, {});

    const checkboxStyle = style({ marginLeft: 5 });

    const namespaces = this.props.items.map((namespace: Namespace) => (
      <div id={`namespace-list-item[${namespace.name}]`} key={`namespace-list-item[${namespace.name}]`}>
        <label>
          <input
            type="checkbox"
            value={namespace.name}
            checked={!!activeMap[namespace.name]}
            onChange={this.onChange}
          />
          <span className={checkboxStyle}>{namespace.name}</span>
        </label>
      </div>
    ));

    const namespaceListPopover = <Popover id="namespace-list-layers-popover">{namespaces}</Popover>;

    return (
      <OverlayTrigger overlay={namespaceListPopover} placement="bottom" trigger={['click']} rootClose={true}>
        <Button id="graph_settings">
          {this.namespaceButtonText()} <Icon name="angle-down" />
        </Button>
      </OverlayTrigger>
    );
  }
}
