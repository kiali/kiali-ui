import * as React from 'react';
import { Tooltip, TextInput } from '@patternfly/react-core';
import { TimeInMilliseconds } from 'types/Common';
import { toString } from './LocalTime';

interface DateTimeInputProps {
  initialTime: TimeInMilliseconds;
  tooltip: string;

  onTimeChange: (time: TimeInMilliseconds) => void;
}

type DateTimeInputState = {
  errorMessage: string;
  inputValue: string;
};

const inputWidth = {
  width: '10em'
};

export default class DateTimeInput extends React.PureComponent<DateTimeInputProps, DateTimeInputState> {
  constructor(props: DateTimeInputProps) {
    super(props);

    this.state = {
      errorMessage: '',
      inputValue: this.getString()
    };
  }

  componentDidUpdate(prevProps: DateTimeInputProps) {
    const initialTimeChanged = this.props.initialTime !== prevProps.initialTime;

    if (initialTimeChanged) {
      this.setState({ inputValue: this.getString() });
    }
  }

  render() {
    const isValid: boolean = this.state.errorMessage.length === 0;

    return (
      <>
        <Tooltip content={<>{this.props.tooltip}</>}>
          <TextInput
            id="date_time_input"
            name="date_time_input"
            style={{ ...inputWidth }}
            type="text"
            autoComplete="off"
            isValid={isValid}
            onChange={this.updateInput}
            defaultValue={this.state.inputValue}
            onKeyPress={this.checkSubmit}
            placeholder="Custom DateTime"
          />
        </Tooltip>
        {this.state.errorMessage && (
          <div>
            <span style={{ color: 'red' }}>{this.state.errorMessage}</span>
          </div>
        )}
      </>
    );
  }

  private getString = (time?: TimeInMilliseconds) => {
    if (!time) {
      time = this.props.initialTime;
    }
    return toString(time, { second: '2-digit' });
  };

  private updateInput = val => {
    if ('' === val) {
      this.setState({ errorMessage: '', inputValue: this.getString() });
    } else {
      this.setState({ inputValue: val, errorMessage: '' });
    }
  };

  private checkSubmit = event => {
    const keyCode = event.keyCode ? event.keyCode : event.which;
    if (keyCode === 13) {
      event.preventDefault();
      this.submit();
    }
  };
  private submit = () => {
    const time: TimeInMilliseconds = Date.parse(this.state.inputValue);
    if (Number.isNaN(time)) {
      this.setState({ errorMessage: `Invalid Format. Must be like [${this.getString()}]` });
      return;
    }

    if (this.props.initialTime !== time) {
      this.props.onTimeChange(time);
    }
  };
}
