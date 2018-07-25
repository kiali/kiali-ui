import * as React from 'react';
import ServiceListComponent from './ServiceListComponent';
import { Breadcrumb } from 'patternfly-react';
import { ListPage } from '../../components/ListPage/ListPage';

type ServiceListState = {};

type ServiceListProps = {
  // none yet
};

class ServiceListPage extends ListPage.Component<ServiceListProps, ServiceListState> {
  render() {
    return (
      <>
        <Breadcrumb title={true}>
          <Breadcrumb.Item active={true}>Services</Breadcrumb.Item>
        </Breadcrumb>
        <ServiceListComponent
          onError={this.handleError}
          onParamChange={this.onParamChange}
          onParamDelete={this.onParamDelete}
          queryParam={this.getQueryParam}
        />
      </>
    );
  }
}

export default ServiceListPage;
