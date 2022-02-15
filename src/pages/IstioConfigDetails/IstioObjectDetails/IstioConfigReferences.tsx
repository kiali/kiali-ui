import { Stack, StackItem, Title, TitleLevel, TitleSize } from '@patternfly/react-core';
import { ReferenceIstioObjectLink } from 'components/Link/IstioObjectLink';
import ServiceLink from 'components/Link/ServiceLink';
import WorkloadLink from 'components/Link/WorkloadLink';
import * as React from 'react';
import { ObjectReference, ServiceReference, WorkloadReference } from 'types/IstioObjects';

interface IstioConfigReferencesProps {
  objectReferences: ObjectReference[];
  serviceReferences: ServiceReference[];
  workloadReferences: WorkloadReference[];
}

class IstioConfigReferences extends React.Component<IstioConfigReferencesProps> {
  render() {
    return (
      <Stack>
        <StackItem>
          <Title headingLevel={TitleLevel.h5} size={TitleSize.lg} style={{ paddingBottom: '10px' }}>
            References
          </Title>
        </StackItem>
        {this.props.serviceReferences && this.props.serviceReferences.length > 0 && (
          <StackItem>
            {this.props.serviceReferences.map(reference => {
              return <ServiceLink name={reference.name} namespace={reference.namespace} />;
            })}
          </StackItem>
        )}
        {this.props.workloadReferences && this.props.workloadReferences.length > 0 && (
          <StackItem>
            {this.props.workloadReferences.map(reference => {
              return <WorkloadLink name={reference.name} namespace={reference.namespace} />;
            })}
          </StackItem>
        )}
        {this.props.objectReferences && this.props.objectReferences.length > 0 && (
          <StackItem>
            {this.props.objectReferences.map(reference => {
              return (
                <ReferenceIstioObjectLink
                  name={reference.name}
                  namespace={reference.namespace}
                  type={reference.objectType}
                />
              );
            })}
          </StackItem>
        )}
      </Stack>
    );
  }
}

export default IstioConfigReferences;
