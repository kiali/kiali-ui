import * as React from 'react';
import IstioConfigListComponent, { sortFields } from './IstioConfigListComponent';
import { Breadcrumb } from 'patternfly-react';
import { ListPage } from '../../components/ListPage/ListPage';

type IstioConfigListState = {};

type IstioConfigListProps = {
  // none yet
};

class IstioConfigListPage extends ListPage.Component<IstioConfigListProps, IstioConfigListState> {
  sortFields() {
    return sortFields;
  }

  render() {
    return (
      <>
        <Breadcrumb title={true}>
          <Breadcrumb.Item active={true}>Istio Config</Breadcrumb.Item>
        </Breadcrumb>
        <IstioConfigListComponent
          pageHooks={this}
          pagination={this.currentPagination()}
          currentSortField={this.currentSortField()}
          isSortAscending={this.isCurrentSortAscending()}
        />
      </>
    );
  }
}

export default IstioConfigListPage;
