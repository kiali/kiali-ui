import * as React from 'react';
import { Card, CardActions, CardBody, CardHead, CardHeader, Stack, StackItem, Title } from '@patternfly/react-core';
import { DisplayMode, HealthIndicator } from './HealthIndicator';
import { style } from 'typestyle';
import * as H from '../../types/Health';

type Props = {
  name: string;
  health?: H.Health;
};

const titleStyle = style({
  margin: '15px 0 11px 0'
});

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
          <Stack className={'stack_service_details'}>
            <StackItem id={'health'}>
              <Title headingLevel="h3" size="lg" className={titleStyle}>
                Overall Health
              </Title>
              <HealthIndicator id={this.props.name} health={this.props.health} mode={DisplayMode.LARGE} />
            </StackItem>
          </Stack>
        </CardBody>
      </Card>
    );
  }
}

export default HealthCard;
