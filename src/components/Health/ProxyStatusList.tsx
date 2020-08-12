import * as React from 'react';
import { ProxyStatus } from '../../types/Health';
import { Flex, FlexItem, Split, SplitItem, Text, TextVariants } from '@patternfly/react-core';
import { style } from 'typestyle';

type Props = {
  workloadName: string;
  statuses: ProxyStatus[];
};

const smallStyle = style({ fontSize: '70%' });
const workloadNameStyle = style({ minWidth: '6rem', overflowWrap: 'break-word' });

const proxyStatusSort = (a: ProxyStatus, b: ProxyStatus): number => {
  return a.component > b.component ? 1 : -1;
};

class ProxyStatusList extends React.Component<Props> {
  sortedStatus = () => {
    return this.props.statuses.sort(proxyStatusSort);
  };

  statusList = () => {
    const statusItems = this.sortedStatus().map((value: ProxyStatus, i: number) => {
      return (
        <FlexItem key={'proxy-status-' + i}>
          <Text component={TextVariants.small} className={smallStyle}>
            {value.component + ': ' + value.status}
          </Text>
        </FlexItem>
      );
    });

    return <Flex style={{ flex: 'inlineFlex' }}> {statusItems} </Flex>;
  };

  render() {
    if (this.props.statuses.length > 0) {
      return (
        <Split gutter={'sm'}>
          <SplitItem className={workloadNameStyle}>{this.props.workloadName}</SplitItem>
          <SplitItem>{this.statusList()}</SplitItem>
        </Split>
      );
    } else {
      return [];
    }
  }
}

export default ProxyStatusList;
