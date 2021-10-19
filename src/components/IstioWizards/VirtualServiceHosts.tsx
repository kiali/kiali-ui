import * as React from 'react';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';
type Props = {
  vsHosts: string[];
  isMesh: boolean;
  onVsHostsChange: (valid: boolean, vsHosts: string[]) => void;
};

class VirtualServiceHosts extends React.Component<Props> {
  isIncludeMeshValid = (): boolean => {
    return !(this.props.vsHosts.some(h => h === '*') && this.props.isMesh);
  };

  render() {
    const vsHosts = this.props.vsHosts.length > 0 ? this.props.vsHosts.join(',') : '';
    return (
      <Form isHorizontal={true}>
        <FormGroup
          label="VirtualService Hosts"
          fieldId="advanced-vshosts"
          isValid={this.isIncludeMeshValid()}
          helperText="The destination hosts to which traffic is being sent. Enter one or multiple hosts separated by comma."
          helperTextInvalid={"VirtualService Host '*' wildcard not allowed on mesh gateway."}
        >
          <TextInput
            value={vsHosts}
            id="advanced-vshosts"
            name="advanced-vshosts"
            onChange={value => {
              const isValid = value.length > 0 && !(value.split(',').some(h => h === '*') && this.props.isMesh);
              this.props.onVsHostsChange(isValid, value.split(','));
            }}
          />
        </FormGroup>
      </Form>
    );
  }
}

export default VirtualServiceHosts;
