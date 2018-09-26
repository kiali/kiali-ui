import * as React from 'react';
import { AxiosError } from 'axios';
import { ListPage } from './ListPage';
import { SortField } from '../../types/SortFilters';
import { Pagination } from '../../types/Pagination';

export namespace ListComponent {
  type ListComponentProps<R> = {
    pageHooks: ListPage.Hooks;
    pagination: Pagination;
    currentSortField: SortField<R>;
    isSortAscending: boolean;
    rateInterval?: number;
  };

  type ListComponentState<R> = {
    listItems: R[];
    pagination: Pagination;
    currentSortField: SortField<R>;
    isSortAscending: boolean;
    rateInterval?: number;
  };

  export class Component<P extends ListComponentProps<R>, S extends ListComponentState<R>, R> extends React.Component<
    P,
    S
  > {
    onFilterChange = () => {
      // Resetting pagination when filters change
      this.props.pageHooks.onParamChange([{ name: 'page', value: '' }]);
      this.updateListItems(true);
    };

    handleError = (error: string) => {
      this.props.pageHooks.handleError(error);
    };

    handleAxiosError(message: string, error: AxiosError) {
      const errMsg = API.getErrorMsg(message, error);
      console.error(errMsg);
      this.handleError(errMsg);
    }

    pageSet = (page: number) => {
      this.setState(prevState => {
        return {
          listItems: prevState.listItems,
          pagination: {
            page: page,
            perPage: prevState.pagination.perPage,
            perPageOptions: ListPage.perPageOptions
          }
        };
      });

      this.props.pageHooks.onParamChange([{ name: 'page', value: String(page) }]);
    };

    perPageSelect = (perPage: number) => {
      this.setState(prevState => {
        return {
          listItems: prevState.listItems,
          pagination: {
            page: 1,
            perPage: perPage,
            perPageOptions: ListPage.perPageOptions
          }
        };
      });

      this.props.pageHooks.onParamChange([{ name: 'page', value: '1' }, { name: 'perPage', value: String(perPage) }]);
    };

    updateSortField = (sortField: SortField<R>) => {
      this.sortItemListMethod()(this.state.listItems, sortField, this.state.isSortAscending).then(sorted => {
        this.setState({
          currentSortField: sortField,
          listItems: sorted
        });

        this.props.pageHooks.onParamChange([{ name: 'sort', value: sortField.param }]);
      });
    };

    updateSortDirection = () => {
      this.sortItemListMethod()(this.state.listItems, this.state.currentSortField, !this.state.isSortAscending).then(
        sorted => {
          this.setState({
            isSortAscending: !this.state.isSortAscending,
            listItems: sorted
          });

          this.props.pageHooks.onParamChange([
            { name: 'direction', value: this.state.isSortAscending ? 'asc' : 'desc' }
          ]);
        }
      );
    };

    rateIntervalChangedHandler = (key: number) => {
      this.setState({ rateInterval: key });
      this.props.pageHooks.onParamChange([{ name: 'rate', value: String(key) }]);
      this.updateListItems();
    };

    sortItemListMethod() {
      const promises = new Array<R>();
      return (items: R[], sortField: SortField<R>, isAscending: boolean) => Promise.all(promises);
    }

    updateListItems(resetPagination?: boolean) {
      return;
    }
  }
}
