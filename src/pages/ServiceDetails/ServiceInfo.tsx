import * as React from 'react';
import { style } from 'typestyle';
import { Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import ServiceId from '../../types/ServiceId';
import ServiceDescription from './ServiceDescription';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';
import { ObjectValidation, PeerAuthentication, Validations } from '../../types/IstioObjects';
import { activeTab } from '../../components/Tab/Tabs';
import { RenderComponentScroll } from '../../components/Nav/Page';
import { PromisesRegistry } from 'utils/CancelablePromises';
import { DurationInSeconds, TimeInMilliseconds } from 'types/Common';
import GraphDataSource from 'services/GraphDataSource';
import { drToIstioItems, vsToIstioItems } from '../../types/IstioConfigList';
import { KialiAppState } from '../../store/Store';
import { connect } from 'react-redux';
import { durationSelector } from '../../store/Selectors';
import MiniGraphCard from '../../components/CytoscapeGraph/MiniGraphCard';
import HealthCard from '../../components/Health/HealthCard';
import IstioConfigCard from '../../components/IstioConfigCard/IstioConfigCard';

interface Props extends ServiceId {
  duration: DurationInSeconds;
  lastRefreshAt: TimeInMilliseconds;
  serviceDetails?: ServiceDetailsInfo;
  gateways: string[];
  peerAuthentications: PeerAuthentication[];
  validations: Validations;
}

type ServiceInfoState = {
  currentTab: string;
  tabHeight?: number;
};

interface ValidationChecks {
  hasVirtualServiceChecks: boolean;
  hasDestinationRuleChecks: boolean;
}

const tabName = 'list';
const defaultTab = 'workloads';

const fullHeightStyle = style({
  height: '100%'
});

class ServiceInfo extends React.Component<Props, ServiceInfoState> {
  private promises = new PromisesRegistry();
  private graphDataSource = new GraphDataSource();

  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: activeTab(tabName, defaultTab)
    };
  }

  componentDidMount() {
    this.fetchBackend();
  }

  componentDidUpdate(prev: Props) {
    const aTab = activeTab(tabName, defaultTab);
    if (this.state.currentTab !== aTab) {
      this.setState({ currentTab: aTab });
    }
    if (
      prev.duration !== this.props.duration ||
      prev.lastRefreshAt !== this.props.lastRefreshAt ||
      prev.serviceDetails !== this.props.serviceDetails
    ) {
      this.fetchBackend();
    }
  }

  private fetchBackend = () => {
    this.promises.cancelAll();
    this.graphDataSource.fetchForService(this.props.duration, this.props.namespace, this.props.service);
  };

  private validationChecks(): ValidationChecks {
    const validationChecks = {
      hasVirtualServiceChecks: false,
      hasDestinationRuleChecks: false
    };
    const validations = this.props.validations || {};
    if (this.props.serviceDetails) {
      validationChecks.hasVirtualServiceChecks = this.props.serviceDetails.virtualServices.items.some(
        virtualService =>
          validations.virtualservice &&
          validations.virtualservice[virtualService.metadata.name] &&
          validations.virtualservice[virtualService.metadata.name].checks &&
          validations.virtualservice[virtualService.metadata.name].checks.length > 0
      );
      validationChecks.hasDestinationRuleChecks = this.props.serviceDetails.destinationRules.items.some(
        destinationRule =>
          validations.destinationrule &&
          destinationRule.metadata &&
          validations.destinationrule[destinationRule.metadata.name] &&
          validations.destinationrule[destinationRule.metadata.name].checks &&
          validations.destinationrule[destinationRule.metadata.name].checks.length > 0
      );
    }

    return validationChecks;
  }

  private getServiceValidation(): ObjectValidation | undefined {
    if (this.props.validations && this.props.validations.service && this.props.serviceDetails) {
      return this.props.validations.service[this.props.serviceDetails.service.name];
    }
    return undefined;
  }

  render() {
    const validationChecks = this.validationChecks();
    /*    const getSeverityIcon: any = (severity: ValidationTypes = ValidationTypes.Error) => (
      <span className={tabIconStyle}>
        {' '}
        <Validation severity={severity} />
      </span>
    );*/

    /*    const getValidationIcon = (keys: string[], types: string[]) => {
      let severity = ValidationTypes.Warning;
      keys.forEach(key => {
        types.forEach(type => {
          if (this.props.validations && this.props.validations[type]) {
            const validationsForIcon = (this.props.validations || {})![type][key];
            if (validationToSeverity(validationsForIcon) === ValidationTypes.Error) {
              severity = ValidationTypes.Error;
            }
          }
        });
      });
      return getSeverityIcon(severity);
    };*/

    if (this.props.serviceDetails) {
      if (validationChecks.hasVirtualServiceChecks || validationChecks.hasDestinationRuleChecks) {
        const names: string[] = [];
        this.props.serviceDetails.virtualServices?.items.forEach(vs => names.push(vs.metadata.name));
        this.props.serviceDetails.destinationRules?.items.forEach(dr => names.push(dr.metadata.name));
      }
    }

    const vsIstioConfigItems = this.props.serviceDetails?.virtualServices
      ? vsToIstioItems(this.props.serviceDetails.virtualServices.items, this.props.serviceDetails.validations)
      : [];
    const drIstioConfigItems = this.props.serviceDetails?.destinationRules
      ? drToIstioItems(this.props.serviceDetails.destinationRules.items, this.props.serviceDetails.validations)
      : [];
    const istioConfigItems = vsIstioConfigItems.concat(drIstioConfigItems);

    // RenderComponentScroll handles height to provide an inner scroll combined with tabs
    // This height needs to be propagated to minigraph to proper resize in height
    // Graph resizes correctly on width
    const height = this.state.tabHeight ? this.state.tabHeight - 115 : 300;
    const graphContainerStyle = style({ width: '100%', height: height });

    return (
      <>
        <RenderComponentScroll onResize={height => this.setState({ tabHeight: height })}>
          <Grid gutter={'md'} className={fullHeightStyle}>
            <GridItem span={3}>
              <ServiceDescription
                namespace={this.props.namespace}
                serviceDetails={this.props.serviceDetails}
                validations={this.getServiceValidation()}
              />
            </GridItem>
            <GridItem span={6}>
              <MiniGraphCard
                title={this.props.service}
                dataSource={this.graphDataSource}
                graphContainerStyle={graphContainerStyle}
              />
            </GridItem>
            <GridItem span={3}>
              <Stack gutter="md">
                <StackItem>
                  {this.props.serviceDetails ? (
                    <HealthCard
                      name={this.props.serviceDetails.service.name}
                      health={this.props.serviceDetails.health}
                    />
                  ) : (
                    'Loading'
                  )}
                </StackItem>
                <StackItem>
                  <IstioConfigCard name={this.props.service} items={istioConfigItems} />
                </StackItem>
              </Stack>
            </GridItem>
          </Grid>
        </RenderComponentScroll>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  lastRefreshAt: state.globalState.lastRefreshAt
});

const ServiceInfoContainer = connect(mapStateToProps)(ServiceInfo);
export default ServiceInfoContainer;
