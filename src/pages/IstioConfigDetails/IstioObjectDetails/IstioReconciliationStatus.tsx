import * as React from 'react';
import { Stack, StackItem, Title, TitleLevel, TitleSize } from '@patternfly/react-core';
import { StatusCondition } from 'types/IstioObjects';

interface Props {
  condition: StatusCondition;
}

class IstioReconciliationStatus extends React.Component<Props> {
  render() {
    return (
      <>
        <Title headingLevel={TitleLevel.h3} size={TitleSize.xl}>
          Reconciliation Status
        </Title>
        <Stack gutter="lg">
          <StackItem>
            {this.props.condition.status && <>The object is reconciled.</>}
            {!this.props.condition.status && <>The object is reconciling.</>}
          </StackItem>
          <StackItem>{this.props.condition.message}</StackItem>
        </Stack>
      </>
    );
  }
}

export default IstioReconciliationStatus;
