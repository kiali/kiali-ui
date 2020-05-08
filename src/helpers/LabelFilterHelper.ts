import { AppListItem } from '../types/AppList';
import { WorkloadListItem } from '../types/Workload';
import { ServiceListItem } from '../types/ServiceList';

type itemsType = AppListItem | ServiceListItem | WorkloadListItem;

const filterLabelByOp = (labels: { [key: string]: string }, filters: string[], op: string = 'or'): boolean => {
  let filterOkForLabel: boolean = false;
  // keys => List of filters with only Label Presence
  // keyValues => List of filters with Label and value
  /*
    TS Error but this works...
  */
  // const [keys, keyValues] = filters.reduce(([p, f], e) => (!e.includes(':') ? [[...p, e], f] : [p, [...f, e]]), [[], []]);
  const keys = filters.filter(f => !f.includes(':'));
  const keyValues = filters.filter(f => f.includes(':'));

  // Get all keys of labels
  const labelKeys = Object.keys(labels);
  // Case OR operation
  if (op === 'or') {
    // Check presence label
    filterOkForLabel = labelKeys.filter(label => keys.map(key => label.startsWith(key))).length > 0;
    if (filterOkForLabel) {
      return true;
    }
    // Check key and value
    keyValues.map(filter => {
      const [key, value] = filter.split(':');
      // Check if multiple values
      value.split(',').map(v => {
        if (key in labels && !filterOkForLabel) {
          // Split label values for serviceList Case where we can have multiple values for a label
          filterOkForLabel = labels[key]
            .trim()
            .split(',')
            .some(labelValue => labelValue.trim().startsWith(v.trim()));
        }
        return undefined;
      });
      return undefined;
    });
    return filterOkForLabel;
  }

  // Case AND operation

  // We expect this label is ok for the filters with And Operation
  filterOkForLabel = true;
  // Start check label presence
  keys.map(k => {
    if (!labelKeys.includes(k) && filterOkForLabel) {
      filterOkForLabel = false;
    }
    return undefined;
  });

  // If label presence is validated we continue checking with key,value
  if (filterOkForLabel) {
    keyValues.map(filter => {
      const [key, value] = filter.split(':');
      if (key in labels && filterOkForLabel) {
        // We need to check if some value of filter match
        value.split(',').map(val => {
          // Split label values for serviceList Case where we can have multiple values for a label
          if (!labels[key].split(',').some(labelVal => labelVal.trim().startsWith(val.trim()))) {
            filterOkForLabel = false;
          }
          return undefined;
        });
      } else {
        // The key is not in the labels so not match AND operation

        filterOkForLabel = false;
      }
      return undefined;
    });
  }

  return filterOkForLabel;
};

export const filterByLabel = (items: itemsType[], filter: string[], op: string = 'or'): itemsType[] => {
  let result: itemsType[] = [];
  filter.length === 0
    ? (result = items)
    : items.map(item => {
        if (filterLabelByOp(item.labels, filter, op)) {
          result = result.concat(item);
        }
        return undefined;
      });
  return result;
};
