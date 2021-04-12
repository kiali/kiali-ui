import * as React from 'react';
import { App } from '../../types/App';
import { Card, CardBody, CardHeader, Title } from '@patternfly/react-core';
import DetailDescription from '../../components/Details/DetailDescription';
import { serverConfig } from '../../config';
import Labels from '../../components/Label/Labels';

type AppDescriptionProps = {
  app?: App;
};

class AppDescription extends React.Component<AppDescriptionProps> {
  render() {
    const appLabels: { [key: string]: string } = {};
    if (this.props.app) {
      appLabels[serverConfig.istioLabels.appLabelName] = this.props.app.name;
    }
    return this.props.app ? (
      <Card>
        <CardHeader>
          <Title headingLevel="h3" size="2xl">
            Application
          </Title>
        </CardHeader>
        <CardBody>
          <Labels
            labels={appLabels}
            tooltipMessage={'Workloads and Services grouped by ' + serverConfig.istioLabels.appLabelName + ' label'}
          />
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
