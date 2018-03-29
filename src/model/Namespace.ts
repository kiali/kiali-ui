import { observable, action, configure } from 'mobx';

import * as Api from '../services/Api';
import Namespace from '../types/Namespace';

configure({ enforceActions: true as boolean });

class NamespaceStore {
  @observable namespaceList: Namespace[];
  @observable isError: boolean;
  @observable errorMessage: string;

  fetchNamespacesFromBackend = () => {
    Api.GetNamespaces()
      .then(
        action(namespacesResponse => {
          this.namespaceList = namespacesResponse['data'];
          this.isError = false;
        })
      )
      .catch(
        action(namespacesError => {
          // TODO: use data in namespacesError
          this.isError = true;
          this.errorMessage = 'Error fetching namespace list.';
          console.error('Api.GetNamespaces() error', JSON.stringify(namespacesError));
        })
      );
  };

  constructor() {
    this.namespaceList = [];
    this.isError = false;
    this.errorMessage = '';
  }
}

// instantiate a global instance
const namespaceStore = new NamespaceStore();
export { namespaceStore };
