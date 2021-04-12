import * as React from 'react';
import { AppWorkload } from '../../types/App';
import { Badge, Title, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { style } from 'typestyle';
import { Link } from 'react-router-dom';
import MissingSidecar from '../MissingSidecar/MissingSidecar';

type Props = {
  namespace: string;
  apps?: string[];
  workloads?: AppWorkload[];
  services?: string[];
};

const iconStyle = style({
  margin: '0 0 0 0',
  padding: '0 0 0 0',
  display: 'inline-block'
});

const resourceListStyle = style({
  margin: '0px 0 11px 0'
});

const titleStyle = style({
  margin: '15px 0 11px 0'
});

class DetailDescription extends React.PureComponent<Props> {
  private renderAppItem(namespace: string, appName: string) {
    return (
      <li key={`App_${appName}`}>
        <div key="service-icon" className={iconStyle}>
          <Tooltip position={TooltipPosition.top} content={<>Application</>}>
            <Badge className={'virtualitem_badge_definition'}>A</Badge>
          </Tooltip>
        </div>
        <span>
          <Link to={'/namespaces/' + namespace + '/applications/' + appName}>{appName}</Link>
        </span>
      </li>
    );
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
          <Link to={'/namespaces/' + namespace + '/workloads/' + workload.workloadName}>{workload.workloadName}</Link>
          {!workload.istioSidecar && (
            <MissingSidecar namespace={namespace} tooltip={true} style={{ marginLeft: '10px' }} text={''} />
          )}
        </span>
      </li>
    );
  }

  private renderServiceItem(namespace: string, serviceName: string) {
    return (
      <li key={`Service_${serviceName}`}>
        <div key="service-icon" className={iconStyle}>
          <Tooltip position={TooltipPosition.top} content={<>Service</>}>
            <Badge className={'virtualitem_badge_definition'}>S</Badge>
          </Tooltip>
        </div>
        <span>
          <Link to={'/namespaces/' + namespace + '/services/' + serviceName}>{serviceName}</Link>
        </span>
      </li>
    );
  }

  private renderEmptyItem(type: string) {
    const message = 'No ' + type + ' found';
    return <div> {message} </div>;
  }

  private appList() {
    const applicationList =
      this.props.apps && this.props.apps.length > 0
        ? this.props.apps.map(name => this.renderAppItem(this.props.namespace, name))
        : this.renderEmptyItem('applications');

    return [
      <div key="service-list" className={resourceListStyle}>
        <Title headingLevel="h3" size="lg" className={titleStyle}>
          Applications
        </Title>
        <ul style={{ listStyleType: 'none' }}>{applicationList}</ul>
      </div>
    ];
  }

  private workloadList() {
    const workloadList =
      this.props.workloads && this.props.workloads.length > 0
        ? this.props.workloads.map(wkd => this.renderWorkloadItem(this.props.namespace, wkd))
        : this.renderEmptyItem('workloads');

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
    const serviceList =
      this.props.services && this.props.services.length > 0
        ? this.props.services.map(name => this.renderServiceItem(this.props.namespace, name))
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
    return (
      <>
        {this.props.apps !== undefined && this.appList()}
        {this.props.workloads !== undefined && this.workloadList()}
        {this.props.services !== undefined && this.serviceList()}
      </>
    );
  }
}

export default DetailDescription;
