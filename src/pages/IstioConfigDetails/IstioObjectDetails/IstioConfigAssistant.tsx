import { Stack, StackItem, Title, TitleLevel, TitleSize } from '@patternfly/react-core';
import * as React from 'react';

interface IstioConfigAssistantProps {}

class IstioConfigAssistant extends React.Component<IstioConfigAssistantProps> {
  render() {
    return (
      <Stack gutter="md">
        <StackItem>
          <Title headingLevel={TitleLevel.h5} size={TitleSize.lg}>
            Configuration Assistant
          </Title>
        </StackItem>
      </Stack>
    );
  }
}

export default IstioConfigAssistant;
