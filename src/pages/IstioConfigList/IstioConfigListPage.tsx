import { currentSortField, isCurrentSortAscending } from 'helpers/ListComponentHelper';
import * as React from 'react';
import { RenderContent } from '../../components/Nav/Page';
import * as IstioConfigListFilters from './FiltersAndSorts';
import IstioConfigListContainer from './IstioConfigListComponent';

const IstioConfigListPage: React.FunctionComponent = () => {
  return (
    <RenderContent>
      <IstioConfigListContainer
        currentSortField={currentSortField(IstioConfigListFilters.sortFields)}
        isSortAscending={isCurrentSortAscending()}
      />
    </RenderContent>
  );
};

export default IstioConfigListPage;
