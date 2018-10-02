import * as React from 'react';
import { Sort, ToolbarRightContent } from 'patternfly-react';

import { StatefulFilters } from '../../components/Filters/StatefulFilters';
import { ListPage } from '../../components/ListPage/ListPage';
import Refresh from '../../components/Refresh/Refresh';
import { ToolbarDropdown } from '../../components/ToolbarDropdown/ToolbarDropdown';
import { config } from '../../config';

import { FiltersAndSorts } from './FiltersAndSorts';
import { SortField } from '../../types/SortFilters';
import NamespaceInfo from './NamespaceInfo';

type Props = {
  pageHooks: ListPage.Hooks;
  onRefresh: () => void;
  onError: (msg: string) => void;
  sort: (sortField: SortField<NamespaceInfo>, isAscending: boolean) => void;
};

type State = {
  sortField: SortField<NamespaceInfo>;
  isSortAscending: boolean;
  duration: number;
  pollInterval: number;
};

const DURATIONS = config().toolbar.intervalDuration;

class OverviewToolbar extends React.Component<Props, State> {
  static findSortField(id?: string): SortField<NamespaceInfo> {
    if (id) {
      const field = FiltersAndSorts.sortFields.find(sortField => sortField.param === id);
      return field || FiltersAndSorts.sortFields[0];
    }
    return FiltersAndSorts.sortFields[0];
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      sortField: OverviewToolbar.findSortField(this.props.pageHooks.currentSortFieldId()),
      isSortAscending: this.props.pageHooks.isCurrentSortAscending(),
      duration: this.props.pageHooks.currentDuration(),
      pollInterval: this.props.pageHooks.currentPollInterval()
    };
  }

  componentDidUpdate() {
    const urlSortField = OverviewToolbar.findSortField(this.props.pageHooks.currentSortFieldId());
    const urlIsSortAscending = this.props.pageHooks.isCurrentSortAscending();
    const urlDuration = this.props.pageHooks.currentDuration();
    const urlPollInterval = this.props.pageHooks.currentPollInterval();
    if (!this.paramsAreSynced(urlSortField, urlIsSortAscending, urlDuration, urlPollInterval)) {
      this.setState({
        sortField: urlSortField,
        isSortAscending: urlIsSortAscending,
        duration: urlDuration,
        pollInterval: urlPollInterval
      });
      this.props.onRefresh();
    }
  }

  paramsAreSynced(
    urlSortField: SortField<NamespaceInfo>,
    urlIsSortAscending: boolean,
    urlDuration: number,
    urlPollInterval: number
  ) {
    return (
      urlIsSortAscending === this.state.isSortAscending &&
      urlSortField.title === this.state.sortField.title &&
      urlDuration === this.state.duration &&
      urlPollInterval === this.state.pollInterval
    );
  }

  updateSortField = (sortField: SortField<NamespaceInfo>) => {
    this.props.sort(sortField, this.state.isSortAscending);
    this.props.pageHooks.onParamChange([{ name: 'sort', value: sortField.param }]);
    this.setState({ sortField: sortField });
  };

  updateSortDirection = () => {
    const newDir = !this.state.isSortAscending;
    this.props.sort(this.state.sortField, newDir);
    this.props.pageHooks.onParamChange([{ name: 'direction', value: newDir ? 'asc' : 'desc' }]);
    this.setState({ isSortAscending: newDir });
  };

  updateDuration = (duration: number) => {
    this.props.pageHooks.onParamChange([{ name: 'duration', value: String(duration) }]);
    this.setState({ duration: duration });
  };

  updatePollInterval = (pollInterval: number) => {
    this.props.pageHooks.onParamChange([{ name: 'pi', value: String(pollInterval) }]);
    this.setState({ pollInterval: pollInterval });
  };

  render() {
    return (
      <StatefulFilters
        initialFilters={FiltersAndSorts.availableFilters}
        pageHooks={this.props.pageHooks}
        onFilterChange={this.props.onRefresh}
      >
        <Sort>
          <Sort.TypeSelector
            sortTypes={FiltersAndSorts.sortFields}
            currentSortType={this.state.sortField}
            onSortTypeSelected={this.updateSortField}
          />
          <Sort.DirectionSelector
            isNumeric={false}
            isAscending={this.state.isSortAscending}
            onClick={this.updateSortDirection}
          />
        </Sort>
        <ToolbarDropdown
          id="overview-duration"
          disabled={false}
          handleSelect={this.updateDuration}
          nameDropdown="Displaying"
          value={this.state.duration}
          label={DURATIONS[this.state.duration]}
          options={DURATIONS}
        />
        <ToolbarRightContent>
          <Refresh
            id="overview-refresh"
            handleRefresh={this.props.onRefresh}
            onSelect={this.updatePollInterval}
            pollInterval={this.state.pollInterval}
          />
        </ToolbarRightContent>
      </StatefulFilters>
    );
  }
}

export default OverviewToolbar;
