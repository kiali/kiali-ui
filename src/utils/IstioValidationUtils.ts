import { ObjectCheck, ObjectValidation, ValidationTypes } from '../types/IstioObjects';
import * as AlertUtils from './AlertUtils';

const validationMessage = (validation: ObjectValidation, failedCheck: ObjectCheck) => {
  return `${validation.objectType}:${validation.name} ${failedCheck.message}`;
};

const showInMessageCenterValidation = (validation: ObjectValidation) => {
  for (let check of validation.checks) {
    switch (check.severity) {
      case ValidationTypes.Warning:
        AlertUtils.addWarning(validationMessage(validation, check), false);
        break;
      case ValidationTypes.Error:
        AlertUtils.addError(validationMessage(validation, check));
        break;
    }
  }
};

const showInMessageCenterValidations = (validations: ObjectValidation[]) => {
  const elementsWithFailedValidations: string[] = [];
  let hasError = false;
  for (let validation of validations) {
    for (let check of validation.checks) {
      if ([ValidationTypes.Warning, ValidationTypes.Error].includes(check.severity)) {
        if (check.severity === ValidationTypes.Error) {
          hasError = true;
        }
        elementsWithFailedValidations.push(`${validation.objectType}:${validation.name}`);
      }
    }
  }
  if (elementsWithFailedValidations.length > 0) {
    const detail = `${elementsWithFailedValidations.join('\n')}`;
    if (hasError) {
      AlertUtils.addError('IstioConfig has errors', undefined, undefined, undefined, detail);
    } else {
      AlertUtils.addWarning('IstioConfig has warnings', false, undefined, detail);
    }
  }
};

export const showInMessageCenter = (validation: ObjectValidation | ObjectValidation[]) => {
  if (Array.isArray(validation)) {
    showInMessageCenterValidations(validation);
  } else {
    showInMessageCenterValidation(validation);
  }
};
