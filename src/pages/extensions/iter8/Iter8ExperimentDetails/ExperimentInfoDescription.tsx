import * as React from 'react';
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Grid,
  GridItem,
  List,
  ListItem,
  Stack,
  StackItem,
  Text,
  TextVariants
} from '@patternfly/react-core';
import './ExperimentInfoDescription.css';

import LocalTime from '../../../../components/Time/LocalTime';
import { Link } from 'react-router-dom';
import CriteriaTable from './CriteriaTable';
import { Iter8ExpDetailsInfo } from '../../../../types/Iter8';
import Iter8MetricsContainer from '../../../../components/Metrics/Iter8Metrics';
import { MetricsObjectTypes } from '../../../../types/Metrics';
import { RenderComponentScroll } from '../../../../components/Nav/Page';

interface ExperimentInfoDescriptionProps {
  target: string;
  namespace: string;
  experimentDetails?: Iter8ExpDetailsInfo;
  experiment: string;
  duration: number;
  startTime: number;
  endTime: number;
  baseline: string;
  candidate: string;
  // app: App;
  // miniGraphDataSource: GraphDataSource;
}

class ExperimentInfoDescription extends React.Component<ExperimentInfoDescriptionProps> {
  serviceLink(namespace: string, workload: string) {
    return '/namespaces/' + namespace + '/services/' + workload;
  }

  serviceInfo() {
    // const ns = this.props.experimentItem.namespace ;

    return [
      <DataListCell key="service-icon" isIcon={true}>
        <Badge>S</Badge>
      </DataListCell>,
      <DataListCell key="targetService">
        <Text component={TextVariants.h3}>Service</Text>
      </DataListCell>
    ];
  }

  serviceLinkCell(namespace: string, bname: string) {
    return [
      <DataListCell key={bname}>
        <Text component={TextVariants.h3}>
          <Link to={this.serviceLink(namespace, bname)}>{bname}</Link>
        </Text>
      </DataListCell>
    ];
  }
  workloadLink(namespace: string, workload: string) {
    return '/namespaces/' + namespace + '/workloads/' + workload;
  }

  renderDeployments(baseline: string) {
    return (
      <ListItem key={`AppService_${baseline}`}>
        <Link to={this.workloadLink(this.props.namespace, baseline)}>{baseline}</Link>
      </ListItem>
    );
  }

  baselineInfo(bname: string, binfo: string) {
    // const ns = this.props.experimentItem.namespace ;
    const workloadList = this.renderDeployments(binfo);

    return [
      <DataListCell key="workload-icon" isIcon={true}>
        <Badge>W</Badge>
      </DataListCell>,
      <DataListCell key="baseline">
        <Text component={TextVariants.h3}>{bname}</Text>
        <List>{workloadList}</List>
      </DataListCell>
    ];
  }

  percentageInfo(bname: string, bpercentage: number) {
    // const ns = this.props.experimentItem.namespace ;
    return [
      <DataListCell key={bname}>
        <Text component={TextVariants.h3}>Percentage</Text>
        <Text>{bpercentage} %</Text>
      </DataListCell>
    ];
  }

  getConclusionList(conclusions: string[]) {
    return (
      <ul>
        {conclusions.map((sub, subIdx) => {
          return <li key={subIdx}>{sub}</li>;
        })}
      </ul>
    );
  }

  render() {
    let startTime = 0;
    let endTime = 0;

    if (this.props.experimentDetails !== undefined) {
      //  startTime = new Date(this.props.experimentDetails.experimentItem.startedAt).getTime();
      startTime = new Date(this.props.experimentDetails.experimentItem.startedAt / 1000000).getTime();
      endTime = new Date(this.props.experimentDetails.experimentItem.endedAt / 1000000).getTime();

      // if (this.props.experimentDetails.experimentItem.endedAt != '') {
      //   endTime = new Date(this.props.experimentDetails.experimentItem.endedAt).getTime();
      //   timeWindowType = 'Snapshot';
      // }
    } else {
      startTime = new Date(this.props.startTime / 1000000).getTime();
      endTime = new Date(this.props.endTime / 1000000).getTime();
    }
    return (
      <RenderComponentScroll>
        <Grid gutter="md">
          <GridItem span={6}>
            <Card style={{ height: '100%' }}>
              <CardBody>
                <DataList aria-label="baseline and candidate">
                  <DataListItem aria-labelledby="target">
                    <DataListItemRow>
                      <DataListItemCells dataListCells={this.serviceInfo()} />
                      <DataListItemCells
                        dataListCells={this.serviceLinkCell(this.props.namespace, this.props.target)}
                      />
                    </DataListItemRow>
                  </DataListItem>

                  <DataListItem aria-labelledby="Baseline">
                    <DataListItemRow>
                      <DataListItemCells
                        dataListCells={this.baselineInfo(
                          'Baseline',
                          this.props.experimentDetails ? this.props.experimentDetails.experimentItem.baseline : ''
                        )}
                      />
                      <DataListItemCells
                        dataListCells={this.percentageInfo(
                          'Baseline',
                          this.props.experimentDetails
                            ? this.props.experimentDetails.experimentItem.baselinePercentage
                            : 0
                        )}
                      />
                    </DataListItemRow>
                  </DataListItem>
                  <DataListItem aria-labelledby="Candidate">
                    <DataListItemRow>
                      <DataListItemCells
                        dataListCells={this.baselineInfo(
                          'Candidate',
                          this.props.experimentDetails ? this.props.experimentDetails.experimentItem.candidate : ''
                        )}
                      />
                      <DataListItemCells
                        dataListCells={this.percentageInfo(
                          'Candidate',
                          this.props.experimentDetails
                            ? this.props.experimentDetails.experimentItem.candidatePercentage
                            : 0
                        )}
                      />
                    </DataListItemRow>
                  </DataListItem>
                </DataList>

                <Stack gutter="md" style={{ marginTop: '10px' }}>
                  <StackItem id={'Status'}>
                    <Text component={TextVariants.h3}> Status: </Text>
                    {this.props.experimentDetails ? this.props.experimentDetails.experimentItem.status : ''}
                  </StackItem>
                  <StackItem id={'Status'}>
                    <Text component={TextVariants.h3}> Phase: </Text>
                    {this.props.experimentDetails ? this.props.experimentDetails.experimentItem.phase : ''}
                  </StackItem>
                  <StackItem id={'assessment'}>
                    <Text component={TextVariants.h3}> Assessment: </Text>
                    {this.props.experimentDetails && this.props.experimentDetails.experimentItem.assessmentConclusion
                      ? this.getConclusionList(this.props.experimentDetails.experimentItem.assessmentConclusion)
                      : ''}
                  </StackItem>
                  <StackItem>
                    <Grid>
                      <GridItem span={4}>
                        <StackItem id={'started_at'}>
                          <Text component={TextVariants.h3}> Created at </Text>
                          <LocalTime
                            time={
                              this.props.experimentDetails && this.props.experimentDetails.experimentItem.createdAt
                                ? new Date(
                                    this.props.experimentDetails.experimentItem.createdAt / 1000000
                                  ).toISOString()
                                : ''
                            }
                          />
                        </StackItem>
                      </GridItem>
                      <GridItem span={4}>
                        <StackItem id={'started_at'}>
                          <Text component={TextVariants.h3}> Started at </Text>
                          <LocalTime
                            time={
                              this.props.experimentDetails && this.props.experimentDetails.experimentItem.startedAt
                                ? new Date(
                                    this.props.experimentDetails.experimentItem.startedAt / 1000000
                                  ).toISOString()
                                : ''
                            }
                          />
                        </StackItem>
                      </GridItem>
                      <GridItem span={4}>
                        <StackItem id={'ended_at'}>
                          <Text component={TextVariants.h3}> Ended at </Text>
                          <LocalTime
                            time={
                              this.props.experimentDetails && this.props.experimentDetails.experimentItem.endedAt
                                ? new Date(this.props.experimentDetails.experimentItem.endedAt / 1000000).toISOString()
                                : ''
                            }
                          />
                        </StackItem>
                      </GridItem>
                    </Grid>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={6}>
            <Card style={{ height: '100%' }}>
              <CardBody>
                <Iter8MetricsContainer
                  namespace={this.props.namespace}
                  object={this.props.target}
                  objectType={MetricsObjectTypes.ITER8}
                  direction={'inbound'}
                  startTime={startTime}
                  endTime={endTime}
                  baseline={this.props.baseline}
                  candidate={this.props.candidate}
                />
              </CardBody>
              <CardFooter>
                <CriteriaTable criterias={this.props.experimentDetails ? this.props.experimentDetails.criterias : []} />
              </CardFooter>
            </Card>
          </GridItem>
        </Grid>
      </RenderComponentScroll>
    );
  }
}

export default ExperimentInfoDescription;
