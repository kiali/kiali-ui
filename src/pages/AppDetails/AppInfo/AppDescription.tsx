import * as React from 'react';
import { Row, Col, ListView, ListViewItem, ListViewIcon, Icon } from 'patternfly-react';
import PfInfoCard from '../../../components/Pf/PfInfoCard';
import { DisplayMode, HealthIndicator } from '../../../components/Health/HealthIndicator';
import MissingSidecar from '../../../components/MissingSidecar/MissingSidecar';
import { AppHealth } from '../../../types/Health';
import { App, AppWorkload } from '../../../types/App';
import { WorkloadIcon } from '../../../types/Workload';
import { Link } from 'react-router-dom';
import { CytoscapeGraphSelectorBuilder } from '../../../components/CytoscapeGraph/CytoscapeGraphSelector';
import { NodeType } from '../../../types/Graph';
import Namespace from '../../../types/Namespace';

type AppDescriptionProps = {
  app: App;
  health?: AppHealth;
};

type AppDescriptionState = {};

class AppDescription extends React.Component<AppDescriptionProps, AppDescriptionState> {
  constructor(props: AppDescriptionProps) {
    super(props);
    this.state = {};
  }

  istioSidecar() {
    let istioSidecar = true; // true until proven otherwise (workload with missing sidecar exists)
    this.props.app.workloads.forEach(wkd => {
      istioSidecar = istioSidecar && wkd.istioSidecar;
    });
    return istioSidecar;
  }

  showOnGraphLink(application: string, namespace: Namespace) {
    return `/graph/namespaces?graphType=app&injectServiceNodes=true&unusedNodes=true&focusSelector=${encodeURI(
      new CytoscapeGraphSelectorBuilder()
        .app(application)
        .nodeType(NodeType.APP)
        .isGroup(null)
        .namespace(namespace.name)
        .build()
    )}`;
  }

  serviceLink(namespace: string, service: string) {
    return '/namespaces/' + namespace + '/services/' + service;
  }

  workloadLink(namespace: string, workload: string) {
    return '/namespaces/' + namespace + '/workloads/' + workload;
  }

  renderServices(namespace: string, workload: string, serviceNames: string[]) {
    const iconType = 'pf';
    const iconName = 'service';
    return serviceNames.map(service => (
      <div key={'workload_' + workload + '_service_' + service} className="ServiceList-Title">
        <Icon type={iconType} name={iconName} className="service-icon" />
        <Link to={this.serviceLink(namespace, service)}>{service}</Link>
      </div>
    ));
  }

  renderWorkloadItem(namespace: string, workload: AppWorkload) {
    /*
      Not sure if we need a common icon per Workload instead of an icon per type of Workload
     */
    const iconName = WorkloadIcon;
    const iconType = 'pf';
    const heading = (
      <div className="ServiceList-Heading">
        <div className="ServiceList-Title">
          <div className="component-label">
            Workload{' '}
            {!workload.istioSidecar && <MissingSidecar style={{ marginLeft: '10px' }} tooltip={true} text={''} />}
          </div>
          <Link to={this.workloadLink(namespace, workload.workloadName)}>{workload.workloadName}</Link>
        </div>
      </div>
    );
    const content = (
      <ListViewItem
        leftContent={<ListViewIcon type={iconType} name={iconName} />}
        key={`AppWorkload_${workload.workloadName}`}
        heading={heading}
      />
    );
    return content;
  }

  renderServiceItem(namespace: string, appName: string, serviceName: string) {
    const iconName = 'service';
    const iconType = 'pf';
    const heading = (
      <div className="ServiceList-Heading">
        <div className="ServiceList-Title">
          <div className="component-label">Service</div>
          <Link to={this.serviceLink(namespace, serviceName)}>{serviceName}</Link>
        </div>
      </div>
    );
    const content = (
      <ListViewItem
        leftContent={<ListViewIcon type={iconType} name={iconName} />}
        key={`AppService_${serviceName}`}
        heading={heading}
      />
    );
    return content;
  }

  renderEmptyItem(type: string) {
    const message = 'No ' + type + ' found for this app.';
    return <ListViewItem description={message} />;
  }

  workloadList() {
    const ns = this.props.app.namespace.name;
    const workloads = this.props.app.workloads;
    return workloads.length > 0
      ? workloads.map(wkd => this.renderWorkloadItem(ns, wkd))
      : this.renderEmptyItem('workloads');
  }

  serviceList() {
    const ns = this.props.app.namespace.name;
    const services = this.props.app.serviceNames;
    return services.length > 0
      ? services.map(sn => this.renderServiceItem(ns, this.props.app.name, sn))
      : this.renderEmptyItem('services');
  }

  render() {
    const app = this.props.app;
    const istioSidecar = this.istioSidecar();
    return app ? (
      <PfInfoCard
        iconType="pf"
        iconName="applications"
        title={app.name}
        istio={istioSidecar}
        showOnGraphLink={this.showOnGraphLink(app.name, app.namespace)}
        items={
          <>
            <Row>
              <Col xs={12} sm={6} md={4} lg={4}>
                <ListView>{this.workloadList()}</ListView>
              </Col>
              <Col xs={12} sm={6} md={4} lg={4}>
                <ListView>{this.serviceList()}</ListView>
              </Col>
              <Col xs={0} sm={0} md={1} lg={1} />
              <Col xs={12} sm={6} md={3} lg={3}>
                <div className="progress-description">
                  <strong>Health</strong>
                </div>
                <HealthIndicator
                  id={app.name}
                  health={this.props.health}
                  mode={DisplayMode.LARGE}
                  tooltipPlacement="left"
                />
              </Col>
            </Row>
          </>
        }
      />
    ) : (
      'Loading'
    );
  }
}

export default AppDescription;
