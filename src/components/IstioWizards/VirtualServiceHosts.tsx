import * as React from 'react';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { GatewaySelectorState } from './GatewaySelector';
type Props = {
  vsHosts: string[];
  gateway?: GatewaySelectorState;
  onVsHostsChange: (valid: boolean, vsHosts: string[]) => void;
};

class VirtualServiceHosts extends React.Component<Props> {
  isVirtualServiceHostsValid = (vsHosts: string[]): boolean => {
    if (vsHosts.length === 0) {
      // vsHosts must have a value
      return false;
    }
    if (this.props.gateway && vsHosts.some(h => h === '*')) {
      if (!this.props.gateway.addGateway) {
        // wildcard needs a gateway
        return false;
      } else {
        if (this.props.gateway.addMesh) {
          // wildcard needs a non mesh gateway
          return false;
        }
      }
    }
    return true;
  };

  render() {
    const vsHosts = this.props.vsHosts.length > 0 ? this.props.vsHosts.join(',') : '';
    return (
      <Form isHorizontal={true}>
        <FormGroup
          label="VirtualService Hosts"
          fieldId="advanced-vshosts"
          isValid={this.isVirtualServiceHostsValid(this.props.vsHosts)}
          helperText="The destination hosts to which traffic is being sent. Enter one or multiple hosts separated by comma."
          helperTextInvalid={"VirtualService Host '*' wildcard not allowed on mesh gateway."}
        >
          <TextInput
            value={vsHosts}
            id="advanced-vshosts"
            name="advanced-vshosts"
            onChange={value => {
              const vsHosts = value.split(',');
              const isValid = this.isVirtualServiceHostsValid(vsHosts);
              this.props.onVsHostsChange(isValid, vsHosts);
            }}
          />
        </FormGroup>
      </Form>
    );
  }
}

export default VirtualServiceHosts;
