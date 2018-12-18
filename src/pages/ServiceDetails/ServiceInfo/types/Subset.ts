import { TrafficPolicy } from '../../../../types/IstioObjects';
import Label from './Label';

export default class Subset {
  name: string;
  labels: { [key: string]: string };
  trafficPolicy: TrafficPolicy;

  constructor(name: string, labels: { [key: string]: string }, trafficPolicy: TrafficPolicy) {
    this.name = name;
    this.labels = labels;
    this.trafficPolicy = trafficPolicy;
  }

  public isValid() {
    return this.hasValidName() && this.hasValidLabels() && this.hasValidTrafficPolicy();
  }

  hasValidName() {
    return typeof this.name === 'string';
  }

  hasValidLabels() {
    const valid = Object.keys(this.labels).every((k, i) => new Label(k, this.labels[k]).isValid());
    return this.labels instanceof Object && valid;
  }

  hasValidTrafficPolicy() {
    return true;
  }
}
