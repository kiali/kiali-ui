import * as React from 'react';
import { Dropdown, Icon, MenuItem } from 'patternfly-react';
// import * as UserAction from '../../actions/UserAction';

type UserProps = {
  dispatch?: any;
};

class UserDropdown extends React.Component<UserProps, {}> {
  userLogout = () => {
    // const { dispatch } = this.props;
    sessionStorage.removeItem('user');
    // dispatch(UserAction.logout());
    window.location.reload();
  };
  render() {
    return (
      <>
        <Dropdown componentClass="li" id="user">
          <Dropdown.Toggle useAnchor={true} className="nav-item-iconic">
            <Icon type="pf" name="user" /> {sessionStorage.getItem('user')}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <MenuItem id="usermenu_logout" onClick={() => this.userLogout()}>
              <Icon type="pf" name="key" /> Logout
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}

export default UserDropdown;
