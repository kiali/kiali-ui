import * as React from 'react';
import { WIZARD_TITLES, WorkloadWizardProps, WorkloadWizardState } from './WizardActions';
import { Button, Modal } from '@patternfly/react-core';

// NOTE: This class is not used but I will keep it in the repo as skeleton as we'll add again WorkloadWizards for other
class WorkloadWizard extends React.Component<WorkloadWizardProps, WorkloadWizardState> {
  constructor(props: WorkloadWizardProps) {
    super(props);
    this.state = {
      showWizard: false,
      valid: {}
    };
  }

  componentDidUpdate(prevProps: WorkloadWizardProps) {
    if (prevProps.show !== this.props.show) {
      this.setState({
        showWizard: this.props.show
      });
    }
  }

  onClose = (changed: boolean) => {
    this.setState(
      {
        showWizard: false,
        valid: {}
      },
      () => this.props.onClose(changed)
    );
  };

  onCreateUpdate = () => {
    switch (this.props.type) {
    }
  };

  isValid = (_state: WorkloadWizardState): boolean => {
    return true;
  };

  render() {
    return (
      <>
        <Modal
          width={'50%'}
          title={this.props.type.length > 0 ? WIZARD_TITLES[this.props.type] : ''}
          isOpen={this.state.showWizard}
          onClose={() => this.onClose(false)}
          actions={[
            <Button key="cancel" variant="secondary" onClick={() => this.onClose(false)}>
              Cancel
            </Button>,
            <Button
              isDisabled={!this.isValid(this.state)}
              key="confirm"
              variant="primary"
              onClick={this.onCreateUpdate}
            >
              {'Create'}
            </Button>
          ]}
        >
          <>Workload Wizard Skeleton</>
        </Modal>
      </>
    );
  }
}

export default WorkloadWizard;
