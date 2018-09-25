import * as React from 'react';
import ServiceListComponent from './ServiceListComponent';
import { Breadcrumb } from 'patternfly-react';
import { ListPage } from '../../components/ListPage/ListPage';
import { ServiceListFilters } from './FiltersAndSorts';

type ServiceListState = {};

type ServiceListProps = {
  // none yet
};

class ServiceListPage extends ListPage.Component<ServiceListProps, ServiceListState> {
  currentSortField() {
    const queriedSortedField = this.getQueryParam('sort') || [ServiceListFilters.sortFields[0].param];
    return (
      ServiceListFilters.sortFields.find(sortField => {
        return sortField.param === queriedSortedField[0];
      }) || ServiceListFilters.sortFields[0]
    );
  }

  render() {
    return (
      <>
        <Breadcrumb title={true}>
          <Breadcrumb.Item active={true}>Services</Breadcrumb.Item>
        </Breadcrumb>
        <ServiceListComponent
          pageHooks={this}
          pagination={this.currentPagination()}
          currentSortField={this.currentSortField()}
          isSortAscending={this.isCurrentSortAscending()}
          rateInterval={this.currentDuration()}
        />
      </>
    );
  }
}

export default ServiceListPage;
