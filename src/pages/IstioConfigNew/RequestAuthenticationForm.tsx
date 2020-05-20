import * as React from 'react';
import { FormGroup, Switch } from '@patternfly/react-core';
import { TextInputBase as TextInput } from '@patternfly/react-core/dist/js/components/TextInput/TextInput';
import { JWTRule } from '../../types/IstioObjects';
import JwtRuleBuilder from './RequestAuthorizationForm/JwtRuleBuilder';
import JwtRuleList from './RequestAuthorizationForm/JwtRuleList';

type Props = {
  requestAuthentication: RequestAuthenticationState;
  onChange: (requestAuthentication: RequestAuthenticationState) => void;
};

export type RequestAuthenticationState = {
  workloadSelector: string;
  jwtRules: JWTRule[];
};

export const INIT_REQUEST_AUTHENTICATION = (): RequestAuthenticationState => ({
  workloadSelector: '',
  jwtRules: []
});

type State = {
  addWorkloadSelector: boolean;
  workloadSelectorValid: boolean;
  workloadSelectorLabels: string;
  addJWTRules: boolean;
  jwtRules: JWTRule[];
};

class RequestAuthenticationForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      addWorkloadSelector: false,
      workloadSelectorValid: false,
      workloadSelectorLabels: this.props.requestAuthentication.workloadSelector,
      addJWTRules: false,
      jwtRules: []
    };
  }

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
    this.setState(
      {
        workloadSelectorValid: isValid,
        workloadSelectorLabels: value
      },
      () => this.onRequestAuthenticationChange()
    );
  };

  onRequestAuthenticationChange = () => {
    const requestAuthentication: RequestAuthenticationState = {
      workloadSelector: this.state.workloadSelectorLabels,
      jwtRules: this.state.jwtRules
    };
    this.props.onChange(requestAuthentication);
  };

  onAddJwtRule = (jwtRule: JWTRule) => {
    this.setState(
      prevState => {
        prevState.jwtRules.push(jwtRule);
        return {
          jwtRules: prevState.jwtRules
        };
      },
      () => this.onRequestAuthenticationChange()
    );
  };

  onRemoveJwtRule = (index: number) => {
    this.setState(
      prevState => {
        prevState.jwtRules.splice(index, 1);
        return {
          jwtRules: prevState.jwtRules
        };
      },
      () => this.onRequestAuthenticationChange()
    );
  };

  render() {
    return (
      <>
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
        {this.state.addWorkloadSelector && (
          <FormGroup
            fieldId="workloadLabels"
            label="Labels"
            helperText="One or more labels to select a workload where RequestAuthentication is applied. Enter a label in the format <label>=<value>. Enter one or multiple labels separated by comma."
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
        <FormGroup label="Add JWT Rules" fieldId="addJWTRules">
          <Switch
            id="addJWTRules"
            label={' '}
            labelOff={' '}
            isChecked={this.state.addJWTRules}
            onChange={() => {
              this.setState(prevState => ({
                addJWTRules: !prevState.addJWTRules
              }));
            }}
          />
        </FormGroup>
        {this.state.addJWTRules && (
          <>
            <FormGroup label="JWT Rule Builder" fieldId="jwtRulesBuilder">
              <JwtRuleBuilder onAddJwtRule={this.onAddJwtRule} />
            </FormGroup>
            <FormGroup label="JWT Rules List" fieldId="jwtRulesList">
              <JwtRuleList jwtRules={this.state.jwtRules} onRemoveJwtRule={this.onRemoveJwtRule} />
            </FormGroup>
          </>
        )}
      </>
    );
  }
}

export default RequestAuthenticationForm;
