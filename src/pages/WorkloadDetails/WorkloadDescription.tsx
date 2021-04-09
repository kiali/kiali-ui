import * as React from 'react';
import { Workload } from '../../types/Workload';
import { Card, CardBody, CardHeader, Title } from '@patternfly/react-core';
import DetailDescription from '../../components/Details/DetailDescription';
import { serverConfig } from '../../config';
import { style } from 'typestyle';
import MissingSidecar from '../../components/MissingSidecar/MissingSidecar';
import Labels from '../../components/Label/Labels';

type WorkloadDescriptionProps = {
  workload?: Workload;
  namespace: string;
};

const titleStyle = style({
  margin: '15px 0 11px 0'
});

const resourceListStyle = style({
  margin: '0px 0 11px 0',
  $nest: {
    '& > ul > li > span': {
      float: 'left',
      width: '125px',
      fontWeight: 700
    }
  }
});

class WorkloadDescription extends React.Component<WorkloadDescriptionProps> {
  render() {
    const workload = this.props.workload;
    const apps: string[] = [];
    const services: string[] = [];
    if (workload) {
      if (workload.labels[serverConfig.istioLabels.appLabelName]) {
        apps.push(workload.labels[serverConfig.istioLabels.appLabelName]);
      }
      workload.services.forEach(s => services.push(s.name));
    }
    const isTemplateLabels =
      workload &&
      ['Deployment', 'ReplicaSet', 'ReplicationController', 'DeploymentConfig', 'StatefulSet'].indexOf(workload.type) >=
        0;
    // const runtimes = (workload?.runtimes || []).map(r => r.name).filter(name => name !== '');
    return workload ? (
      <Card>
        <CardHeader>
          <Title headingLevel="h3" size="2xl">
            Workload
          </Title>
        </CardHeader>
        <CardBody>
          {workload.labels && (
            <Labels
              labels={workload.labels}
              tooltipMessage={isTemplateLabels ? 'Labels defined on the Workload template' : undefined}
            />
          )}
          <DetailDescription namespace={this.props.namespace} apps={apps} services={services} />
          {!this.props.workload?.istioSidecar && (
            <div>
              <MissingSidecar namespace={this.props.namespace} />
            </div>
          )}
          <Title headingLevel="h3" size="lg" className={titleStyle}>
            Properties
          </Title>
          <div key="properties-list" className={resourceListStyle}>
            <ul style={{ listStyleType: 'none' }}>
              <li>
                <span>Name</span>
                {workload.name}
              </li>
            </ul>
          </div>
          {/*
          <Stack gutter="md" style={{ marginTop: '10px' }}>
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
          */}
        </CardBody>
      </Card>
    ) : (
      'Loading'
    );
  }
}

export default WorkloadDescription;
