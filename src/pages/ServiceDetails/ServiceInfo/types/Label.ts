export default class Label {
  key: string;
  value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }

  isValid() {
    return typeof this.key === 'string' && typeof this.value === 'string';
  }
}
