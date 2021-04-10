import * as React from 'react';
import { Card, CardBody, CardHeader, Title, Tooltip } from '@patternfly/react-core';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';
import { EyeIcon } from '@patternfly/react-icons';
import { style } from 'typestyle';
import { ObjectCheck, ObjectValidation } from '../../types/IstioObjects';
import ValidationList from '../../components/Validations/ValidationList';

type Props = {
  serviceDetails: ServiceDetailsInfo;
  validations?: ObjectValidation;
};

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

class ServiceNetwork extends React.Component<Props> {
  getPortOver(portId: number) {
    return <ValidationList checks={this.getPortChecks(portId)} />;
  }

  getPortChecks(portId: number): ObjectCheck[] {
    return this.props.validations
      ? this.props.validations.checks.filter(c => c.path === 'spec/ports[' + portId + ']')
      : [];
  }

  hasIssue(portId: number): boolean {
    return this.getPortChecks(portId).length > 0;
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <Title headingLevel="h3" size="2xl">
            Network
          </Title>
        </CardHeader>
        <CardBody>
          <div key="network-list" className={resourceListStyle}>
            <ul style={{ listStyleType: 'none' }}>
              <li>
                <span>Type</span>
                {this.props.serviceDetails.service.type}
              </li>
              <li>
                <span>{this.props.serviceDetails.service.type !== 'ExternalName' ? 'Service IP' : 'ExternalName'}</span>
                {this.props.serviceDetails.service.type !== 'ExternalName'
                  ? this.props.serviceDetails.service.ip
                    ? this.props.serviceDetails.service.ip
                    : ''
                  : this.props.serviceDetails.service.externalName
                  ? this.props.serviceDetails.service.externalName
                  : ''}
              </li>
              <li>
                <span>Endpoints</span>
                <div style={{ display: 'inline-block' }}>
                  {(this.props.serviceDetails.endpoints || []).map((endpoint, i) => {
                    return (endpoint.addresses || []).map((address, u) => (
                      <div key={'endpoint_' + i + '_address_' + u}>
                        {address.name !== '' ? (
                          <Tooltip
                            content={
                              <>
                                {address.kind}: {address.name}
                              </>
                            }
                          >
                            <span>
                              <EyeIcon /> {address.ip}
                            </span>
                          </Tooltip>
                        ) : (
                          <>{address.name}</>
                        )}
                      </div>
                    ));
                  })}
                </div>
              </li>
              <li>
                <span>Ports</span>
                <div style={{ display: 'inline-block' }}>
                  {(this.props.serviceDetails.service.ports || []).map((port, i) => {
                    return (
                      <div key={'port_' + i}>
                        {this.hasIssue(i) ? this.getPortOver(i) : undefined} {port.name} {port.port}/{port.protocol}
                      </div>
                    );
                  })}
                </div>
              </li>
            </ul>
          </div>
        </CardBody>
      </Card>
    );
  }
}

export default ServiceNetwork;
