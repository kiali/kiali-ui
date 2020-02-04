import * as React from 'react';
import { RenderContent } from '../../../../components/Nav/Page';
import {
  Badge,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  Title,
  Toolbar,
  ToolbarSection,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import { style } from 'typestyle';
import { PfColors } from '../../../../components/Pf/PfColors';
import { sortable, SortByDirection, Table, TableBody, TableHeader, ISortBy, IRow } from '@patternfly/react-table';
import RefreshButtonContainer from '../../../../components/Refresh/RefreshButton';
import * as API from '../../../../services/Api';
import * as AlertUtils from '../../../../utils/AlertUtils';
import { ThreeScaleHandler } from '../../../../types/ThreeScale';
import { Link } from 'react-router-dom';
import history from '../../../../app/History';

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

const actionsToolbar = (
  dropdownOpen: boolean,
  onSelect: () => void,
  onToggle: (toggle: boolean) => void,
  onClick: () => void
) => {
  return (
    <Dropdown
      id="actions"
      title="Actions"
      toggle={<DropdownToggle onToggle={onToggle}>Actions</DropdownToggle>}
      onSelect={onSelect}
      position={DropdownPosition.right}
      isOpen={dropdownOpen}
      dropdownItems={[
        <DropdownItem key="createIstioConfig" onClick={onClick}>
          Create New 3scale Handler
        </DropdownItem>
      ]}
    />
  );
};

// This is a simplified toolbar only using a refresh button, other pages build a Filter/Sorting toolbar
const toolbar = (
  onRefresh: () => void,
  dropdownOpen: boolean,
  onSelect: () => void,
  onToggle: (toggle: boolean) => void,
  onClick: () => void
) => {
  return (
    <Toolbar className="pf-l-toolbar pf-u-justify-content-space-between pf-u-mx-xl pf-u-my-md">
      <ToolbarSection aria-label="ToolbarSection">
        <Toolbar className={rightToolbar}>
          <RefreshButtonContainer key={'Refresh'} handleRefresh={onRefresh} />
          {actionsToolbar(dropdownOpen, onSelect, onToggle, onClick)}
        </Toolbar>
      </ToolbarSection>
    </Toolbar>
  );
};

interface Props {}
interface State {
  handlers: ThreeScaleHandler[];
  sortBy: ISortBy;
  dropdownOpen: boolean;
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
      sortBy: {},
      dropdownOpen: false
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
        cells: [
          <>
            <Tooltip
              key={'TooltipExtensionThreescaleHandlerName_' + h.name}
              position={TooltipPosition.top}
              content={<>3scale Istio Handler</>}
            >
              <Badge className={'virtualitem_badge_definition'}>3S</Badge>
            </Tooltip>
            <Link to={`/extensions/threescale/${h.name}`} key={'ExtensionThreescaleHandler_' + h.name}>
              {h.name}
            </Link>
          </>,
          <>
            <Tooltip
              key={'TooltipExtensionThreescaleHandlerServiceId_' + h.name}
              position={TooltipPosition.top}
              content={<>3scale Service Id</>}
            >
              <Badge className={'virtualitem_badge_definition'}>ID</Badge>
            </Tooltip>
            {h.serviceId}
          </>,
          <>
            <Tooltip
              key={'TooltipExtensionThreescaleHandlerSystemUrl_' + h.name}
              position={TooltipPosition.top}
              content={<>3scale System Url</>}
            >
              <Badge className={'virtualitem_badge_definition'}>URL</Badge>
            </Tooltip>
            {h.systemUrl}
          </>
        ]
      };
    });
  };

  render() {
    return (
      <>
        {pageTitle}
        <RenderContent>
          <div className={containerPadding}>
            {toolbar(
              this.updateListItems,
              this.state.dropdownOpen,
              () => {
                this.setState({
                  dropdownOpen: !this.state.dropdownOpen
                });
              },
              toggle => {
                this.setState({
                  dropdownOpen: toggle
                });
              },
              () => {
                // Invoke the history object to update and URL and start a routing
                history.push('/extensions/threescale/new');
              }
            )}
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
