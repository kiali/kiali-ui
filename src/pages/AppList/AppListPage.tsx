import { currentSortField, isCurrentSortAscending } from 'helpers/ListComponentHelper';
import * as React from 'react';
import { RenderContent } from '../../components/Nav/Page';
import AppListContainer from './AppListComponent';
import * as AppListFilters from './FiltersAndSorts';

const AppListPage: React.FunctionComponent = () => {
  return (
    <RenderContent>
      <AppListContainer
        currentSortField={currentSortField(AppListFilters.sortFields)}
        isSortAscending={isCurrentSortAscending()}
      />
    </RenderContent>
  );
};

export default AppListPage;
