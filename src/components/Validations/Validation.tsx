import React from 'react';
import { ErrorCircleOIcon, OkIcon, WarningTriangleIcon } from '@patternfly/react-icons';
import { PfColors } from '../Pf/PfColors';
import { IconType } from '@patternfly/react-icons/dist/js/createIcon';
import { ValidationTypes } from '../../types/IstioObjects';
import { Text, TextVariants } from '@patternfly/react-core';
import './Validation.css';

type Props = ValidationDescription & {
  messageColor?: boolean;
  size?: string;
};

export type ValidationDescription = {
  severity: ValidationTypes;
  message?: string;
};

export type ValidationType = {
  name: string;
  color: string;
  icon: IconType;
};

const ErrorValidation: ValidationType = {
  name: 'Not Valid',
  color: PfColors.Red100,
  icon: ErrorCircleOIcon
};

const WarningValidation: ValidationType = {
  name: 'Warning',
  color: PfColors.Orange400,
  icon: WarningTriangleIcon
};

const CorrectValidation: ValidationType = {
  name: 'Valid',
  color: PfColors.Green400,
  icon: OkIcon
};

export const severityToValidation: { [severity: string]: ValidationType } = {
  error: ErrorValidation,
  warning: WarningValidation,
  correct: CorrectValidation
};

export const SMALL_SIZE = '12px';
export const MEDIUM_SIZE = '18px';
export const BIG_SIZE = '35px';
export const INHERITED_SIZE = 'inherit';

const sizeMapper = new Map<string, string>([
  ['small', SMALL_SIZE],
  ['medium', MEDIUM_SIZE],
  ['big', BIG_SIZE],
  ['inherited', INHERITED_SIZE]
]);

class Validation extends React.Component<Props> {
  validation() {
    return severityToValidation[this.props.severity];
  }

  size() {
    return sizeMapper.get(this.props.size || 'inherited') || INHERITED_SIZE;
  }

  render() {
    const validation = this.validation();
    const IconComponent = validation.icon;
    const colorMessage = this.props.messageColor || false;
    const colorStyle = { color: validation.color };
    const hasMessage = this.props.message;
    if (hasMessage) {
      return (
        <div className="validation">
          <div style={{ float: 'left', margin: '2px 0.6em 0 0' }}>
            <IconComponent style={colorStyle} />
          </div>
          <Text component={TextVariants.p} style={colorMessage ? colorStyle : {}}>
            {this.props.message}
          </Text>
        </div>
      );
    } else {
      return <IconComponent style={colorStyle} />;
    }
  }
}

export default Validation;
