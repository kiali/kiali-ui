import * as React from 'react';
import { ValidationTypes } from '../../types/IstioObjects';
import { style } from 'typestyle';
import { Text, TextVariants, Tooltip, TooltipPosition } from '@patternfly/react-core';
import Validation, { severityToValidation } from './Validation';

interface Props {
  id: string;
  errors: number;
  warnings: number;
}

const tooltipListStyle = style({
  border: 0,
  padding: '0 0 0 0',
  margin: '0 0 0 0'
});

export class ValidationSummary extends React.PureComponent<Props> {
  getTypeMessage = (count: number, type: ValidationTypes): string => {
    return count > 1 ? `${count} ${type}s found` : `${count} ${type} found`;
  };

  severitySummary() {
    const issuesMessages: string[] = [];

    if (this.props.errors > 0) {
      issuesMessages.push(this.getTypeMessage(this.props.errors, ValidationTypes.Error));
    }

    if (this.props.warnings > 0) {
      issuesMessages.push(this.getTypeMessage(this.props.warnings, ValidationTypes.Warning));
    }

    if (issuesMessages.length === 0) {
      issuesMessages.push('No issues found');
    }

    return issuesMessages;
  }

  severity() {
    let severity = ValidationTypes.Correct;
    if (this.props.errors > 0) {
      severity = ValidationTypes.Error;
    } else if (this.props.warnings > 0) {
      severity = ValidationTypes.Warning;
    }

    return severity;
  }

  tooltipContent() {
    const validation = severityToValidation[this.severity()];
    return (
      <>
        <Text component={TextVariants.h4}>
          <strong>{validation.name}</strong>
        </Text>
        <div className={tooltipListStyle}>
          {this.severitySummary().map(cat => (
            <div className={tooltipListStyle} key={cat}>
              {cat}
            </div>
          ))}
        </div>
      </>
    );
  }

  render() {
    return (
      <Tooltip
        aria-label={'Validations list'}
        position={TooltipPosition.auto}
        enableFlip={true}
        content={this.tooltipContent()}
      >
        <div style={{ float: 'left' }}>
          <Validation severity={this.severity()} />
        </div>
      </Tooltip>
    );
  }
}

export default ValidationSummary;
