import * as React from 'react';
import MissingSidecar from '../../components/MissingSidecar/MissingSidecar';
import { App, AppWorkload } from '../../types/App';
import { Link } from 'react-router-dom';
import { Badge, Card, CardBody, CardHeader, Title, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { style } from 'typestyle';

const iconStyle = style({
  margin: '0 0 0 0',
  padding: '0 0 8px 0',
  display: 'inline-block'
});

const resourceListStyle = style({
  margin: '0px 0 11px 0'
});

const titleStyle = style({
  margin: '15px 0 11px 0'
});

type AppDescriptionProps = {
  app?: App;
};

class AppDescription extends React.Component<AppDescriptionProps> {
  private serviceLink(namespace: string, service: string) {
    return '/namespaces/' + namespace + '/services/' + service;
  }

  private workloadLink(namespace: string, workload: string) {
    return '/namespaces/' + namespace + '/workloads/' + workload;
  }

  private renderWorkloadItem(namespace: string, workload: AppWorkload) {
    return (
      <li key={`AppWorkload_${workload.workloadName}`}>
        <span>
          <div key="workload-icon" className={iconStyle}>
            <Tooltip position={TooltipPosition.top} content={<>Workload</>}>
              <Badge className={'virtualitem_badge_definition'}>W</Badge>
            </Tooltip>
          </div>
          <Link to={this.workloadLink(namespace, workload.workloadName)}>{workload.workloadName}</Link>
          {!workload.istioSidecar && (
            <MissingSidecar namespace={namespace} tooltip={true} style={{ marginLeft: '10px' }} text={''} />
          )}
        </span>
      </li>
    );
  }

  private renderServiceItem(namespace: string, _appName: string, serviceName: string) {
    return (
      <li key={`AppService_${serviceName}`}>
        <div key="service-icon" className={iconStyle}>
          <Tooltip position={TooltipPosition.top} content={<>Service</>}>
            <Badge className={'virtualitem_badge_definition'}>S</Badge>
          </Tooltip>
        </div>
        <span>
          <Link to={this.serviceLink(namespace, serviceName)}>{serviceName}</Link>
        </span>
      </li>
    );
  }

  private renderEmptyItem(type: string) {
    const message = 'No ' + type + ' found for this app.';
    return <div> {message} </div>;
  }

  private workloadList() {
    const ns = this.props.app?.namespace.name || '';
    const workloads = this.props.app?.workloads || [];
    const workloadList =
      workloads.length > 0 ? workloads.map(wkd => this.renderWorkloadItem(ns, wkd)) : this.renderEmptyItem('workloads');

    return [
      <div key="workload-list" className={resourceListStyle}>
        <Title headingLevel="h3" size="lg" className={titleStyle}>
          Workloads
        </Title>
        <ul style={{ listStyleType: 'none' }}>{workloadList}</ul>
      </div>
    ];
  }

  private serviceList() {
    const ns = this.props.app?.namespace.name || '';
    const services = this.props.app?.serviceNames || [];
    const serviceList =
      services.length > 0
        ? services.map(sn => this.renderServiceItem(ns, this.props.app!.name, sn))
        : this.renderEmptyItem('services');

    return [
      <div key="service-list" className={resourceListStyle}>
        <Title headingLevel="h3" size="lg" className={titleStyle}>
          Services
        </Title>
        <ul style={{ listStyleType: 'none' }}>{serviceList}</ul>
      </div>
    ];
  }

  render() {
    return this.props.app ? (
      <Card>
        <CardHeader>
          <Title headingLevel="h3" size="2xl">
            Application
          </Title>
        </CardHeader>
        <CardBody>
          {this.workloadList()}
          {this.serviceList()}
        </CardBody>
      </Card>
    ) : (
      'Loading'
    );
  }
}

export default AppDescription;
