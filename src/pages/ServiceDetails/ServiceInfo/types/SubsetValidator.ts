import { Subset } from '../../../../types/IstioObjects';

export default class SubsetValidator {
  subset: Subset;

  constructor(subset: Subset) {
    this.subset = subset;
  }

  public isValid() {
    return this.hasValidName();
  }

  hasValidName() {
    return this.hasStringType(this.subset.name);
  }

  hasStringType(value: any) {
    return typeof value === 'string';
  }
}
