import { connect } from 'react-redux';

import { NamespaceActions } from '../actions/NamespaceAction';
import { NamespaceDropdown } from '../components/NamespaceDropdown';
import Namespace from '../types/Namespace';
import { KialiAppState } from '../store/Store';

const mapStateToProps = (state: KialiAppState) => {
  return {
    items: state.namespaceState.items,
    activeNamespace: state.namespaceState.activeNamespace
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    refresh: () => {
      dispatch(NamespaceActions.fetchNamespacesIfNeeded());
    },
    onSelect: (namespace: Namespace) => {
      dispatch(NamespaceActions.setActiveNamespace(namespace));
    }
  };
};

const NamespaceDropdownContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NamespaceDropdown);
export default NamespaceDropdownContainer;
