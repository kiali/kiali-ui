import * as React from 'react';
import { ProxyStatus, Status } from 'types/Health';
import ProxyStatusList from './ProxyStatusList';

type Size = 'sm' | 'md' | 'lg' | 'xl';

export const createIcon = (status: Status, size?: Size) => {
  return React.createElement(status.icon, { color: status.color, size: size, className: status.class });
};

export const createProxyStatusList = (workloadName: string, statusList: ProxyStatus[]) => {
  return React.createElement(ProxyStatusList, { workloadName: workloadName, statuses: statusList });
};
