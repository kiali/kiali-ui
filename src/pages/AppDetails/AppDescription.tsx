import * as React from 'react';
import { App } from '../../types/App';
import { Card, CardBody, CardHeader, Title } from '@patternfly/react-core';
import DetailDescription from '../../components/Details/DetailDescription';

type AppDescriptionProps = {
  app?: App;
};

class AppDescription extends React.Component<AppDescriptionProps> {
  render() {
    return this.props.app ? (
      <Card>
        <CardHeader>
          <Title headingLevel="h3" size="2xl">
            Application
          </Title>
        </CardHeader>
        <CardBody>
          <DetailDescription
            namespace={this.props.app ? this.props.app.namespace.name : ''}
            workloads={this.props.app ? this.props.app.workloads : []}
            services={this.props.app ? this.props.app.serviceNames : []}
          />
        </CardBody>
      </Card>
    ) : (
      'Loading'
    );
  }
}

export default AppDescription;
