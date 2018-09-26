import * as React from 'react';
import { Breadcrumb } from 'patternfly-react';
import { ListPage } from '../../components/ListPage/ListPage';
import AppListComponent from './AppListComponent';
import { AppListFilters } from './FiltersAndSorts';

type AppListState = {};

type AppListProps = {
  // none yet
};

class AppListPage extends ListPage.Component<AppListProps, AppListState> {
  sortFields() {
    return AppListFilters.sortFields;
  }

  render() {
    return (
      <>
        <Breadcrumb title={true}>
          <Breadcrumb.Item active={true}>Applications</Breadcrumb.Item>
        </Breadcrumb>
        <AppListComponent
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

export default AppListPage;
