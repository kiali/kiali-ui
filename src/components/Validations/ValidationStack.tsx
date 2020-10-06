import React from 'react';
import { ObjectCheck, ValidationTypes } from '../../types/IstioObjects';
import Validation from './Validation';
import { highestSeverity } from '../../types/ServiceInfo';
import { Stack, StackItem } from '@patternfly/react-core';
import { style } from 'typestyle';
import { PfColors } from '../Pf/PfColors';

type Props = {
  checks?: ObjectCheck[];
};

const colorStyle = style({ color: PfColors.White });
const marginTop = style({ marginTop: '1rem' });

class ValidationStack extends React.Component<Props> {
  validationList() {
    return (this.props.checks || []).map((check, index) => {
      return (
        <StackItem key={'validation-check-item-' + index} className={colorStyle}>
          <Validation key={'validation-check-' + index} severity={check.severity} message={check.message} />
        </StackItem>
      );
    });
  }

  render() {
    const severity = highestSeverity(this.props.checks || []);
    const isValid = severity === ValidationTypes.Correct;
    if (!isValid) {
      return (
        <Stack className={marginTop}>
          <StackItem className={colorStyle}>Istio validations</StackItem>
          {this.validationList()}
        </Stack>
      );
    } else {
      return null;
    }
  }
}

export default ValidationStack;
