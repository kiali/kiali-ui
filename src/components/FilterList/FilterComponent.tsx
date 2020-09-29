import * as React from 'react';
import { AxiosError } from 'axios';
import * as FilterHelper from './FilterHelper';
import { SortField } from '../../types/SortFilters';
import * as API from '../../services/Api';
import { HistoryManager, URLParam } from '../../app/History';

export interface Props<R> {
  currentSortField: SortField<R>;
  isSortAscending: boolean;
}

export interface State<R> {
  listItems: R[];
  currentSortField: SortField<R>;
  isSortAscending: boolean;
}

export abstract class Component<P extends Props<R>, S extends State<R>, R> extends React.Component<P, S> {
  abstract sortItemList(listItems: R[], sortField: SortField<R>, isAscending: boolean): Promise<R[]>;
  abstract updateListItems(resetPagination?: boolean): void;

  constructor(props: P) {
    super(props);

    this.updateListItems = this.updateListItems.bind(this);
    this.sortItemList = this.sortItemList.bind(this);
  }

  onFilterChange = () => {
    // Resetting pagination when filters change
    this.updateListItems(true);
  };

  handleError = (error: string) => {
    FilterHelper.handleError(error);
  };

  handleAxiosError(message: string, error: AxiosError) {
    const errMsg = `${message}: ${API.getErrorString(error)}`;
    // TODO: Do we really need this console logging?
    console.error(errMsg);
    this.handleError(errMsg);
  }

  updateSort = (sortField: SortField<R>, isSortAscending: boolean) => {
    this.sortItemList(this.state.listItems, sortField, isSortAscending).then(sorted => {
      this.setState({
        currentSortField: sortField,
        isSortAscending: isSortAscending,
        listItems: sorted
      });
      HistoryManager.setParam(URLParam.SORT, sortField.param);
      HistoryManager.setParam(URLParam.DIRECTION, isSortAscending ? 'asc' : 'desc');
    });
  };
}
