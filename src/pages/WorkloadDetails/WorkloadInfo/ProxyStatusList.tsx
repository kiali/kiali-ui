import * as React from 'react';
import { isProxyStatusComponentSynced, isProxyStatusSynced, ProxyStatus } from '../../../types/Health';
import { Stack, StackItem } from '@patternfly/react-core';
import { style } from 'typestyle';
import { PfColors } from '../../../components/Pf/PfColors';

type Props = {
  status?: ProxyStatus;
};

const smallStyle = style({ fontSize: '70%', color: PfColors.White });
const colorStyle = style({ fontSize: '1.1rem', color: PfColors.White });

class ProxyStatusList extends React.Component<Props> {
  statusList = () => {
    if (!this.props.status) {
      return [];
    }

    return [
      { c: 'CDS', s: this.props.status.CDS },
      { c: 'EDS', s: this.props.status.EDS },
      { c: 'LDS', s: this.props.status.LDS },
      { c: 'RDS', s: this.props.status.RDS }
    ].map((value: { c: string; s: string }, i: number) => {
      if (!isProxyStatusComponentSynced(value.s)) {
        const status = value.s ? value.s : '-';
        return (
          <StackItem key={'proxy-status-' + i} className={smallStyle}>
            {value.c + ': ' + status}
          </StackItem>
        );
      } else {
        return null;
      }
    });
  };

  render() {
    if (this.props.status && !isProxyStatusSynced(this.props.status)) {
      return (
        <Stack>
          <StackItem className={colorStyle}>Istio Proxy Status</StackItem>
          {this.statusList()}
        </Stack>
      );
    } else {
      return null;
    }
  }
}

export default ProxyStatusList;
