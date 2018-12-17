import React from 'react';
import { Alert, Row, Col, Form, FormGroup, FormControl, Button, HelpBlock } from 'patternfly-react';

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
  pfNext: boolean;
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
    const { pfNext } = this.props;

    const login = (
      <div className={'login-pf-page'}>
        <div className={'container-fluid'}>
          <Row>
            <Col sm={8} smOffset={2} md={6} mdOffset={3} lg={6} lgOffset={3}>
              <header className={'login-pf-page-header'}>
                <img className={'login-pf-brand'} src={kialiTitle} alt={'logo'} />
              </header>
              <Row>
                <Col sm={10} smOffset={1} md={8} mdOffset={2} lg={8} lgOffset={2}>
                  <div className={'card-pf'}>
                    <header className={'login-pf-header'} />
                    {this.props.error && <Alert>{this.props.message}</Alert>}
                    <Form onSubmit={e => this.handleSubmit(e)} id={'kiali-login'}>
                      <FormGroup>
                        <FormControl
                          id="username"
                          type="text"
                          name="username"
                          onChange={this.handleChange}
                          placeholder={'Username'}
                          disabled={false}
                          required={true}
                          onKeyPress={this.handleKeyPress}
                        />
                        {this.props.logging && !this.state.username && <HelpBlock>Username is required</HelpBlock>}
                      </FormGroup>
                      <FormGroup>
                        <FormControl
                          type="password"
                          name="password"
                          onChange={this.handleChange}
                          placeholder={'Password'}
                          disabled={false}
                          required={true}
                          onKeyPress={this.handleKeyPress}
                        />
                        {this.props.logging && !this.state.password && <HelpBlock>Password is required</HelpBlock>}
                      </FormGroup>
                      <Button
                        type="submit"
                        onKeyPress={this.handleKeyPress}
                        className="btn btn-primary btn-block btn-lg"
                      >
                        Log In
                      </Button>
                    </Form>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
    );

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

    const loginNext = (
      <LoginNext
        footerListVariants="inline"
        brandImgSrc={kialiTitle}
        brandImgAlt="pf-logo"
        backgroundImgAlt="Images"
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

    return pfNext ? loginNext : login;
  }
}
