import * as React from 'react';
import { Card, CardBody, Stack, StackItem, Tab, Tabs, Title, Tooltip } from '@patternfly/react-core';
import { EyeIcon } from '@patternfly/react-icons';
import { style } from 'typestyle';
import LocalTime from '../../../components/Time/LocalTime';
import { Endpoints, ServicePort } from '../../../types/ServiceInfo';
import { ObjectCheck, ObjectValidation } from '../../../types/IstioObjects';
import { ValidationObjectSummary } from '../../../components/Validations/ValidationObjectSummary';
import ValidationList from '../../../components/Validations/ValidationList';
import Labels from '../../../components/Label/Labels';
import { AdditionalItem } from 'types/Workload';
import { TextOrLink } from 'components/TextOrLink';
import { renderAPILogo } from 'components/Logo/Logos';
import './ServiceDescription.css';
import MissingSidecar from '../../../components/MissingSidecar/MissingSidecar';

interface ServiceInfoDescriptionProps {
  name: string;
  namespace: string;
  createdAt: string;
  resourceVersion: string;
  additionalDetails: AdditionalItem[];
  istioEnabled?: boolean;
  labels?: { [key: string]: string };
  selectors?: { [key: string]: string };
  type?: string;
  ip?: any;
  externalName?: string;
  ports?: ServicePort[];
  endpoints?: Endpoints[];
  validations?: ObjectValidation;
}

type State = {
  serviceInfoTabKey: number;
};

const listStyle = style({
  listStyleType: 'none',
  padding: 0
});

const ExternalNameType = 'ExternalName';

class ServiceDescription extends React.Component<ServiceInfoDescriptionProps, State> {
  constructor(props: ServiceInfoDescriptionProps) {
    super(props);
    this.state = {
      serviceInfoTabKey: 0
    };
  }

  serviceInfoHandleTabClick = (_event, tabIndex) => {
    this.setState({
      serviceInfoTabKey: tabIndex
    });
  };

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
        <CardBody>
          <Title headingLevel="h3" size="2xl">
            {' '}
            Service{' '}
          </Title>
          <Tabs
            isFilled={true}
            activeKey={this.state.serviceInfoTabKey}
            onSelect={this.serviceInfoHandleTabClick}
            style={{ marginTop: '20px' }}
          >
            <Tab eventKey={0} title={'Properties'}>
              <Stack gutter={'md'} style={{ marginTop: '20px' }}>
                <StackItem id="name">
                  <Title headingLevel="h6" size="md">
                    {' '}
                    Name{' '}
                  </Title>
                  {this.props.name}
                  {!this.props.istioEnabled && (
                    <span style={{ marginLeft: '10px' }}>
                      <MissingSidecar namespace={this.props.namespace} />
                    </span>
                  )}
                </StackItem>
                <StackItem id={'labels'}>
                  <Title headingLevel="h6" size="md">
                    {' '}
                    Labels{' '}
                  </Title>
                  <Labels labels={this.props.labels || {}} />
                </StackItem>
                <StackItem id={'resource_version'}>
                  <Title headingLevel="h6" size="md">
                    {' '}
                    Resource Version{' '}
                  </Title>
                  {this.props.resourceVersion}
                </StackItem>
                <StackItem id={'selectors'}>
                  <Title headingLevel="h6" size="md">
                    {' '}
                    Selectors{' '}
                  </Title>
                  <Labels labels={this.props.selectors || {}} />
                </StackItem>
                <StackItem id={'created_at'}>
                  <Title headingLevel="h6" size="md">
                    {' '}
                    Created at{' '}
                  </Title>
                  <LocalTime time={this.props.createdAt} />
                </StackItem>
                {this.props.additionalDetails.map((additionalItem, idx) => {
                  return (
                    <StackItem key={'additional-details-' + idx} id={'additional-details-' + idx}>
                      <Title headingLevel="h6" size="md">
                        {' '}
                        {additionalItem.title}{' '}
                      </Title>
                      {additionalItem.icon && renderAPILogo(additionalItem.icon, undefined, idx)}
                      <TextOrLink text={additionalItem.value} urlTruncate={64} />
                    </StackItem>
                  );
                })}
              </Stack>
            </Tab>
            <Tab eventKey={1} title={'Network'}>
              <Stack gutter={'md'} style={{ marginTop: '20px' }}>
                <StackItem id={'ip'}>
                  <Title headingLevel="h6" size="md">
                    {' '}
                    {this.props.type !== ExternalNameType ? 'Service IP' : 'ExternalName'}{' '}
                  </Title>
                  {this.props.type !== ExternalNameType
                    ? this.props.ip
                      ? this.props.ip
                      : ''
                    : this.props.externalName
                    ? this.props.externalName
                    : ''}
                </StackItem>
                <StackItem id={'endpoints'}>
                  <Title headingLevel="h6" size="md">
                    {' '}
                    Endpoints{' '}
                  </Title>
                  <Stack gutter={'md'}>
                    {(this.props.endpoints || []).map((endpoint, i) =>
                      (endpoint.addresses || []).map((address, u) => (
                        <StackItem key={'endpoint_' + i + '_address_' + u}>
                          {address.name !== '' ? (
                            <Tooltip content={<>{address.name}</>}>
                              <span>
                                <EyeIcon /> {address.ip}
                              </span>
                            </Tooltip>
                          ) : (
                            <>{address.name}</>
                          )}
                        </StackItem>
                      ))
                    )}
                  </Stack>
                </StackItem>
                <StackItem id={'ports'}>
                  <Title headingLevel="h6" size="md">
                    <ValidationObjectSummary
                      id={this.props.name + '-config-validation'}
                      validations={this.props.validations ? [this.props.validations] : []}
                    />
                    <span style={{ marginLeft: '10px' }}>Ports</span>
                  </Title>
                  <ul className={listStyle}>
                    {(this.props.ports || []).map((port, i) => (
                      <li key={'port_' + i}>
                        {this.hasIssue(i) ? this.getPortOver(i) : undefined} {port.protocol} {port.name} ({port.port})
                      </li>
                    ))}
                  </ul>
                </StackItem>
                <StackItem id={'type'}>
                  <Title headingLevel="h6" size="md">
                    {' '}
                    Type{' '}
                  </Title>
                  {this.props.type ? this.props.type : ''}
                </StackItem>
              </Stack>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    );
  }
}

export default ServiceDescription;
