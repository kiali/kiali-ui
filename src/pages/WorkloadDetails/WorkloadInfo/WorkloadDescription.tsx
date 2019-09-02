import * as React from 'react';
import { Workload } from '../../../types/Workload';
import LocalTime from '../../../components/Time/LocalTime';
import { DisplayMode, HealthIndicator } from '../../../components/Health/HealthIndicator';
import { WorkloadHealth } from '../../../types/Health';
import { runtimesLogoProviders } from '../../../config/Logos';
import Labels from '../../../components/Label/Labels';
import { Card, CardBody, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';

type WorkloadDescriptionProps = {
  workload: Workload;
  namespace: string;
  istioEnabled: boolean;
  health?: WorkloadHealth;
};

type WorkloadDescriptionState = {};

class WorkloadDescription extends React.Component<WorkloadDescriptionProps, WorkloadDescriptionState> {
  constructor(props: WorkloadDescriptionProps) {
    super(props);
    this.state = {};
  }

  renderLogo(name: string, idx: number): JSX.Element {
    const logoProvider = runtimesLogoProviders[name];
    if (logoProvider) {
      return <img key={'logo-' + idx} src={logoProvider} alt={name} title={name} />;
    }
    return <span key={'runtime-' + idx}>{name}</span>;
  }

  render() {
    const workload = this.props.workload;
    const isTemplateLabels =
      workload &&
      ['Deployment', 'ReplicaSet', 'ReplicationController', 'DeploymentConfig', 'StatefulSet'].indexOf(workload.type) >=
        0;
    return workload ? (
      <Card>
        <CardBody>
      <Grid>
        <GridItem span={6} lg={6} md={6} sm={8}>
          <Stack id={"labels"}>
            <StackItem className="progress-description">
              <strong>{isTemplateLabels ? 'Template Labels' : 'Labels'}</strong>
            </StackItem>
            <StackItem className="label-collection">
              <Labels labels={workload.labels} />
            </StackItem>
            <StackItem>
              <strong>Type</strong> {workload.type ? workload.type : ''}
            </StackItem>
            <StackItem>
              <strong>Created at</strong> <LocalTime time={workload.createdAt} />
            </StackItem>
            <StackItem>
             <strong>Resource Version</strong> {workload.resourceVersion}
            </StackItem>
         {workload.runtimes.length > 0 && (
            <StackItem>
              <br />
              {workload.runtimes
                .filter(r => r.name !== '')
                .map((rt, idx) => this.renderLogo(rt.name, idx))
                .reduce(
                  (list: JSX.Element[], elem) =>
                    list.length > 0 ? [...list, <span key="sep"> | </span>, elem] : [elem],
                  []
                )}
            </StackItem>
          )}
          </Stack>
        </GridItem>
        <GridItem span={3} lg={3} md={3} sm={4}/>
        <GridItem span={3} lg={3} md={3} sm={4}>
          <Stack>
            <StackItem className="progress-description">
              <strong>Health</strong>
            </StackItem>
            <StackItem>
              <HealthIndicator
                id={workload.name}
                health={this.props.health}
                mode={DisplayMode.LARGE}
                tooltipPlacement="left"
              />
            </StackItem>
          </Stack>
        </GridItem>
      </Grid>
        </CardBody>
      </Card>
    ) : (
      'Loading'
    );
  }
}

export default WorkloadDescription;
