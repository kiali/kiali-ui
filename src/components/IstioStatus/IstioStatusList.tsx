import * as React from 'react';
import { List, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { ComponentStatus } from '../../types/IstioStatus';
import _ from 'lodash';
import IstioComponentStatus from './IstioComponentStatus';
import { PfColors } from '../Pf/PfColors';

type Props = {
  status: ComponentStatus[];
};

class IstioStatusList extends React.Component<Props> {
  coreComponentsStatus = () => {
    return _.filter(this.props.status, (s: ComponentStatus) => s.is_core);
  };

  addonComponentsStatus = () => {
    return _.filter(this.props.status, (s: ComponentStatus) => !s.is_core);
  };

  renderComponentList = () => {
    const groups = {
      core: this.coreComponentsStatus,
      addon: this.addonComponentsStatus
    };

    return ['core', 'addon'].map((group: string) => {
      return (
        <>
          {groups[group]().map(status => {
            return <IstioComponentStatus componentStatus={status} />;
          })}
        </>
      );
    });
  };

  render() {
    return (
      <TextContent style={{ color: PfColors.White }}>
        <Text component={TextVariants.h4}>Istio Components Status</Text>
        <List id="istio-status" aria-label="Istio Component List">
          {this.renderComponentList()}
        </List>
      </TextContent>
    );
  }
}

export default IstioStatusList;
