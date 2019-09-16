import * as React from 'react';
import { style } from 'typestyle';
import { Validations } from '../../types/IstioObjects';
import WorkloadDescription from './WorkloadInfo/WorkloadDescription';
import WorkloadPods from './WorkloadInfo/WorkloadPods';
import WorkloadServices from './WorkloadInfo/WorkloadServices';
import { severityToIconName, validationToSeverity } from '../../types/ServiceInfo';
import { WorkloadHealth } from '../../types/Health';
import { Workload } from '../../types/Workload';
import { DurationDropdownContainer } from '../../components/DurationDropdown/DurationDropdown';
import RefreshButtonContainer from '../../components/Refresh/RefreshButton';
import { Tab, Grid, GridItem } from '@patternfly/react-core';
import ParameterizedTabs, { activeTab } from '../../components/Tab/Tabs';

type WorkloadInfoProps = {
  workload: Workload;
  validations: Validations;
  namespace: string;
  onRefresh: () => void;
  istioEnabled: boolean;
  health?: WorkloadHealth;
};

interface ValidationChecks {
  hasPodsChecks: boolean;
}

type WorkloadInfoState = {
  currentTab: string;
};

const tabIconStyle = style({
  fontSize: '0.9em'
});
const floatRightStyle = style({
  float: 'right'
});

const tabName = 'list';
const defaultTab = 'pods';
const paramToTab: { [key: string]: number } = {
  pods: 0,
  services: 1
};

class WorkloadInfo extends React.Component<WorkloadInfoProps, WorkloadInfoState> {
  constructor(props: WorkloadInfoProps) {
    super(props);
    this.state = {
      currentTab: activeTab(tabName, defaultTab)
    };
  }

  componentDidUpdate() {
    const aTab = activeTab(tabName, defaultTab);

    if (this.state.currentTab !== aTab) {
      this.setState({
        currentTab: aTab
      });
    }
  }

  validationChecks(): ValidationChecks {
    const validationChecks = {
      hasPodsChecks: false
    };

    const pods = this.props.workload.pods || [];

    validationChecks.hasPodsChecks = pods.some(
      pod =>
        this.props.validations.pod &&
        this.props.validations.pod[pod.name] &&
        this.props.validations.pod[pod.name].checks.length > 0
    );

    return validationChecks;
  }

  render() {
    const workload = this.props.workload;
    const pods = workload.pods || [];
    const services = workload.services || [];
    const validationChecks = this.validationChecks();

    const getSeverityIcon: any = (severity: string = 'error') => (
      <span className={tabIconStyle}>
        {' '}
        {severityToIconName(severity)}
      </span>
    );

    const getValidationIcon = (keys: string[], type: string) => {
      let severity = 'warning';
      keys.forEach(key => {
        const validations = this.props.validations![type][key];
        if (validationToSeverity(validations) === 'error') {
          severity = 'error';
        }
      });
      return getSeverityIcon(severity);
    };

    const podTabTitle: any = (
      <>
        Pods ({pods.length}){' '}
        {validationChecks.hasPodsChecks
          ? getValidationIcon((this.props.workload.pods || []).map(a => a.name), 'pod')
          : undefined}
      </>
    );

    return (
      <Grid>
        <GridItem span={12}>
          <span className={floatRightStyle}>
            <DurationDropdownContainer id="workload-info-duration-dropdown" />{' '}
            <RefreshButtonContainer handleRefresh={this.props.onRefresh} />
          </span>
        </GridItem>
        <GridItem span={12}>
          <WorkloadDescription
            workload={workload}
            namespace={this.props.namespace}
            istioEnabled={this.props.istioEnabled}
            health={this.props.health}
          />
        </GridItem>
        <GridItem span={12} style={{marginTop:'10px'}}>
          <ParameterizedTabs
            id="service-tabs"
            onSelect={tabValue => {
              this.setState({ currentTab: tabValue });
            }}
            tabMap={paramToTab}
            tabName={tabName}
            defaultTab={defaultTab}
            activeTab={this.state.currentTab}
          >
            <Tab title={podTabTitle} eventKey={0}>
              {pods.length > 0 && (
                <WorkloadPods
                  namespace={this.props.namespace}
                  workloadName={this.props.workload.name}
                  pods={pods}
                  validations={this.props.validations!.pod}
                />
              )}
            </Tab>
            <Tab title={'Services (' + services.length + ')'} eventKey={1}>
              {services.length > 0 && <WorkloadServices workloadName={this.props.workload.name} services={services} namespace={this.props.namespace} />}
            </Tab>
          </ParameterizedTabs>
        </GridItem>
      </Grid>
    );
  }
}

export default WorkloadInfo;
