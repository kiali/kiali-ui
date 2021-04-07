import * as React from 'react';
import { Workload } from '../../../types/Workload';
import LocalTime from '../../../components/Time/LocalTime';
import Labels from '../../../components/Label/Labels';
import { Card, CardBody, Stack, StackItem, Text, TextVariants, Title } from '@patternfly/react-core';
import { TextOrLink } from 'components/TextOrLink';
import { renderRuntimeLogo, renderAPILogo } from 'components/Logo/Logos';
import MissingSidecar from '../../../components/MissingSidecar/MissingSidecar';

type WorkloadDescriptionProps = {
  workload?: Workload;
  namespace: string;
};

class WorkloadDescription extends React.Component<WorkloadDescriptionProps> {
  render() {
    const workload = this.props.workload;
    const isTemplateLabels =
      workload &&
      ['Deployment', 'ReplicaSet', 'ReplicationController', 'DeploymentConfig', 'StatefulSet'].indexOf(workload.type) >=
        0;
    const runtimes = (workload?.runtimes || []).map(r => r.name).filter(name => name !== '');
    return workload ? (
      <Card style={{ height: '100%' }}>
        <CardBody>
          <Title headingLevel="h3" size="2xl">
            Workload
          </Title>
          <Stack gutter="md" style={{ marginTop: '10px' }}>
            <StackItem id="name">
              <Title headingLevel="h6" size="md">
                {' '}
                Name{' '}
              </Title>
              {workload.name}
              {!this.props.workload?.istioSidecar && (
                <span style={{ marginLeft: '10px' }}>
                  <MissingSidecar namespace={this.props.namespace} />
                </span>
              )}
            </StackItem>
            <StackItem id="labels">
              <Title headingLevel="h6" size="md">
                {' '}
                {isTemplateLabels ? 'Template Labels' : 'Labels'}{' '}
              </Title>
              <Labels labels={workload.labels || {}} />
            </StackItem>
            {workload.istioInjectionAnnotation !== undefined && (
              <StackItem>
                <Title headingLevel="h6" size="md">
                  {' '}
                  {'Istio Sidecar Inject Annotation'}{' '}
                </Title>
                {String(workload.istioInjectionAnnotation)}
              </StackItem>
            )}
            <StackItem id="type">
              <Title headingLevel="h6" size="md">
                {' '}
                Type{' '}
              </Title>
              {workload.type ? workload.type : 'N/A'}
            </StackItem>
            <StackItem id="created-at">
              <Title headingLevel="h6" size="md">
                {' '}
                Created at{' '}
              </Title>
              <LocalTime time={workload.createdAt} />
            </StackItem>
            <StackItem id="resource-version">
              <Title headingLevel="h6" size="md">
                {' '}
                Resource Version{' '}
              </Title>
              {workload.resourceVersion}
            </StackItem>
            {workload.additionalDetails.map((additionalItem, idx) => {
              return (
                <StackItem key={'additional-details-' + idx} id={'additional-details-' + idx}>
                  <Title headingLevel="h6" size="md">
                    {' '}
                    {additionalItem.title}{' '}
                  </Title>
                  {additionalItem.icon && renderAPILogo(additionalItem.icon, undefined, idx)}
                  <TextOrLink text={additionalItem.value} urlTruncate={64} />
                </StackItem>
              );
            })}
            {runtimes.length > 0 && (
              <StackItem id="runtimes">
                <Text component={TextVariants.h3}> Runtimes</Text>
                {runtimes
                  .map((rt, idx) => renderRuntimeLogo(rt, idx))
                  .reduce(
                    (list: JSX.Element[], elem) =>
                      list.length > 0 ? [...list, <span key="sep"> | </span>, elem] : [elem],
                    []
                  )}
              </StackItem>
            )}
          </Stack>
        </CardBody>
      </Card>
    ) : (
      'Loading'
    );
  }
}

export default WorkloadDescription;
