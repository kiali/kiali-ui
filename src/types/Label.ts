import { serverConfig } from '../config/ServerConfig';

export interface LabelValidations {
  key: string;
  value?: string;
  regex?: string;
  notPresence?: boolean;
}

export const labelValidation = (
  name: string,
  kind: string,
  namespace: string,
  labels: { [key: string]: string }
): LabelValidations[] => {
  const validations: LabelValidations[] = [];
  serverConfig.labelValidation.forEach(labelValidation => {
    if (
      labelValidation.name &&
      (labelValidation.name as RegExp).test(name) &&
      labelValidation.namespace &&
      (labelValidation.namespace as RegExp).test(namespace) &&
      labelValidation.kind &&
      (labelValidation.kind as RegExp).test(kind)
    ) {
      // Check presence
      labelValidation.presence.forEach(
        key =>
          !labels[key] &&
          validations.push({
            key: key,
            notPresence: true
          })
      );

      // Check filter
      for (const [key, regex] of Object.entries(labelValidation.filterLabel)) {
        const value = labels[key];
        value &&
          !regex.test(value) &&
          validations.push({
            key,
            value,
            regex: regex.source
          });
      }
    }
  });
  return validations;
};
