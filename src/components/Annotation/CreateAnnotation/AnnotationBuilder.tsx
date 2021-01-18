import * as React from 'react';
import '../Annotation.css';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  InputGroup,
  Text,
  TextInput,
  TextVariants,
  ValidatedOptions
} from '@patternfly/react-core';
import './CreateAnnotation.css';
import { style } from 'typestyle';
import Slider from '../../IstioWizards/Slider/Slider';

interface Props {
  addAnnotation: (annotation: string) => void;
}

interface Validation {
  value: string;
  valid: ValidatedOptions;
}

interface State {
  codeRegex: Validation;
  degraded: string;
  failure: string;
  isDirectionDropdown: boolean;
  isProtocolDropdown: boolean;
  protocol: string;
  direction: string;
  isValid: boolean;
}

const directionOptions: { [key: string]: string } = {
  Inbound: 'inbound',
  Outbound: 'outbound',
  'Inbound/Outbound': 'inbound|outbound'
};

const directionDEFAULT = 'Inbound/Outbound';

const protocolOptions: { [key: string]: string } = {
  HTTP: 'http',
  GRPC: 'grpc'
};

const protocolDEFAULT = 'HTTP';

const addAnnotation = style({
  marginTop: '10px',
  float: 'right'
});

class AnnotationBuilder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      codeRegex: { value: '', valid: ValidatedOptions.default },
      degraded: '0',
      failure: '0',
      direction: directionOptions[directionDEFAULT],
      protocol: protocolOptions[protocolDEFAULT],
      isDirectionDropdown: false,
      isProtocolDropdown: false,
      isValid: false
    };
  }

  onRegexCode = (regex: string) => {
    var validation = this.state.codeRegex.valid;
    if (regex.length >= 3) {
      validation = ValidatedOptions.success;
    } else {
      validation = ValidatedOptions.error;
    }
    this.setState({ codeRegex: { value: regex, valid: validation } });
    this.isValid();
  };

  isValid = () => {
    const isValid =
      this.state.codeRegex.valid === ValidatedOptions.success &&
      Number(this.state.degraded) > 0 &&
      Number(this.state.failure) > 0
        ? true
        : false;
    this.setState({ isValid });
  };

  onThreshold = (value: string, kind: string) => {
    var degraded = Number(kind === 'degraded' ? value : this.state.degraded);
    var failure = Number(kind === 'failure' ? value : this.state.failure);
    degraded = Number(kind === 'failure' && failure < degraded ? value : degraded);
    failure = Number(kind === 'degraded' && degraded > failure ? value : failure);

    var state = {
      degraded: String(degraded),
      failure: String(failure)
    };
    this.setState(state);
    this.isValid();
  };

  onDirection = (direction: string) => {
    this.setState({ direction });
  };

  onProtocol = (protocol: string) => {
    this.setState({ protocol });
  };

  onAddAnnotation = () => {
    this.props.addAnnotation(
      this.state.codeRegex.value +
        ',' +
        this.state.degraded +
        ',' +
        this.state.failure +
        ',' +
        this.state.protocol +
        ',' +
        this.state.direction
    );
    this.setState({
      codeRegex: { value: '', valid: ValidatedOptions.default },
      degraded: '0',
      failure: '0',
      direction: directionOptions[directionDEFAULT],
      protocol: protocolOptions[protocolDEFAULT],
      isDirectionDropdown: false,
      isProtocolDropdown: false,
      isValid: false
    });
  };

  render() {
    return (
      <>
        <InputGroup>
          <TextInput
            id="code-regex"
            value={this.state.codeRegex.value}
            onChange={this.onRegexCode}
            validated={this.state.codeRegex.valid}
            placeholder={'Code regex: 3XX or 40X'}
          />
          <Dropdown
            toggle={
              <DropdownToggle
                id="toggle-id"
                onToggle={() => this.setState({ isDirectionDropdown: !this.state.isDirectionDropdown })}
              >
                {directionDEFAULT}
              </DropdownToggle>
            }
            isOpen={this.state.isDirectionDropdown}
            dropdownItems={Object.keys(directionOptions).map((key: string) => (
              <DropdownItem
                key={key}
                value={directionOptions[key]}
                component="button"
                onClick={() => {
                  this.onDirection(directionOptions[key]);
                  this.setState({ isDirectionDropdown: false });
                }}
              >
                {key}
              </DropdownItem>
            ))}
          />
          <Dropdown
            toggle={
              <DropdownToggle
                id="toggle-id"
                onToggle={() => this.setState({ isProtocolDropdown: !this.state.isProtocolDropdown })}
              >
                {protocolDEFAULT}
              </DropdownToggle>
            }
            isOpen={this.state.isProtocolDropdown}
            dropdownItems={Object.keys(protocolOptions).map((key: string) => (
              <DropdownItem
                key={key}
                value={protocolOptions[key]}
                component="button"
                onClick={() => {
                  this.onProtocol(protocolOptions[key]);
                  this.setState({ isProtocolDropdown: false });
                }}
              >
                {key}
              </DropdownItem>
            ))}
          />
        </InputGroup>
        <InputGroup style={{ marginTop: '20px' }}>
          <Text component={TextVariants.h5} style={{ width: '20%' }}>
            {' '}
            {'Degraded (>=' + this.state.degraded + '%)'}
          </Text>
          <div style={{ width: '35%' }}>
            <Slider
              id={'slider-degraded'}
              key={'slider-degraded'}
              tooltip={true}
              input={false}
              inputFormat="%"
              value={Number(this.state.degraded)}
              min={1}
              max={100}
              maxLimit={100}
              onSlide={value => {
                this.onThreshold(String(value), 'degraded');
              }}
              showLock={false}
            />
          </div>
          <Text component={TextVariants.h5} style={{ width: '20%', marginLeft: '5%' }}>
            {'Failure (>=' + this.state.failure + '%)'}
          </Text>
          <div style={{ width: '35%' }}>
            <Slider
              id={'slider-failure'}
              key={'slider-failure'}
              tooltip={true}
              input={false}
              inputFormat="%"
              value={Number(this.state.failure)}
              min={0}
              max={100}
              maxLimit={100}
              onSlide={value => {
                this.onThreshold(String(value), 'failure');
              }}
              showLock={false}
            />
          </div>
        </InputGroup>
        <div className={addAnnotation}>
          <Button variant="secondary" isDisabled={!this.state.isValid} onClick={this.onAddAnnotation}>
            Add Annotation
          </Button>
        </div>
      </>
    );
  }
}

export default AnnotationBuilder;
