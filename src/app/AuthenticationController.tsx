import * as React from 'react';
import { connect } from 'react-redux';
import { GrafanaInfo, KialiAppState, LoginStatus, ServerConfig } from '../store/Store';
import * as API from '../services/Api';
import { ServerConfigActions } from '../actions/ServerConfigActions';
import { HelpDropdownActions } from '../actions/HelpDropdownActions';
import { JaegerActions } from '../actions/JaegerActions';
import { MessageCenterActions } from '../actions/MessageCenterActions';
import { MessageType } from '../types/MessageCenter';
import { KialiDispatch } from '../types/Redux';
import { StatusInfo } from '../types/AppConfigs';
import { bindActionCreators } from 'redux';
import { GrafanaActions } from '../actions/GrafanaActions';
import InitializingScreen from './InitializingScreen';
import { isKioskMode } from '../utils/SearchParamUtils';

interface AuthenticationFlowProps {
  authenticated: boolean;
  protectedAreaComponent: React.ReactNode;
  publicAreaComponent: React.ReactNode;
  setGrafanaInfo: (grafanaInfo: GrafanaInfo) => void;
  setServerConfig: (serverConfig: ServerConfig) => void;
  setServerStatus: (serverStatus: StatusInfo) => void;
}

interface AuthenticationFlowState {
  stage: 'login' | 'post-login' | 'logged-in';
}

class AuthenticationFlow extends React.Component<AuthenticationFlowProps, AuthenticationFlowState> {
  constructor(props: AuthenticationFlowProps) {
    super(props);
    this.state = {
      stage: this.props.authenticated ? 'post-login' : 'login'
    };
  }

  componentDidMount(): void {
    if (this.state.stage === 'post-login') {
      this.doPostLoginActions();
    }

    this.setDocLayout();
  }

  componentDidUpdate(prevProps: Readonly<AuthenticationFlowProps>, prevState: Readonly<AuthenticationFlowState>): void {
    if (!prevProps.authenticated && this.props.authenticated) {
      this.setState({ stage: 'post-login' });
      this.doPostLoginActions();
    } else if (prevProps.authenticated && !this.props.authenticated) {
      this.setState({ stage: 'login' });
    }

    this.setDocLayout();
  }

  render() {
    if (this.state.stage === 'logged-in') {
      return this.props.protectedAreaComponent;
    } else if (this.state.stage === 'post-login') {
      return <InitializingScreen />;
    } else {
      return this.props.publicAreaComponent;
    }
  }

  private doPostLoginActions = async () => {
    try {
      const configs = await Promise.all([API.getStatus(), API.getGrafanaInfo(), API.getServerConfig()]);

      this.props.setServerStatus(configs[0].data);
      this.props.setGrafanaInfo(configs[1].data);
      this.props.setServerConfig(configs[2].data);

      this.setState({ stage: 'logged-in' });
    } catch (err) {
      // Here, we should handle errors
      console.error(err);

      /* GrafanaThunkActions
      dispatch(
            MessageCenterActions.addMessage(
              API.getErrorMsg('Error fetching Grafana Info.', error),
              'default',
              MessageType.WARNING
            )
          );*/
      /* HelpDropDownActions
      dispatch(
            MessageCenterActions.addMessage(
              API.getErrorMsg('Error fetching status.', error),
              'default',
              MessageType.WARNING
            )
          );
       */
    }
  };

  private setDocLayout = () => {
    if (document.documentElement) {
      document.documentElement.className = this.state.stage === 'logged-in' ? 'layout-pf layout-pf-fixed' : 'login-pf';
      if (isKioskMode()) {
        document.documentElement.className += ' kiosk';
      }
    }
  };
}

const processServerStatus = (dispatch: KialiDispatch, serverStatus: StatusInfo) => {
  dispatch(
    HelpDropdownActions.statusRefresh(serverStatus.status, serverStatus.externalServices, serverStatus.warningMessages)
  );

  // Get the jaeger URL
  const hasJaeger = serverStatus.externalServices.filter(item => item['name'] === 'Jaeger');
  if (hasJaeger.length === 1 && hasJaeger[0].url) {
    dispatch(JaegerActions.setUrl(hasJaeger[0].url));
    // If same protocol enable integration
    if (hasJaeger[0].url.startsWith(window.location.protocol)) {
      dispatch(JaegerActions.setEnableIntegration(true));
    }
  }

  serverStatus.warningMessages.forEach(wMsg => {
    dispatch(MessageCenterActions.addMessage(wMsg, 'systemErrors', MessageType.WARNING));
  });
};

const mapStateToProps = (state: KialiAppState) => ({
  authenticated: state.authentication.status === LoginStatus.loggedIn
});

const mapDispatchToProps = (dispatch: KialiDispatch) => {
  return {
    setGrafanaInfo: bindActionCreators(GrafanaActions.setinfo, dispatch),
    setServerConfig: bindActionCreators(ServerConfigActions.setServerConfig, dispatch),
    setServerStatus: (serverStatus: StatusInfo) => processServerStatus(dispatch, serverStatus)
  };
};

const AuthenticationController = connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthenticationFlow);
export default AuthenticationController;
