import { KialiAppState } from '../store/Store';
import { connect } from 'react-redux';
import HelpDropdown from '../components/Nav/HelpDropdown';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppAction } from '../actions/KialiAppAction';
import HelpDropdownThunkActions from '../actions/HelpDropdownThunkActions';

const mapStateToProps = (state: KialiAppState) => ({
  status: state.statusState.status,
  components: state.statusState.components,
  warningMessages: state.statusState.warningMessages
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  refresh: () => dispatch(HelpDropdownThunkActions.refresh())
});

const HelpDropdownConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(HelpDropdown);
export default HelpDropdownConnected;
