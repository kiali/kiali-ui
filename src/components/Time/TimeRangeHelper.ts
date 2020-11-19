import { TimeRange } from 'types/Common';
import { HistoryManager, URLParam } from 'app/History';
import { defaultMetricsDuration } from '../Metrics/Helper';

export const retrieveTimeRange = (): TimeRange => {
  console.log('TODELETE retrieveTimeRange');
  const urlBounds = HistoryManager.getTimeBounds();
  const urlRangeDuration = HistoryManager.getRangeDuration();
  const tr: TimeRange = {
    from: urlBounds?.from,
    to: urlBounds?.to,
    rangeDuration: urlRangeDuration
  };
  return urlBounds === undefined && urlRangeDuration === undefined ? { rangeDuration: defaultMetricsDuration } : tr;
};

export const storeTimeRange = (range: TimeRange) => {
  console.log('TODELETE storeTimeRange');
  if (range.from) {
    HistoryManager.setParam(URLParam.FROM, String(range.from));
    if (range.to) {
      HistoryManager.setParam(URLParam.TO, String(range.to));
    } else {
      HistoryManager.deleteParam(URLParam.TO);
    }
    HistoryManager.deleteParam(URLParam.RANGE_DURATION);
    return;
  }
  if (range.rangeDuration) {
    HistoryManager.setParam(URLParam.RANGE_DURATION, String(range.rangeDuration));
    HistoryManager.deleteParam(URLParam.FROM);
    HistoryManager.deleteParam(URLParam.TO);
    return;
  }
};
