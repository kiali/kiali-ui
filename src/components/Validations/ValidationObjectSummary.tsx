import * as React from 'react';
import { ObjectValidation, StatusCondition, ValidationTypes } from '../../types/IstioObjects';
import ValidationSummary from './ValidationSummary';
import { CSSProperties } from 'react';

interface Props {
  id: string;
  validations: ObjectValidation[];
  reconciledCondition?: StatusCondition;
  style?: CSSProperties;
}

export class ValidationObjectSummary extends React.PureComponent<Props> {
  numberOfChecks = (type: ValidationTypes) => {
    let numCheck = 0;
    this.props.validations.forEach(validation => {
      if (validation.checks) {
        numCheck += validation.checks.filter(i => i.severity === type).length;
      }
    });
    return numCheck;
  };

  render() {
    return (
      <ValidationSummary
        id={this.props.id}
        objectCount={1}
        errors={this.numberOfChecks(ValidationTypes.Error)}
        warnings={this.numberOfChecks(ValidationTypes.Warning)}
        reconciledCondition={this.props.reconciledCondition}
        style={this.props.style}
      />
    );
  }
}
