import { connect } from 'react-redux';

import { NamespaceActions } from '../actions/NamespaceAction';
import { NamespaceDropdown } from '../components/NamespaceDropdown';
import Namespace from '../types/Namespace';
import { KialiAppState } from '../store/Store';
import { Dispatch } from 'redux';
import { activeNamespacesSelector, namespaceItemsSelector } from '../store/Selectors';

const mapStateToProps = (state: KialiAppState) => {
  return {
    items: namespaceItemsSelector(state),
    activeNamespaces: activeNamespacesSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {
    refresh: () => {
      dispatch(NamespaceActions.fetchNamespacesIfNeeded());
    },
    onSelect: (namespace: Namespace) => {
      dispatch(NamespaceActions.toggleActiveNamespace(namespace));
    }
  };
};

const NamespaceDropdownContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NamespaceDropdown);
export default NamespaceDropdownContainer;
