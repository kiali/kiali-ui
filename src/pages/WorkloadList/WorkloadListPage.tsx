import * as React from 'react';
import { RenderContent } from '../../components/Nav/Page';
import WorkloadListContainer from './WorkloadListComponent';
import * as WorkloadListFilters from './FiltersAndSorts';
import { currentSortField, isCurrentSortAscending } from 'helpers/ListComponentHelper';

const WorkloadListPage: React.FunctionComponent = () => {
  return (
    <RenderContent>
      <WorkloadListContainer
        currentSortField={currentSortField(WorkloadListFilters.sortFields)}
        isSortAscending={isCurrentSortAscending()}
      />
    </RenderContent>
  );
};

export default WorkloadListPage;
