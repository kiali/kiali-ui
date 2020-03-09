import * as React from 'react';
import { TextInput } from '@patternfly/react-core';

export interface LabelFiltersProps {
  onChange: (value: any) => void;
  value: string;
  onKeyPress: (key: any) => void;
}

export class LabelFilters extends React.Component<LabelFiltersProps> {
  updateCurrentValue = (key, value) => {
    this.props.onChange(`${key}=${value}`);
  };

  render() {
    const values = this.props.value.split('=');
    const key = values[0] || '';
    const value = values[1] || '';

    return (
      <>
        <TextInput
          type={'text'}
          value={key}
          aria-label={'filter_input_label_key'}
          placeholder={'Set Key'}
          onChange={newKey => this.updateCurrentValue(newKey, value)}
          onKeyPress={e => this.props.onKeyPress(e)}
          style={{ width: 'auto' }}
        />
        <TextInput
          type={'text'}
          value={value}
          aria-label={'filter_input_label_value'}
          placeholder={'Set Value'}
          onChange={newValue => this.updateCurrentValue(key, newValue)}
          onKeyPress={e => this.props.onKeyPress(e)}
          style={{ width: 'auto' }}
        />
      </>
    );
  }
}
