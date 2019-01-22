import * as React from 'react';

import PfSpinnerContainer from '../../containers/PfSpinnerContainer';
import { Toolbar as ToolbarNext, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import UserDropdown from '../../containers/UserDropdownContainer';
import HelpDropdown from '../../containers/HelpDropdownContainer';
import { MessageCenterTriggerContainer } from '../../containers/MessageCenterContainer';

class Toolbar extends React.Component {
  render() {
    return (
      <ToolbarNext>
        <ToolbarGroup>
          <PfSpinnerContainer />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem>
            <MessageCenterTriggerContainer />
          </ToolbarItem>
          <ToolbarItem>
            <HelpDropdown />
          </ToolbarItem>
          <ToolbarItem>
            <UserDropdown />
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarNext>
    );
  }
}

export default Toolbar;
