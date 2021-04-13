import * as React from 'react';
import { App } from '../../types/App';
import { Badge, Card, CardBody, CardHeader, Title, Tooltip, TooltipPosition } from '@patternfly/react-core';
import DetailDescription from '../../components/Details/DetailDescription';
import { serverConfig } from '../../config';
import Labels from '../../components/Label/Labels';
import { style } from 'typestyle';

type AppDescriptionProps = {
  app?: App;
};

const iconStyle = style({
  margin: '0 0 0 0',
  padding: '0 0 0 0',
  display: 'inline-block',
  verticalAlign: '2px !important'
});

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
            <div key="service-icon" className={iconStyle}>
              <Tooltip position={TooltipPosition.top} content={<>Application</>}>
                <Badge className={'virtualitem_badge_definition'}>A</Badge>
              </Tooltip>
            </div>
            {this.props.app.name}
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
