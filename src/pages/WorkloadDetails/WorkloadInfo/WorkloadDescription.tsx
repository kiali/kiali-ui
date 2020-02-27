import * as React from 'react';
import { style } from 'typestyle';
import { Workload } from '../../../types/Workload';
import LocalTime from '../../../components/Time/LocalTime';
import { DisplayMode, HealthIndicator } from '../../../components/Health/HealthIndicator';
import { WorkloadHealth } from '../../../types/Health';
import Labels from '../../../components/Label/Labels';
import {
  Card,
  CardActions,
  CardBody,
  CardHead,
  CardHeader,
  Dropdown,
  DropdownItem,
  Grid,
  GridItem,
  KebabToggle,
  PopoverPosition,
  Stack,
  StackItem,
  Text,
  TextVariants,
  Title
} from '@patternfly/react-core';
import { TextOrLink } from 'components/TextOrLink';
import { renderRuntimeLogo, renderAPILogo } from 'components/Logo/Logos';
import history from '../../../app/History';
import CytoscapeGraph from '../../../components/CytoscapeGraph/CytoscapeGraph';
import { CytoscapeGraphSelectorBuilder } from '../../../components/CytoscapeGraph/CytoscapeGraphSelector';
import { DagreGraph } from '../../../components/CytoscapeGraph/graphs/DagreGraph';
import { EdgeLabelMode, GraphType } from '../../../types/Graph';
import GraphDataSource from '../../../services/GraphDataSource';

const cytoscapeGraphContainerStyle = style({ height: '300px' });

type WorkloadDescriptionProps = {
  workload: Workload;
  namespace: string;
  istioEnabled: boolean;
  health?: WorkloadHealth;
  miniGraphDataSource: GraphDataSource;
};

type WorkloadDescriptionState = {
  isGraphActionsOpen: boolean;
};

class WorkloadDescription extends React.Component<WorkloadDescriptionProps, WorkloadDescriptionState> {
  constructor(props: WorkloadDescriptionProps) {
    super(props);
    this.state = { isGraphActionsOpen: false };
  }

  render() {
    const workload = this.props.workload;
    const isTemplateLabels =
      workload &&
      ['Deployment', 'ReplicaSet', 'ReplicationController', 'DeploymentConfig', 'StatefulSet'].indexOf(workload.type) >=
        0;
    const graphCardActions = [
      <DropdownItem key="viewGraph" onClick={this.onViewGraph}>
        View full graph
      </DropdownItem>
    ];
    const runtimes = workload.runtimes.map(r => r.name).filter(name => name !== '');
    return workload ? (
      <Grid gutter="md">
        <GridItem span={4}>
          <Card style={{ height: '100%' }}>
            <CardBody>
              <Title headingLevel="h3" size="2xl">
                {' '}
                Workload Overview{' '}
              </Title>
              <Stack>
                <StackItem id="labels">
                  <Text component={TextVariants.h3}> {isTemplateLabels ? 'Template Labels' : 'Labels'} </Text>
                  <Labels labels={workload.labels || {}} />
                </StackItem>
                <StackItem id="type">
                  <Text component={TextVariants.h3}> Type </Text>
                  {workload.type ? workload.type : 'N/A'}
                </StackItem>
                <StackItem id="created-at">
                  <Text component={TextVariants.h3}> Created at </Text>
                  <LocalTime time={workload.createdAt} />
                </StackItem>
                <StackItem id="resource-version">
                  <Text component={TextVariants.h3}> Resource Version </Text>
                  {workload.resourceVersion}
                </StackItem>
                {workload.additionalDetails.map((additionalItem, idx) => {
                  return (
                    <StackItem key={'additional-details-' + idx} id={'additional-details-' + idx}>
                      <Text component={TextVariants.h3}> {additionalItem.title} </Text>
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
        </GridItem>
        <GridItem span={4}>
          <Card style={{ height: '100%' }}>
            <CardHead>
              <CardActions>
                <Dropdown
                  toggle={<KebabToggle onToggle={this.onGraphActionsToggle} />}
                  dropdownItems={graphCardActions}
                  isPlain
                  isOpen={this.state.isGraphActionsOpen}
                  position={'right'}
                />
              </CardActions>
              <CardHeader>
                <Title headingLevel="h3" size="2xl">
                  Graph Overview{' '}
                </Title>
              </CardHeader>
            </CardHead>
            <CardBody>
              <div style={{ height: '300px' }}>
                <CytoscapeGraph
                  activeNamespaces={[{ name: this.props.namespace }]}
                  containerClassName={cytoscapeGraphContainerStyle}
                  dataSource={this.props.miniGraphDataSource}
                  displayUnusedNodes={() => undefined}
                  edgeLabelMode={EdgeLabelMode.NONE}
                  graphType={GraphType.APP}
                  isMTLSEnabled={false}
                  isMiniGraph={true}
                  layout={DagreGraph.getLayout()}
                  refreshInterval={0}
                  showCircuitBreakers={false}
                  showMissingSidecars={true}
                  showNodeLabels={true}
                  showSecurity={false}
                  showServiceNodes={true}
                  showTrafficAnimation={true}
                  showUnusedNodes={false}
                  showVirtualServices={true}
                />
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card style={{ height: '100%' }}>
            <CardBody>
              <Title headingLevel="h3" size="2xl">
                {' '}
                Health Overview{' '}
              </Title>
              <Stack>
                <StackItem id="health" className={'stack_service_details'}>
                  <Text component={TextVariants.h3}> Overall Health</Text>
                  <HealthIndicator
                    id={workload.name}
                    health={this.props.health}
                    mode={DisplayMode.LARGE}
                    tooltipPlacement={PopoverPosition.left}
                  />
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    ) : (
      'Loading'
    );
  }

  private onGraphActionsToggle = (isOpen: boolean) => {
    this.setState({
      isGraphActionsOpen: isOpen
    });
  };

  private onViewGraph = () => {
    let cytoscapeGraph = new CytoscapeGraphSelectorBuilder()
      .namespace(this.props.namespace)
      .workload(this.props.workload.name);

    const graphUrl = `/graph/namespaces?graphType=${GraphType.WORKLOAD}&injectServiceNodes=true&namespaces=${
      this.props.namespace
    }&unusedNodes=true&focusSelector=${encodeURI(cytoscapeGraph.build())}`;

    history.push(graphUrl);
  };
}

export default WorkloadDescription;
