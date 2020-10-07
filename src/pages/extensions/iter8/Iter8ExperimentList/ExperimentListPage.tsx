import * as React from 'react';
import { RenderContent } from 'components/Nav/Page';
import ExperimentListContainer from './ExperimentListContainer';
import * as ExpListFilters from './FiltersAndSorts';
import { currentSortField, isCurrentSortAscending } from 'helpers/ListComponentHelper';

const ExperimentListPage: React.FunctionComponent = () => {
  return (
    <RenderContent>
      <ExperimentListContainer
        currentSortField={currentSortField(ExpListFilters.sortFields)}
        isSortAscending={isCurrentSortAscending()}
        activeNamespaces={[]}
      />
    </RenderContent>
  );
};

export default ExperimentListPage;
