import * as React from 'react';
import { Button, Modal } from '@patternfly/react-core';

type TrafficManagementProps = {
  opTarget: string;
  isOpen: boolean;
  nsTarget: string;
  hideConfirmModal: () => void;
  onConfirm: () => void;
};

type State = {};
export default class TrafficManagement extends React.Component<TrafficManagementProps, State> {
  constructor(props: TrafficManagementProps) {
    super(props);
  }

  render() {
    const modalAction =
      this.props.opTarget.length > 0
        ? this.props.opTarget.charAt(0).toLocaleUpperCase() + this.props.opTarget.slice(1)
        : '';
    return (
      <Modal
        isSmall={true}
        title={'Confirm ' + modalAction + ' Traffic Policies ?'}
        isOpen={this.props.isOpen}
        onClose={this.props.hideConfirmModal}
        actions={[
          <Button key="cancel" variant="secondary" onClick={this.props.hideConfirmModal}>
            Cancel
          </Button>,
          <Button key="confirm" variant="danger" onClick={this.props.onConfirm}>
            {modalAction}
          </Button>
        ]}
      >
        {'Namespace ' +
          this.props.nsTarget +
          ' has existing traffic policies objects. Do you want to ' +
          this.props.opTarget +
          ' them ?'}
      </Modal>
    );
  }
}
