import * as React from 'react';
import { FormGroup, FormSelect, FormSelectOption, Switch, TextInput } from '@patternfly/react-core';
import RuleBuilder from './AuthorizationPolicyForm/RuleBuilder';
import RuleList from './AuthorizationPolicyForm/RuleList';

type Props = {};

type State = {
  // Used to identify DENY_ALL, ALLOW_ALL or RULES
  rulesForm: string;
  addWorkloadSelector: boolean;
  workloadSelectorValid: boolean;
  workloadSelectorLabels: string;
  action: string;
};

const DENY_ALL = 'DENY_ALL';
const ALLOW_ALL = 'ALLOW_ALL';
const RULES = 'RULES';
const ALLOW = 'ALLOW';
const DENY = 'DENY';

const HELPER_TEXT = {
  DENY_ALL: 'Denies all requests to workloads in given namespace(s)',
  ALLOW_ALL: 'Allows all requests to workloads in given namespace(s)',
  RULES: 'Builds an Authorization Policy based on Rules'
};

const rulesFormValues = [DENY_ALL, ALLOW_ALL, RULES];
const actions = [ALLOW, DENY];

class AuthorizationPolicyForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      rulesForm: DENY_ALL,
      addWorkloadSelector: false,
      workloadSelectorValid: false,
      workloadSelectorLabels: '',
      action: ALLOW
    };
  }

  onRulesFormChange = (value, _) => {
    this.setState({
      rulesForm: value
    });
  };

  addWorkloadLabels = (value: string, _) => {
    if (value.length === 0) {
      this.setState({
        workloadSelectorValid: false,
        workloadSelectorLabels: ''
      });
      return;
    }
    value = value.trim();
    const labels: string[] = value.split(',');
    let isValid = true;
    // Some smoke validation rules for the labels
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (label.indexOf('=') < 0) {
        isValid = false;
        break;
      }
      const splitLabel: string[] = label.split('=');
      if (splitLabel.length !== 2) {
        isValid = false;
        break;
      }
      if (splitLabel[0].trim().length === 0 || splitLabel[1].trim().length === 0) {
        isValid = false;
        break;
      }
    }
    this.setState({
      workloadSelectorValid: isValid,
      workloadSelectorLabels: value
    });
  };

  onActionChange = (value, _) => {
    this.setState({
      action: value
    });
  };

  render() {
    return (
      <>
        <FormGroup label="Policy" fieldId="rules-form" helperText={HELPER_TEXT[this.state.rulesForm]}>
          <FormSelect value={this.state.rulesForm} onChange={this.onRulesFormChange} id="rules-form" name="rules-form">
            {rulesFormValues.map((option, index) => (
              <FormSelectOption key={index} value={option} label={option} />
            ))}
          </FormSelect>
        </FormGroup>
        {this.state.rulesForm === RULES && (
          <FormGroup label="Add Workload Selector" fieldId="workloadSelectorSwitch">
            <Switch
              id="workloadSelectorSwitch"
              label={' '}
              labelOff={' '}
              isChecked={this.state.addWorkloadSelector}
              onChange={() => {
                this.setState(prevState => ({
                  addWorkloadSelector: !prevState.addWorkloadSelector
                }));
              }}
            />
          </FormGroup>
        )}
        {this.state.addWorkloadSelector && (
          <FormGroup
            fieldId="workloadLabels"
            label="Labels"
            helperText="One or more labels to select a workload where AuthorizationPolicy is applied. Enter a label in the format <label>=<value>. Enter one or multiple labels separated by comma."
            helperTextInvalid="Invalid labels format: One or more labels to select a workload where AuthorizationPolicy is applied. Enter a label in the format <label>=<value>. Enter one or multiple labels separated by comma."
            isValid={this.state.workloadSelectorValid}
          >
            <TextInput
              id="gwHosts"
              name="gwHosts"
              isDisabled={!this.state.addWorkloadSelector}
              value={this.state.workloadSelectorLabels}
              onChange={this.addWorkloadLabels}
              isValid={this.state.workloadSelectorValid}
            />
          </FormGroup>
        )}
        {this.state.rulesForm === RULES && (
          <FormGroup label="Action" fieldId="action-form">
            <FormSelect value={this.state.action} onChange={this.onActionChange} id="action-form" name="action-form">
              {actions.map((option, index) => (
                <FormSelectOption key={index} value={option} label={option} />
              ))}
            </FormSelect>
          </FormGroup>
        )}
        {this.state.rulesForm === RULES && <RuleBuilder />}
        {this.state.rulesForm === RULES && <RuleList />}
      </>
    );
  }
}

export default AuthorizationPolicyForm;
