import * as React from 'react';
import IstioConfigListComponent from './IstioConfigListComponent';
import { Breadcrumb } from 'patternfly-react';
import { ListPage } from '../../components/ListPage/ListPage';

type IstioConfigListState = {};

type IstioConfigListProps = {
  // none yet
};

class IstioConfigListPage extends ListPage.Component<IstioConfigListProps, IstioConfigListState> {
  render() {
    return (
      <>
        <Breadcrumb title={true}>
          <Breadcrumb.Item active={true}>Istio Config</Breadcrumb.Item>
        </Breadcrumb>
        <IstioConfigListComponent
          onError={this.handleError}
          onParamChange={this.onParamChange}
          onParamDelete={this.onParamDelete}
          queryParam={this.getQueryParam}
        />
      </>
    );
  }
}

export default IstioConfigListPage;
