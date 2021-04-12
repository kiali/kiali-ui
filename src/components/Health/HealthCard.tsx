import * as React from 'react';
import { Card, CardActions, CardBody, CardHead, CardHeader, Title } from '@patternfly/react-core';
import { DisplayMode, HealthIndicator } from './HealthIndicator';
import * as H from '../../types/Health';

type Props = {
  name: string;
  health?: H.Health;
};

class HealthCard extends React.PureComponent<Props> {
  render() {
    return (
      <Card>
        <CardHead>
          <CardActions />
          <CardHeader>
            <Title style={{ float: 'left' }} headingLevel="h3" size="2xl">
              Health
            </Title>
          </CardHeader>
        </CardHead>
        <CardBody>
          <HealthIndicator id={this.props.name} health={this.props.health} mode={DisplayMode.LARGE} />
        </CardBody>
      </Card>
    );
  }
}

export default HealthCard;
