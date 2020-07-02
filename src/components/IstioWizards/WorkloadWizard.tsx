import * as React from 'react';
import { WIZARD_THREESCALE_LINK, WIZARD_TITLES, WorkloadWizardProps, WorkloadWizardState } from './WizardActions';
import { Button, Modal } from '@patternfly/react-core';
import ThreeScaleCredentials, { ThreeScaleCredentialsState } from './ThreeScaleCredentials';

class WorkloadWizard extends React.Component<WorkloadWizardProps, WorkloadWizardState> {
  constructor(props: WorkloadWizardProps) {
    super(props);
    this.state = {
      showWizard: false,
      valid: {
        threescale: false
      },
      threeScale: {
        serviceId: '',
        credentials: ''
      }
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
    this.props.onClose(changed);
  };

  onCreateUpdate = () => {
    console.log('TODELETE Now we need to create the 3scale config');
  };

  onThreeScaleChange = (state: ThreeScaleCredentialsState) => {
    this.setState(prevState => {
      prevState.valid.threescale = state.serviceId.length > 0 && state.credentials.length > 0;
      prevState.threeScale.serviceId = state.serviceId;
      prevState.threeScale.credentials = state.credentials;
      return {
        threeScale: prevState.threeScale
      };
    });
  };

  isValid = (state: WorkloadWizardState): boolean => {
    return state.valid.threescale;
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
          {this.props.type === WIZARD_THREESCALE_LINK && (
            <ThreeScaleCredentials
              threeScaleRules={this.props.rules}
              threeScaleCredentials={this.state.threeScale}
              onChange={this.onThreeScaleChange}
            />
          )}
        </Modal>
      </>
    );
  }
}

export default WorkloadWizard;
