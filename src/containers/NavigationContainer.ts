import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import Navigation from '../components/Nav/Navigation';
import { KialiAppState, Component } from '../store/Store';
import { KialiAppAction } from '../actions/KialiAppAction';
import LoginThunkActions from '../actions/LoginThunkActions';
import UserSettingsThunkActions from '../actions/UserSettingsThunkActions';
import { UserSettingsActions } from '../actions/UserSettingsActions';

const getJaegerUrl = (components: Component[]) => {
  const jaegerinfo = components.find(comp => comp.name === 'Jaeger');
  return jaegerinfo ? jaegerinfo.url : '';
};

const mapStateToProps = (state: KialiAppState) => ({
  authenticated: state.authentication.logged,
  navCollapsed: state.userSettings.interface.navCollapse,
  jaegerUrl: getJaegerUrl(state.statusState.components)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  checkCredentials: () => dispatch(LoginThunkActions.checkCredentials()),
  setNavCollapsed: (collapse: boolean) => dispatch(UserSettingsThunkActions.setNavCollapsed(!collapse)),
  setPfNext: (enable: boolean) => dispatch(UserSettingsActions.setPfNext(enable))
});

const NavigationContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);
export default NavigationContainer;
