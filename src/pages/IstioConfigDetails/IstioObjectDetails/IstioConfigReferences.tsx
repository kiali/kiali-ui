import { Stack, StackItem, Title, TitleLevel, TitleSize } from '@patternfly/react-core';
import * as React from 'react';

interface IstioConfigReferencesProps {}

class IstioConfigReferences extends React.Component<IstioConfigReferencesProps> {
  render() {
    return (
      <Stack gutter="md">
        <StackItem>
          <Title headingLevel={TitleLevel.h5} size={TitleSize.lg}>
            References
          </Title>
        </StackItem>
      </Stack>
    );
  }
}

export default IstioConfigReferences;
