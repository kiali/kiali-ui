import * as React from 'react';
import { ActionGroup, Button, FormGroup, Switch } from '@patternfly/react-core';
import SourceBuilder from './From/SourceBuilder';
import SourceList from './From/SourceList';
import OperationBuilder from './To/OperationBuilder';
import OperationList from './To/OperationList';
import ConditionBuilder from './When/ConditionBuilder';
import ConditionList from './When/ConditionList';

type Props = {};

type State = {
  addFromSwitch: boolean;
  addToSwitch: boolean;
  addWhenSwitch: boolean;
  fromList: { [key: string]: string[] }[];
};

class RuleBuilder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      addFromSwitch: false,
      addToSwitch: false,
      addWhenSwitch: false,
      fromList: []
    };
  }

  onAddFrom = (source: { [key: string]: string[] }): void => {
    this.setState(prevState => {
      prevState.fromList.push(source);
      return {
        fromList: prevState.fromList
      };
    });
  };

  onRemoveFrom = (index: number): void => {
    this.setState(prevState => {
      prevState.fromList.splice(index, 1);
      return {
        fromList: prevState.fromList
      };
    });
  };

  render() {
    return (
      <>
        <FormGroup label="Add From" fieldId="addFromSwitch">
          <Switch
            id="addFromSwitch"
            label={' '}
            labelOff={' '}
            isChecked={this.state.addFromSwitch}
            onChange={() => {
              this.setState(prevState => ({
                addFromSwitch: !prevState.addFromSwitch
              }));
            }}
          />
        </FormGroup>
        {this.state.addFromSwitch && (
          <>
            <FormGroup label="Source Builder" fieldId="sourceBuilder">
              <SourceBuilder onAddFrom={this.onAddFrom} />
            </FormGroup>
            <FormGroup label="From List" fieldId="sourceList">
              <SourceList fromList={this.state.fromList} onRemoveFrom={this.onRemoveFrom} />
            </FormGroup>
          </>
        )}
        <FormGroup label="Add To" fieldId="addToSwitch">
          <Switch
            id="addToSwitch"
            label={' '}
            labelOff={' '}
            isChecked={this.state.addToSwitch}
            onChange={() => {
              this.setState(prevState => ({
                addToSwitch: !prevState.addToSwitch
              }));
            }}
          />
        </FormGroup>
        {this.state.addToSwitch && (
          <FormGroup fieldId="operationBuilder">
            <OperationBuilder />
            <OperationList />
          </FormGroup>
        )}
        <FormGroup label="Add When" fieldId="addWhenSwitch">
          <Switch
            id="addWhenSwitch"
            label={' '}
            labelOff={' '}
            isChecked={this.state.addWhenSwitch}
            onChange={() => {
              this.setState(prevState => ({
                addWhenSwitch: !prevState.addWhenSwitch
              }));
            }}
          />
        </FormGroup>
        {this.state.addWhenSwitch && (
          <FormGroup fieldId="conditionBuilder">
            <ConditionBuilder />
            <ConditionList />
          </FormGroup>
        )}
        <ActionGroup>
          <Button variant="primary">Add Rule</Button>
        </ActionGroup>
      </>
    );
  }
}

export default RuleBuilder;
