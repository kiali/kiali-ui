import * as React from 'react';
import ServiceListContainer from '../../pages/ServiceList/ServiceListComponent';
import { RenderContent } from '../../components/Nav/Page';
import * as ServiceListFilters from './FiltersAndSorts';
import { currentSortField, isCurrentSortAscending } from 'helpers/ListComponentHelper';

const ServiceListPage: React.FunctionComponent = () => {
  return (
    <RenderContent>
      <ServiceListContainer
        currentSortField={currentSortField(ServiceListFilters.sortFields)}
        isSortAscending={isCurrentSortAscending()}
      />
    </RenderContent>
  );
};

export default ServiceListPage;
