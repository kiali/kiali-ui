import * as React from 'react';
import { Tooltip, TextInput, Button, ButtonVariant, Modal } from '@patternfly/react-core';
import { IntervalInSeconds, TimeInSeconds } from 'types/Common';
import { toString } from './LocalTime';
import { KialiIcon, defaultIconStyle } from 'config/KialiIcon';
import Slider from 'components/IstioWizards/Slider/Slider';
import { style } from 'typestyle';

interface DateTimeInputProps {
  minTime: TimeInSeconds;
  name: string;
  steps?: number;
  time: TimeInSeconds;
  tooltip?: string;

  onTimeChange: (time: TimeInSeconds) => void;
}

type DateTimeInputState = {
  customTime: TimeInSeconds;
  showCustomTime: boolean;
};

const defaultSteps: number = 100;

const sliderStyle = style({
  marginBottom: '2em',
  marginLeft: '15%',
  marginTop: '2em',
  width: '70%'
});

const inputStyle = style({
  width: '11em'
});

const buttonStyle = style({
  height: '36px'
});

export default class DateTimeInput extends React.PureComponent<DateTimeInputProps, DateTimeInputState> {
  private sliderMin: number;
  private sliderMax: number;
  private sliderStep: number;

  constructor(props: DateTimeInputProps) {
    super(props);

    const interval: IntervalInSeconds = this.props.time - this.props.minTime;
    const steps: number = !!this.props.steps ? this.props.steps : defaultSteps;

    this.sliderMin = 0;
    this.sliderMax = this.props.time - this.props.minTime;
    this.sliderStep = Math.floor(interval / steps);

    this.state = {
      customTime: this.props.time,
      showCustomTime: false
    };
  }

  render() {
    const isCustomTime = this.state.customTime !== this.props.time;

    return (
      <>
        <Tooltip content={<>{this.props.tooltip ? this.props.tooltip : this.props.name}</>}>
          <TextInput
            id="date_time_input"
            name="date_time_input"
            className={inputStyle}
            type="text"
            autoComplete="off"
            value={this.getString(this.state.customTime)}
            isReadOnly={true}
          />
        </Tooltip>
        <Tooltip key="ot_clear_find" position="top" content={`Change ${this.props.name}...`}>
          <Button className={buttonStyle} variant={ButtonVariant.control} onClick={this.toggleCustomTime}>
            <KialiIcon.UserClock className={defaultIconStyle} />
          </Button>
        </Tooltip>
        {this.state.showCustomTime && (
          <Modal
            width={'60%'}
            title={`Change ${this.props.name}`}
            isOpen={this.state.showCustomTime}
            onClose={this.cancelCustomTime}
            actions={[
              <Button key="confirm" variant="primary" onClick={this.confirmCustomTime} disabled={!isCustomTime}>
                {`Confirm ${isCustomTime ? this.getString(this.state.customTime) : ''}`}
              </Button>,
              <Button key="cancel" variant="link" onClick={this.cancelCustomTime}>
                Cancel
              </Button>
            ]}
            isFooterLeftAligned
          >
            <div className={sliderStyle}>
              <Slider
                key="custom-time"
                id="custom-time"
                orientation="horizontal"
                min={this.sliderMin}
                max={this.sliderMax}
                maxLimit={this.sliderMax}
                step={this.sliderStep}
                ticks_labels={[this.valToString(this.sliderMin), this.valToString(this.sliderMax)]}
                value={this.state.customTime}
                tooltip={true}
                tooltipFormatter={this.valToString}
                onSlideStop={this.setCustomTime}
                input={false}
                locked={false}
                showLock={false}
              />
            </div>
          </Modal>
        )}
      </>
    );
  }

  private toggleCustomTime = () => {
    if (this.state.showCustomTime) {
      this.cancelCustomTime();
    } else {
      this.setState({ showCustomTime: true });
    }
  };

  private cancelCustomTime = () => {
    this.setState({ customTime: this.props.time, showCustomTime: false });
  };

  private setCustomTime = (val: number) => {
    this.setState({ customTime: val + this.props.minTime });
  };

  private confirmCustomTime = () => {
    this.setState({ showCustomTime: false });
    this.props.onTimeChange(this.state.customTime);
  };

  private valToString = (val: number) => {
    return this.getString(val + this.props.minTime);
  };

  private getString = (time: TimeInSeconds) => {
    return toString(time * 1000, { second: '2-digit' });
  };
}
