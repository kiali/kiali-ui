import * as React from 'react';
import { Button, FormGroup, Switch } from '@patternfly/react-core';
import SourceBuilder from './From/SourceBuilder';
import SourceList from './From/SourceList';
import OperationBuilder from './To/OperationBuilder';
import OperationList from './To/OperationList';
import ConditionBuilder, { Condition } from './When/ConditionBuilder';
import ConditionList from './When/ConditionList';
import { style } from 'typestyle';
import { PfColors } from '../../../components/Pf/PfColors';

type Props = {
  onAddRule: (rule: Rule) => void;
};

export type Rule = {
  from: { [key: string]: string[] }[];
  to: { [key: string]: string[] }[];
  when: Condition[];
};

type State = {
  addFromSwitch: boolean;
  addToSwitch: boolean;
  addWhenSwitch: boolean;
  fromList: { [key: string]: string[] }[];
  toList: { [key: string]: string[] }[];
  conditionList: Condition[];
};

const warningStyle = style({
  marginLeft: 25,
  color: PfColors.Red100,
  textAlign: 'center'
});

class RuleBuilder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      addFromSwitch: false,
      addToSwitch: false,
      addWhenSwitch: false,
      fromList: [],
      toList: [],
      conditionList: []
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

  onAddTo = (operation: { [key: string]: string[] }): void => {
    this.setState(prevState => {
      prevState.toList.push(operation);
      return {
        toList: prevState.toList
      };
    });
  };

  onRemoveTo = (index: number): void => {
    this.setState(prevState => {
      prevState.toList.splice(index, 1);
      return {
        toList: prevState.toList
      };
    });
  };

  onAddCondition = (condition: Condition): void => {
    this.setState(prevState => {
      prevState.conditionList.push(condition);
      return {
        conditionList: prevState.conditionList
      };
    });
  };

  onRemoveCondition = (index: number): void => {
    this.setState(prevState => {
      prevState.conditionList.splice(index, 1);
      return {
        conditionList: prevState.conditionList
      };
    });
  };

  onAddRule = (): void => {
    const newRule: Rule = {
      from: Object.assign([], this.state.fromList),
      to: Object.assign([], this.state.toList),
      when: Object.assign([], this.state.conditionList)
    };
    this.setState(
      {
        addFromSwitch: false,
        addToSwitch: false,
        addWhenSwitch: false,
        fromList: [],
        toList: [],
        conditionList: []
      },
      () => this.props.onAddRule(newRule)
    );
  };

  canAddRule = (): boolean => {
    return this.state.fromList.length > 0 || this.state.toList.length > 0 || this.state.conditionList.length > 0;
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
          <>
            <FormGroup label="Operation Builder" fieldId="operationBuilder">
              <OperationBuilder onAddTo={this.onAddTo} />
            </FormGroup>
            <FormGroup label="To List" fieldId="operationList">
              <OperationList toList={this.state.toList} onRemoveTo={this.onRemoveTo} />
            </FormGroup>
          </>
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
          <>
            <FormGroup label="Condition Builder" fieldId="conditionBuilder">
              <ConditionBuilder onAddCondition={this.onAddCondition} />
            </FormGroup>
            <FormGroup label="When List" fieldId="conditionList">
              <ConditionList conditionList={this.state.conditionList} onRemoveCondition={this.onRemoveCondition} />
            </FormGroup>
          </>
        )}
        <FormGroup fieldId="addRule">
          <Button variant="secondary" onClick={this.onAddRule} isDisabled={!this.canAddRule()}>
            Add Rule
          </Button>
          {!this.canAddRule() && (
            <span className={warningStyle}>
              A Rule needs at least an item in "Add From", "Add To" or "Add When" sections
            </span>
          )}
        </FormGroup>
      </>
    );
  }
}

export default RuleBuilder;
