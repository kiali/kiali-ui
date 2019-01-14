import React from 'react';

// PF 4 Next
import {
  LoginForm,
  LoginPage as LoginNext,
  LoginFooterItem
} from '@patternfly/react-core/dist/js/components/LoginPage';
import { ListItem } from '@patternfly/react-core/dist/js/components/List';
import { Alert as AlertNext } from '@patternfly/react-core/dist/js/components/Alert';

import { KEY_CODES } from '../../types/Common';

const kialiTitle = require('../../assets/img/logo-login.svg');

type LoginProps = {
  logging: boolean;
  error: any;
  message: string;
  authenticate: (username: string, password: string) => void;
};

type LoginState = {
  username: string;
  password: string;
};

export default class LoginPage extends React.Component<LoginProps, LoginState> {
  static contextTypes = {
    store: () => null
  };
  constructor(props: LoginProps) {
    super(props);

    // reset login status
    // this.props.dispatch(UserAction.logout());

    this.state = {
      username: '',
      password: ''
    };
  }

  componentDidMount() {
    const el = document.documentElement;
    if (el) {
      el.className = 'login-pf';
    }
  }

  handleChange = (e: any) => {
    const { name, value } = e.target;
    this.setState({ [name]: value } as Pick<LoginState, keyof LoginState>);
  };

  handleSubmit = (e: any) => {
    e.preventDefault();
    if (this.state.username.length > 0 && this.state.password.length > 0 && this.props.authenticate) {
      this.props.authenticate(this.state.username, this.state.password);
    }
  };

  handleKeyPress = (e: any) => {
    if (e.charCode === KEY_CODES.ENTER_KEY) {
      this.handleSubmit(e);
    }
  };

  render() {
    const loginForm = (
      <LoginForm
        usernameLabel="Username"
        usernameValue={this.state.username}
        onChangeUsername={(e: any) => {
          this.setState({ username: e });
        }}
        usernameHelperTextInvalid="Unknown Username"
        isValidUsername={true}
        passwordLabel="Password"
        passwordValue={this.state.password}
        onChangePassword={(e: any) => this.setState({ password: e })}
        passwordHelperTextInvalid="Password Invalid"
        isValidPassword={true}
        rememberMeAriaLabel="Remember me Checkbox"
        onLoginButtonClick={(e: any) => this.handleSubmit(e)}
        style={{ marginTop: '10px' }}
      />
    );
    const listItem = (
      <React.Fragment>
        <ListItem>
          <LoginFooterItem href="https://www.kiali.io/">Documentation</LoginFooterItem>
        </ListItem>
        <ListItem>
          <LoginFooterItem href="https://github.com/kiali/kiali">Contribute</LoginFooterItem>
        </ListItem>
      </React.Fragment>
    );

    return (
      <LoginNext
        footerListVariants="inline"
        backgroundImgSrc={'http://patternfly-react.surge.sh/assets/images/pfbg_1200.jpg'}
        backgroundImgAlt="Images"
        brandImgSrc={kialiTitle}
        footerListItems={listItem}
        textContent="Service Mesh Observability."
        loginTitle="Log in Kiali"
      >
        {this.props.error && (
          <AlertNext variant={'warning'} title="Warning login kiali">
            {this.props.message}
          </AlertNext>
        )}
        {loginForm}
      </LoginNext>
    );
  }
}
