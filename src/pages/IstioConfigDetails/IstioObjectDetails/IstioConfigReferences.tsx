import { Stack, StackItem, Title, TitleLevel, TitleSize } from '@patternfly/react-core';
import ServiceLink from 'components/Link/ServiceLink';
import * as React from 'react';
import { ServiceReference } from 'types/IstioObjects';

interface IstioConfigReferencesProps {
  serviceReferences: ServiceReference[];
}

class IstioConfigReferences extends React.Component<IstioConfigReferencesProps> {
  render() {
    return (
      <Stack gutter="md">
        <StackItem>
          <Title headingLevel={TitleLevel.h5} size={TitleSize.lg}>
            References
          </Title>
        </StackItem>
        <StackItem>
          {this.props.serviceReferences.map(reference => {
            return <ServiceLink name={reference.name} namespace={reference.namespace} />;
          })}
        </StackItem>
      </Stack>
    );
  }
}

export default IstioConfigReferences;
