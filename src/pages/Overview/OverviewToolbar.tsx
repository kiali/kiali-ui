import * as React from 'react';
import { Sort, ToolbarRightContent } from 'patternfly-react';

import { StatefulFilters } from '../../components/Filters/StatefulFilters';
import GraphRefresh from '../../components/GraphFilter/GraphRefresh';
import { ListPage } from '../../components/ListPage/ListPage';
import { ToolbarDropdown } from '../../components/ToolbarDropdown/ToolbarDropdown';
import { config } from '../../config';

import { FiltersAndSorts } from './FiltersAndSorts';

type Props = {
  pageHooks: ListPage.Hooks;
  onRefresh: () => void;
  onError: (msg: string) => void;
  sort: (sortField: FiltersAndSorts.SortField, isAscending: boolean) => void;
};

type State = {
  sortField: FiltersAndSorts.SortField;
  isSortAscending: boolean;
  duration: number;
  pollInterval: number;
  pollerRef?: number;
};

class OverviewToolbar extends React.Component<Props, State> {
  static readonly DURATIONS = config().toolbar.intervalDuration;
  static readonly POLL_INTERVALS = config().toolbar.pollInterval;

  constructor(props: Props) {
    super(props);
    const pollInterval = this.props.pageHooks.currentPollInterval();
    let pollerRef: number | undefined = undefined;
    if (pollInterval > 0) {
      pollerRef = window.setInterval(this.props.onRefresh, pollInterval);
    }
    this.state = {
      sortField: this.currentSortField(),
      isSortAscending: this.props.pageHooks.isCurrentSortAscending(),
      duration: this.props.pageHooks.currentDuration(),
      pollInterval: pollInterval,
      pollerRef: pollerRef
    };
  }

  componentDidUpdate() {
    const urlSortField = this.currentSortField();
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

  componentWillUnmount() {
    if (this.state.pollerRef) {
      clearInterval(this.state.pollerRef);
    }
  }

  paramsAreSynced(
    urlSortField: FiltersAndSorts.SortField,
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

  currentSortField(): FiltersAndSorts.SortField {
    const fromURL = this.props.pageHooks.getSingleQueryParam('sort');
    if (fromURL) {
      const field = FiltersAndSorts.sortFields.find(sortField => sortField.param === fromURL);
      return field || FiltersAndSorts.sortFields[0];
    }
    return FiltersAndSorts.sortFields[0];
  }

  updateSortField = (sortField: FiltersAndSorts.SortField) => {
    this.props.sort(sortField, this.state.isSortAscending);
    this.setState({ sortField: sortField }, () => {
      this.props.pageHooks.onParamChange([{ name: 'sort', value: sortField.param }]);
    });
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
    let newRefInterval: number | undefined = undefined;
    if (this.state.pollerRef) {
      clearInterval(this.state.pollerRef);
    }
    if (pollInterval > 0) {
      newRefInterval = window.setInterval(this.props.onRefresh, pollInterval);
    }
    this.setState({ pollerRef: newRefInterval, pollInterval: pollInterval });
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
          label={OverviewToolbar.DURATIONS[this.state.duration]}
          options={OverviewToolbar.DURATIONS}
        />
        <ToolbarRightContent>
          <GraphRefresh
            id="overview-refresh"
            handleRefresh={this.props.onRefresh}
            onSelect={this.updatePollInterval}
            selected={this.state.pollInterval}
            options={OverviewToolbar.POLL_INTERVALS}
          />
        </ToolbarRightContent>
      </StatefulFilters>
    );
  }
}

export default OverviewToolbar;
