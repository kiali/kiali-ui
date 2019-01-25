import { KialiAppState } from '../store/Store';
import { connect } from 'react-redux';
import GlobalMTLSStatus from '../components/Nav/GlobalMTLSStatus';

const mapStateToProps = (state: KialiAppState) => ({
  status: state.statusState.status,
  components: state.statusState.components,
  warningMessages: state.statusState.warningMessages
});

const GlobalMTLSSatutsConnected = connect(mapStateToProps)(GlobalMTLSStatus);
export default GlobalMTLSSatutsConnected;
