import * as React from 'react';
import { MessageDialog } from 'patternfly-react';
import { style } from 'typestyle';
import { Dropdown, DropdownItem, DropdownPosition, DropdownToggle } from '@patternfly/react-core';

type Props = {
  objectKind?: string;
  objectName: string;
  canDelete: boolean;
  onDelete: () => void;
};

type State = {
  showConfirmModal: boolean;
  dropdownOpen: boolean;
};

const msgDialogStyle = style({
  $nest: {
    '.modal-content': {
      fontSize: '14px'
    }
  }
});

class IstioActionDropdown extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showConfirmModal: false,
      dropdownOpen: false
    };
  }

  onSelect = e => {
    console.log(e);
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  };

  onToggle = (dropdownState: boolean) => {
    this.setState({
      dropdownOpen: dropdownState
    });
  };

  hideConfirmModal = () => {
    this.setState({ showConfirmModal: false });
  };

  onClickDelete = () => {
    this.setState({ showConfirmModal: true });
  };

  onDelete = () => {
    this.hideConfirmModal();
    this.props.onDelete();
  };

  render() {
    const objectName = this.props.objectKind ? this.props.objectKind : 'Istio object';

    return (
      <>
        <Dropdown
          id="actions"
          title="Actions"
          toggle={<DropdownToggle onToggle={this.onToggle}>Actions</DropdownToggle>}
          onSelect={this.onSelect}
          position={DropdownPosition.right}
          isOpen={this.state.dropdownOpen}
          dropdownItems={[
            <DropdownItem key="delete" onClick={this.onClickDelete} isDisabled={!this.props.canDelete}>
              Delete
            </DropdownItem>
          ]}
        />
        <MessageDialog
          className={msgDialogStyle}
          show={this.state.showConfirmModal}
          primaryAction={this.onDelete}
          secondaryAction={this.hideConfirmModal}
          onHide={this.hideConfirmModal}
          primaryActionButtonContent="Delete"
          secondaryActionButtonContent="Cancel"
          primaryActionButtonBsStyle="danger"
          title="Confirm Delete"
          primaryContent={`Are you sure you want to delete the ${objectName} '${this.props.objectName}'? `}
          secondaryContent="It cannot be undone. Make sure this is something you really want to do!"
          accessibleName="deleteConfirmationDialog"
          accessibleDescription="deleteConfirmationDialogContent"
        />
      </>
    );
  }
}

export default IstioActionDropdown;
