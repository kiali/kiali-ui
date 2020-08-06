import * as React from 'react';
import { Button, InputGroup, Select, SelectVariant, SelectOption, Tabs, Tab } from '@patternfly/react-core';
import MatchBuilder from './MatchBuilder';
import Matches from './Matches';
import { style } from 'typestyle';
import { WorkloadOverview } from '../../../types/ServiceInfo';
import { PfColors } from '../../Pf/PfColors';

type Props = {
  // MatchBuilder props
  category: string;
  operator: string;
  headerName: string;
  matchValue: string;
  isValid: boolean;
  onSelectCategory: (category: string) => void;
  onHeaderNameChange: (headerName: string) => void;
  onSelectOperator: (operator: string) => void;
  onMatchValueChange: (matchValue: string) => void;
  onAddMatch: () => void;

  // Matches props
  matches: string[];
  onRemoveMatch: (match: string) => void;

  workloads: WorkloadOverview[];
  routes: string[];
  onSelectRoutes: (routes: string[]) => void;

  // RuleBuilder
  validationMsg: string;
  onAddRule: () => void;
};

type State = {
  isWorkloadSelector: boolean;
  ruleTabKey: number;
};

const validationStyle = style({
  marginTop: 5,
  height: 30,
  color: PfColors.Red100
});

const addRuleStyle = style({
  width: '100%',
  textAlign: 'right'
});

class RuleBuilder extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      isWorkloadSelector: false,
      ruleTabKey: 0
    };
  }

  onWorkloadsToggle = () => {
    this.setState({
      isWorkloadSelector: !this.state.isWorkloadSelector
    });
  };

  ruleHandleTabClick = (_event, tabIndex) => {
    this.setState({
      ruleTabKey: tabIndex
    });
  };

  render() {
    return (
      <>
        <Tabs isFilled={true} activeKey={this.state.ruleTabKey} onSelect={this.ruleHandleTabClick}>
          <Tab eventKey={0} title={'Select Matching'}>
            <div style={{ marginTop: '20px' }}>
              <MatchBuilder {...this.props} />
              <Matches {...this.props} />
            </div>
          </Tab>
          <Tab eventKey={1} title={'Select Routes'}>
            <div style={{ marginTop: '20px' }}>
              <InputGroup>
                <span id="select-workloads-id" hidden>
                  Checkbox Title
                </span>
                <Select
                  aria-label="Select Input"
                  variant={SelectVariant.checkbox}
                  onToggle={this.onWorkloadsToggle}
                  onSelect={(_, selection) => {
                    if (this.props.routes.includes(selection as string)) {
                      this.props.onSelectRoutes(this.props.routes.filter(item => item !== selection));
                    } else {
                      this.props.onSelectRoutes([...this.props.routes, selection as string]);
                    }
                  }}
                  onClear={() => {
                    this.props.onSelectRoutes([]);
                  }}
                  selections={this.props.routes}
                  isExpanded={this.state.isWorkloadSelector}
                  placeholderText="Select workloads"
                  ariaLabelledBy="select-workloads-id"
                >
                  {this.props.workloads.map(wk => (
                    <SelectOption key={wk.name} value={wk.name} />
                  ))}
                </Select>
              </InputGroup>
              <div className={validationStyle}>{!this.props.isValid && this.props.validationMsg}</div>
            </div>
          </Tab>
        </Tabs>
        <div className={addRuleStyle}>
          <Button variant="secondary" isDisabled={!this.props.isValid} onClick={this.props.onAddRule}>
            Add Rule
          </Button>
        </div>
      </>
    );
  }
}

export default RuleBuilder;
