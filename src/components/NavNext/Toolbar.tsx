import * as React from 'react';

import { Toolbar as ToolbarNext, ToolbarGroup, ToolbarItem } from '@patternfly/react-core/dist/js/layouts/Toolbar';
import { BellIcon, HelpIcon, UserIcon } from '@patternfly/react-icons/';
import UserDropdown from '../../containers/UserDropdownContainerNext';

class Toolbar extends React.Component {
  render() {
    return (
      <ToolbarNext>
        <ToolbarGroup>
          <ToolbarItem style={{ marginRight: '10px' }}>
            <BellIcon />
          </ToolbarItem>
          <ToolbarItem style={{ marginRight: '10px' }}>
            <HelpIcon />
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
