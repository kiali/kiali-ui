import { DestinationRuleSpec, K8sMetadata } from '../../../../types/IstioObjects';
import Subset from './Subset';

export default class DestinationRule {
  metadata: K8sMetadata;
  spec: DestinationRuleSpec;
  unformattedField: string;

  constructor(metadata: K8sMetadata, spec: DestinationRuleSpec) {
    this.metadata = metadata;
    this.spec = spec;
  }

  isValid() {
    return this.hasValidName() && this.hasSpecData() && this.hasValidSubsets() && this.hasValidHost();
  }

  hasValidName() {
    if (typeof this.metadata.name !== 'string') {
      this.unformattedField = 'Name';
      return false;
    }

    return true;
  }

  hasSpecData() {
    return this.spec !== null;
  }

  hasValidSubsets() {
    if (!this.spec.subsets) {
      return true;
    }

    let valid = this.spec.subsets instanceof Array;
    valid =
      valid &&
      this.spec.subsets.every((subset, i, ary) =>
        new Subset(subset.name, subset.labels, subset.trafficPolicy).isValid()
      );

    if (!valid) {
      this.unformattedField = 'Subsets';
    }

    return valid;
  }

  hasValidHost() {
    if (typeof this.spec.host !== 'string') {
      this.unformattedField = 'Host';
      return false;
    }

    return true;
  }

  formatValidation() {
    if (!this.isValid()) {
      return {
        message: 'This destination rule has format problems in field ' + this.unformattedField,
        severity: 'error',
        path: ''
      };
    }

    return null;
  }
}
