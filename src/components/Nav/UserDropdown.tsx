import * as React from 'react';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core/dist/js';
// import { SessionTimeout } from '../SessionTimeout/SessionTimeout';
import { config } from '../../config';
import { MILLISECONDS } from '../../types/Common';
import Timer = NodeJS.Timer;

type UserProps = {
  username: string;
  logout: () => void;
  extendSession: () => void;
  sessionTimeOut: number;
};

type UserState = {
  showSessionTimeOut: boolean;
  timeCountDownSeconds: number;
  checkSessionTimerId?: Timer;
  timeLeftTimerId?: Timer;
  isDropdownOpen: boolean;
};

class UserDropdown extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      showSessionTimeOut: false,
      timeCountDownSeconds: this.timeLeft() / MILLISECONDS,
      isDropdownOpen: false
    };
  }
  componentDidMount() {
    const checkSessionTimerId = setInterval(() => {
      this.checkSession();
    }, 3000);
    const timeLeftTimerId = setInterval(() => {
      this.setState({ timeCountDownSeconds: this.timeLeft() / MILLISECONDS });
    }, 1000);

    this.setState({
      checkSessionTimerId: checkSessionTimerId,
      timeLeftTimerId: timeLeftTimerId
    });
  }

  componentWillUnmount() {
    if (this.state.checkSessionTimerId) {
      clearInterval(this.state.checkSessionTimerId);
    }
    if (this.state.timeLeftTimerId) {
      clearInterval(this.state.timeLeftTimerId);
    }
  }

  timeLeft = (): number => {
    const nowDate = new Date().getTime();
    if (this.props.sessionTimeOut - nowDate < 1) {
      this.handleLogout();
    }
    return this.props.sessionTimeOut - nowDate;
  };

  checkSession = () => {
    if (this.timeLeft() < config().session.timeOutforWarningUser) {
      this.setState({ showSessionTimeOut: true });
    }
  };

  handleLogout() {
    this.props.logout();
    const el = document.documentElement;
    if (el) {
      el.className = 'login-pf';
    }
  }

  extendSession = () => {
    this.props.extendSession();
    this.setState({ showSessionTimeOut: false });
  };

  onDropdownToggle = isDropdownOpen => {
    this.setState({
      isDropdownOpen
    });
  };

  onDropdownSelect = event => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen
    });
  };

  render() {
    const { isDropdownOpen } = this.state;
    const userDropdownItems = (
      <DropdownItem key={'user_logout_option'} onClick={() => this.handleLogout()}>
        Logout
      </DropdownItem>
    );
    return (
      <Dropdown
        isPlain={true}
        position="right"
        onSelect={this.onDropdownSelect}
        isOpen={isDropdownOpen}
        toggle={<DropdownToggle onToggle={this.onDropdownToggle}>{this.props.username}</DropdownToggle>}
        dropdownItems={[userDropdownItems]}
      />
    );
  }
}

export default UserDropdown;
