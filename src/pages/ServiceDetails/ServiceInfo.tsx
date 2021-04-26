import * as React from 'react';
import { style } from 'typestyle';
import { Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import ServiceId from '../../types/ServiceId';
import ServiceDescription from './ServiceDescription';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';
import { ObjectValidation, PeerAuthentication, Validations } from '../../types/IstioObjects';
import { RenderComponentScroll } from '../../components/Nav/Page';
import { PromisesRegistry } from 'utils/CancelablePromises';
import { DurationInSeconds, TimeInMilliseconds } from 'types/Common';
import GraphDataSource from 'services/GraphDataSource';
import { drToIstioItems, vsToIstioItems } from '../../types/IstioConfigList';
import { KialiAppState } from '../../store/Store';
import { connect } from 'react-redux';
import { durationSelector, meshWideMTLSEnabledSelector } from '../../store/Selectors';
import MiniGraphCard from '../../components/CytoscapeGraph/MiniGraphCard';
import HealthCard from '../../components/Health/HealthCard';
import IstioConfigCard from '../../components/IstioConfigCard/IstioConfigCard';
import ServiceNetwork from './ServiceNetwork';
import { renderHealthTitle } from '../../components/Health/HealthDetails';

interface Props extends ServiceId {
  duration: DurationInSeconds;
  lastRefreshAt: TimeInMilliseconds;
  mtlsEnabled: boolean;
  serviceDetails?: ServiceDetailsInfo;
  gateways: string[];
  peerAuthentications: PeerAuthentication[];
  validations: Validations;
}

type ServiceInfoState = {
  tabHeight?: number;
};

const fullHeightStyle = style({
  height: '100%'
});

class ServiceInfo extends React.Component<Props, ServiceInfoState> {
  private promises = new PromisesRegistry();
  private graphDataSource = new GraphDataSource();

  constructor(props: Props) {
    super(props);
    this.state = {
      tabHeight: 300
    };
  }

  componentDidMount() {
    this.fetchBackend();
  }

  componentDidUpdate(prev: Props) {
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

  private getServiceValidation(): ObjectValidation | undefined {
    if (this.props.validations && this.props.validations.service && this.props.serviceDetails) {
      return this.props.validations.service[this.props.serviceDetails.service.name];
    }
    return undefined;
  }

  render() {
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
            <GridItem span={4}>
              <Stack gutter="md">
                <StackItem>
                  <ServiceDescription namespace={this.props.namespace} serviceDetails={this.props.serviceDetails} />
                </StackItem>
                {this.props.serviceDetails && (
                  <ServiceNetwork
                    serviceDetails={this.props.serviceDetails}
                    validations={this.getServiceValidation()}
                  />
                )}
              </Stack>
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
            <GridItem span={8}>
              <MiniGraphCard
                title={
                  this.props.serviceDetails && this.props.serviceDetails.health ? (
                    renderHealthTitle(this.props.serviceDetails.health)
                  ) : (
                    <>Graph</>
                  )
                }
                dataSource={this.graphDataSource}
                mtlsEnabled={this.props.mtlsEnabled}
                graphContainerStyle={graphContainerStyle}
              />
            </GridItem>
          </Grid>
        </RenderComponentScroll>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  duration: durationSelector(state),
  lastRefreshAt: state.globalState.lastRefreshAt,
  mtlsEnabled: meshWideMTLSEnabledSelector(state)
});

const ServiceInfoContainer = connect(mapStateToProps)(ServiceInfo);
export default ServiceInfoContainer;
