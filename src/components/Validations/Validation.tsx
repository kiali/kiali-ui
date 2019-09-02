import React from 'react';
import { ErrorCircleOIcon, OkIcon, WarningTriangleIcon } from '@patternfly/react-icons';
import { PfColors } from '../Pf/PfColors';
import { IconType } from '@patternfly/react-icons/dist/js/createIcon';
import { ValidationTypes } from '../../types/IstioObjects';

type Props = {
  severity: ValidationTypes;
  message?: string;
  colorMessage?: boolean;
};

export type ValidationType = {
  color: string;
  icon: IconType;
};

const ErrorValidation: ValidationType = {
  color: PfColors.Red100,
  icon: ErrorCircleOIcon
};

const WarningValidation: ValidationType = {
  color: PfColors.Orange400,
  icon: WarningTriangleIcon
};

const CorrectValidation: ValidationType = {
  color: PfColors.Green400,
  icon: OkIcon
};

const severityToValidation: { [severity: string]: ValidationType } = {
  error: ErrorValidation,
  warning: WarningValidation,
  correct: CorrectValidation
};

class Validation extends React.Component<Props> {
  validation() {
    return severityToValidation[this.props.severity];
  }

  render() {
    const validation = this.validation();
    const IconComponent = validation.icon;
    const colorMessage: boolean = !!this.props.colorMessage;
    const colorStyle = { color: validation.color };
    const hasMessage = this.props.message;
    if (hasMessage) {
      return (
        <div>
          <div style={{ width: '20px', float: 'left', height: '100%' }}>
            <IconComponent style={colorStyle} />
          </div>
          <div style={{ width: '180px' }}>
            <p style={colorMessage ? colorStyle : {}}>{this.props.message}</p>
          </div>
        </div>
      );
    } else {
      return (
        <>
          <p style={colorMessage ? colorStyle : {}}>
            <IconComponent style={!colorMessage ? colorStyle : {}} />
          </p>
        </>
      );
    }
  }
}

export default Validation;
