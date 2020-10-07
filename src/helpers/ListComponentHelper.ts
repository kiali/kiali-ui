import { URLParam, HistoryManager } from 'app/History';
import { config } from 'config';
import { SortField } from 'types/SortFilters';

export interface ListComponentProps<R> {
  currentSortField: SortField<R>;
  isSortAscending: boolean;
}

export interface ListComponentState<R> {
  listItems: R[];
  currentSortField: SortField<R>;
  isSortAscending: boolean;
}

export const perPageOptions: number[] = [5, 10, 15];
const defaultDuration = 600;
const defaultRefreshInterval = config.toolbar.defaultRefreshInterval;

export const isCurrentSortAscending = (): boolean => {
  return (HistoryManager.getParam(URLParam.DIRECTION) || 'asc') === 'asc';
};

export const currentDuration = (): number => {
  return HistoryManager.getDuration() || defaultDuration;
};

export const currentRefreshInterval = (): number => {
  const refreshInterval = HistoryManager.getNumericParam(URLParam.REFRESH_INTERVAL);
  if (refreshInterval === undefined) {
    return defaultRefreshInterval;
  }
  return refreshInterval;
};

export const currentSortField = <T>(sortFields: SortField<T>[]): SortField<T> => {
  const queriedSortedField = HistoryManager.getParam(URLParam.SORT) || sortFields[0].param;
  return (
    sortFields.find(sortField => {
      return sortField.param === queriedSortedField;
    }) || sortFields[0]
  );
};
