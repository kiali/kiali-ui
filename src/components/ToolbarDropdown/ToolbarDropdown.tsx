import * as React from 'react';
import { FormSelect, FormSelectOption, ToolbarGroup, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { style } from 'typestyle';

type ToolbarDropdownProps = {
  disabled?: boolean;
  id?: string;
  initialLabel?: string;
  initialValue?: number | string;
  label?: string;
  nameDropdown?: string;
  options: object;
  tooltip?: string;
  value?: number | string;
  useName?: boolean;

  handleSelect: (value: string) => void;
  onToggle?: (isOpen: boolean) => void;
};

type ToolbarDropdownState = {
  currentValue?: number | string;
  currentName?: string;
};

const dividerStyle = style({borderRight: '1px solid #d1d1d1;'});

export class ToolbarDropdown extends React.Component<ToolbarDropdownProps, ToolbarDropdownState> {
  constructor(props: ToolbarDropdownProps) {
    super(props);
    this.state = {
      currentValue: props.value || props.initialValue,
      currentName: props.label || props.initialLabel
    };
  }

  onKeyChanged = (key: any) => {
    this.setState({ currentValue: key, currentName: this.props.options[key] });
    const nameOrKey = this.props.useName ? this.props.options[key] : key;
    this.props.handleSelect(nameOrKey);
  };

  render() {
    const dropdownButton = (
      <FormSelect
        isDisabled={this.props.disabled}
        title={this.props.label || this.state.currentName}
        onChange={this.onKeyChanged}
        id={this.props.id}
        value={this.props.value || this.state.currentValue}
      >
        {Object.keys(this.props.options).map(key => (
          <FormSelectOption key={key} label={this.props.options[key]} value={key} />
        ))}
      </FormSelect>
    );
    return (
      <ToolbarGroup className={dividerStyle}>
        {this.props.nameDropdown && <ToolbarItem><label style={{ paddingRight: '0.5em' }}>{this.props.nameDropdown}</label></ToolbarItem>}
        <ToolbarItem>
          {this.props.tooltip ? (
              <Tooltip key={'ot-' + this.props.id} entryDelay={1000} content={<>{this.props.tooltip}</>}>
                {dropdownButton}
              </Tooltip>
          ) : (
            dropdownButton
          )}
        </ToolbarItem>
      </ToolbarGroup>
    );
  }
}

export default ToolbarDropdown;
