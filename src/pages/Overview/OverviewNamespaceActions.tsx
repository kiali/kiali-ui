import * as React from 'react';
import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';

type Props = {
  namespace: string;
  onAction: (namespace: string) => void;
};

type State = {
  isKebabOpen: boolean;
};

export class OverviewNamespaceActions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isKebabOpen: false
    };
  }

  onKebabToggle = (isOpen: boolean) => {
    this.setState({
      isKebabOpen: isOpen
    });
  };

  render() {
    const namespaceActions = [
      <DropdownItem key="addNamespace" onClick={() => this.props.onAction(this.props.namespace)}>
        Add namespace to Mesh
      </DropdownItem>
    ];

    return (
      <Dropdown
        toggle={<KebabToggle onToggle={this.onKebabToggle} />}
        dropdownItems={namespaceActions}
        isPlain={true}
        isOpen={this.state.isKebabOpen}
        position={'right'}
      />
    );
  }
}
