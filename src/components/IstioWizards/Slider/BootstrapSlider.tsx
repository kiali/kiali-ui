// Clone of Slider component to workaround issue https://github.com/patternfly/patternfly-react/issues/1221

import React from 'react';
import Slider from 'bootstrap-slider-without-jquery';

const orientation = {
  horizontal: 'horizontal',
  vertical: 'vertical'
};

type Props = {
  value: number;
  formatter: (value: any) => any;
  onSlide: (event: any) => any;
  orientation: string;
  ticks_labels: [];
  locked: boolean;
  min: number;
  // Note that Slider will use max and maxLimit properties to:
  // maxLimit: the max value Slider can show
  // max: the max value Slider can enter
  // max < maxLimit when using Slider groups, so max can be relative
  max: number;
  maxLimit: number;
};

class BootstrapSlider extends React.Component<Props> {
  static defaultProps = {
    formatter: value => value,
    onSlide: event => event,
    orientation: 'horizontal',
    ticks_labels: [],
    locked: false
  };
  slider: Slider;
  sliderDiv: any;

  componentDidMount() {
    this.slider = new Slider(this.sliderDiv, {
      ...this.props
    });

    const onSlide = value => {
      value = value >= this.props.max ? this.props.max : value;
      this.props.onSlide(value);
      this.slider.setValue(value);
    };
    this.slider.on('slide', onSlide);
    this.slider.on('slideStop', onSlide);
    this.slider.setAttribute('min', this.props.min);
    this.slider.setAttribute('max', this.props.maxLimit);
    if (this.props.locked) {
      this.slider.disable();
    } else {
      this.slider.enable();
    }
  }

  // Instead of rendering the slider element again and again,
  // we took advantage of the bootstrap-slider library
  // and only update the new value or format when new props arrive.
  componentDidUpdate(prevProps: Props) {
    if (
      this.props.min !== prevProps.min ||
      this.props.max !== prevProps.max ||
      this.props.maxLimit !== prevProps.maxLimit ||
      this.props.locked !== prevProps.locked
    ) {
      this.slider.setAttribute('min', this.props.min);
      this.slider.setAttribute('max', this.props.maxLimit);
      this.slider.refresh();
      const onSlide = value => {
        value = value >= this.props.max ? this.props.max : value;
        this.props.onSlide(value);
        this.slider.setValue(value);
      };
      this.slider.on('slide', onSlide);
      this.slider.on('slideStop', onSlide);
      this.slider.setAttribute('formatter', this.props.formatter);
      if (this.props && this.props.orientation && orientation) {
        console.log('TODELETE orientation check');
      }
      if (this.props.locked) {
        this.slider.disable();
      } else {
        this.slider.enable();
      }
    }

    this.slider.setValue(this.props.value);
    // Adjust the tooltip to "sit" ontop of the slider's handle. #LibraryBug
    if (this.props && this.props.orientation === orientation.horizontal) {
      this.slider.tooltip.style.marginLeft = `-${this.slider.tooltip.offsetWidth / 2}px`;
      if (this.props.ticks_labels && this.slider.tickLabelContainer) {
        this.slider.tickLabelContainer.style.marginTop = '0px';
      }
    } else {
      this.slider.tooltip.style.marginTop = `-${this.slider.tooltip.offsetHeight / 2}px`;
    }
  }

  render() {
    return (
      <input
        className="slider-pf"
        type="range"
        ref={input => {
          this.sliderDiv = input;
        }}
      />
    );
  }
}

export default BootstrapSlider;
