import * as React from 'react';
import { RenderContent } from '../../../../components/Nav/Page';
import { Title, Toolbar, ToolbarSection } from '@patternfly/react-core';
import { style } from 'typestyle';
import { PfColors } from '../../../../components/Pf/PfColors';
import { sortable, SortByDirection, Table, TableBody, TableHeader, ISortBy, IRow } from '@patternfly/react-table';
import RefreshButtonContainer from '../../../../components/Refresh/RefreshButton';
import * as API from '../../../../services/Api';
import * as AlertUtils from '../../../../utils/AlertUtils';
import { ThreeScaleHandler } from '../../../../types/ThreeScale';

const containerPadding = style({ padding: '20px 20px 20px 20px' });
const containerWhite = style({ backgroundColor: PfColors.White });
const rightToolbar = style({ marginLeft: 'auto' });

// Used only when there is no namespace selector, otherwise use the SecondaryMasthead component
const pageTitle = (
  <div className={`${containerPadding} ${containerWhite}`}>
    <Title headingLevel="h1" size="4xl" style={{ margin: '20px 0 0' }}>
      3scale Handlers
    </Title>
  </div>
);

// This is a simplified toolbar only using a refresh button, other pages build a Filter/Sorting toolbar
const refreshToolbar = (refresh: () => void) => {
  return (
    <Toolbar className="pf-l-toolbar pf-u-justify-content-space-between pf-u-mx-xl pf-u-my-md">
      <ToolbarSection aria-label="ToolbarSection">
        <Toolbar className={rightToolbar}>
          <RefreshButtonContainer key={'Refresh'} handleRefresh={refresh} />
        </Toolbar>
      </ToolbarSection>
    </Toolbar>
  );
};

interface Props {}
interface State {
  handlers: ThreeScaleHandler[];
  sortBy: ISortBy;
}

const columns = [
  {
    title: 'Handler Name',
    transforms: [sortable]
  },
  {
    title: 'Service Id',
    transforms: [sortable]
  },
  {
    title: 'System Url',
    transforms: [sortable]
  }
];

class ThreeScaleHandlerListPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      handlers: [],
      sortBy: {}
    };
  }

  onSort = (_event, index, direction) => {
    const sortedHandlers = this.state.handlers.sort((a, b) => {
      switch (index) {
        case 0:
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        case 1:
          return a.serviceId < b.serviceId ? -1 : a.serviceId > b.serviceId ? 1 : 0;
        case 2:
          return a.systemUrl < b.systemUrl ? -1 : a.systemUrl > b.systemUrl ? 1 : 0;
      }
      return 0;
    });
    this.setState({
      handlers: direction === SortByDirection.asc ? sortedHandlers : sortedHandlers.reverse(),
      sortBy: {
        index,
        direction
      }
    });
  };

  updateListItems = () => {
    API.getThreeScaleHandlers()
      .then(results => {
        this.setState(prevState => {
          return {
            handlers: results.data,
            sortBy: prevState.sortBy
          };
        });
      })
      .catch(error => {
        AlertUtils.addError('Could not fetch ThreeScaleHandlers.', error);
      });
  };

  componentDidMount() {
    this.updateListItems();
  }

  rows = (): IRow[] => {
    return this.state.handlers.map(h => {
      return {
        cells: [<div>{h.name}</div>, <div>{h.serviceId}</div>, <div>{h.systemUrl}</div>]
      };
    });
  };

  render() {
    return (
      <>
        {pageTitle}
        <RenderContent>
          <div className={containerPadding}>
            {refreshToolbar(this.updateListItems)}
            <Table
              aria-label="Sortable Table"
              sortBy={this.state.sortBy}
              onSort={this.onSort}
              cells={columns}
              rows={this.rows()}
            >
              <TableHeader />
              <TableBody />
            </Table>
          </div>
        </RenderContent>
      </>
    );
  }
}

export default ThreeScaleHandlerListPage;
