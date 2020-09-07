import * as React from 'react';
import { FormGroup, Switch, TextInput } from '@patternfly/react-core';
import { Abort } from '../../../types/IstioObjects';

type Props = {
  aborted: boolean;
  abort: Abort;
  isValid: boolean;
  onAbort: (aborted: boolean, abort: Abort) => void;
};

const httpStatusMsg = 'HTTP status code to use to abort the Http request.';

class AbortFault extends React.Component<Props> {
  render() {
    return (
      <>
        <FormGroup label="Add HTTP Abort" fieldId="abortSwitch">
          <Switch
            id="abortSwitch"
            label={' '}
            labelOff={' '}
            isChecked={this.props.aborted}
            onChange={() => this.props.onAbort(!this.props.aborted, this.props.abort)}
          />
        </FormGroup>
        {this.props.aborted && (
          <FormGroup
            label="Abort Percentage"
            fieldId="abort-percentage"
            helperText="Percentage of requests to be aborted with the error code provided."
          >
            <TextInput
              value={this.props.abort.percentage?.value}
              type="number"
              id="abort-percentage"
              name="abort-percentage"
              onChange={value => {
                let maxValue: number = +value;
                maxValue = maxValue < 0 ? 0 : maxValue > 100 ? 100 : maxValue;
                this.props.onAbort(this.props.aborted, {
                  percentage: {
                    value: maxValue
                  },
                  httpStatus: this.props.abort.httpStatus
                });
              }}
            />
          </FormGroup>
        )}
        {this.props.aborted && (
          <FormGroup
            label="HTTP Status Code"
            fieldId="abort-status-code"
            helperText={httpStatusMsg}
            helperTextInvalid={httpStatusMsg}
            isValid={this.props.isValid}
          >
            <TextInput
              value={this.props.abort.httpStatus}
              type="number"
              id="abort-status-code"
              name="abort-status-code"
              isValid={this.props.isValid}
              onChange={value => {
                this.props.onAbort(this.props.aborted, {
                  percentage: this.props.abort.percentage,
                  httpStatus: +value
                });
              }}
            />
          </FormGroup>
        )}
      </>
    );
  }
}

export default AbortFault;
