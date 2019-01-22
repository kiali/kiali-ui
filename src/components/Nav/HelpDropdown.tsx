import * as React from 'react';
import AboutUIModal from '../About/AboutUIModal';
import { Component } from '../../store/Store';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons/';

type HelpDropdownProps = {
  status: { [key: string]: string };
  components: Component[];
  warningMessages: string[];
};
type HelpDropdownState = {};

class HelpDropdown extends React.Component<HelpDropdownProps, HelpDropdownState> {
  about: any;

  constructor(props: HelpDropdownProps) {
    super(props);
  }

  render() {
    return (
      <>
        <AboutUIModal
          ref={about => {
            this.about = about;
          }}
          status={this.props.status}
          components={this.props.components}
        />
        <Button id={'help_icon'} aria-label={'Help'} onClick={() => this.about.open()} variant={ButtonVariant.plain}>
          <HelpIcon />
        </Button>
      </>
    );
  }
}

export default HelpDropdown;
