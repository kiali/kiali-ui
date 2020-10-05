import * as React from 'react';
import { DEGRADED, HEALTHY, ProxyStatus } from '../../../types/Health';
import { Stack, StackItem, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { style } from 'typestyle';
import { createIcon } from '../../../components/Health/Helper';
import { PfColors } from '../../../components/Pf/PfColors';

type Props = {
  status: ProxyStatus;
};

const smallStyle = style({ fontSize: '70%', color: PfColors.White });

class ProxyStatusList extends React.Component<Props> {
  isSynced = (): boolean => {
    return (
      this.isComponentSynced(this.props.status.CDS) &&
      this.isComponentSynced(this.props.status.EDS) &&
      this.isComponentSynced(this.props.status.LDS) &&
      this.isComponentSynced(this.props.status.RDS)
    );
  };

  isComponentSynced = (componentStatus: string): boolean => {
    return componentStatus === 'Synced';
  };

  statusList = () => {
    const statusItems = [
      { c: 'CDS', s: this.props.status.CDS },
      { c: 'EDS', s: this.props.status.EDS },
      { c: 'LDS', s: this.props.status.LDS },
      { c: 'RDS', s: this.props.status.RDS }
    ].map((value: { c: string; s: string }, i: number) => {
      if (!this.isComponentSynced(value.s)) {
        const status = value.s ? value.s : '-';
        return (
          <StackItem key={'proxy-status-' + i} className={smallStyle}>
            {value.c + ': ' + status}
          </StackItem>
        );
      } else {
        return undefined;
      }
    });

    return <Stack>{statusItems}</Stack>;
  };

  render() {
    if (!this.isSynced()) {
      return (
        <Tooltip
          aria-label={'Istio Proxy Status'}
          position={TooltipPosition.auto}
          enableFlip={true}
          content={this.statusList()}
        >
          <span>
            {createIcon(DEGRADED)}
          </span>
        </Tooltip>
      );
    } else {
      return createIcon(HEALTHY);
    }
  }
}

export default ProxyStatusList;
