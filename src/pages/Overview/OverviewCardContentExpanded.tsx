import * as React from 'react';
import { Link } from 'react-router-dom';
import { Text, TextVariants } from '@patternfly/react-core';

import { DEGRADED, FAILURE, HEALTHY } from '../../types/Health';
import OverviewStatus from './OverviewStatus';
import { OverviewType } from './OverviewToolbar';
import { NamespaceStatus } from './NamespaceInfo';
import { switchType } from './OverviewHelper';
import { Paths } from '../../config';
import { TimeSeries } from '../../types/Metrics';
import { DurationInSeconds } from '../../types/Common';
import OverviewCardSparkline from './OverviewCardSparkline';
import OverviewCardBars from './OverviewCardBars';

type Props = {
  name: string;
  type: OverviewType;
  duration: DurationInSeconds;
  status: NamespaceStatus;
  metrics?: TimeSeries[];
};

class OverviewCardContentExpanded extends React.Component<Props> {
  render() {
    return (
      <>
        <div style={{ width: '100%', display: 'inline-block', height: '215px' }}>{this.renderLeft()}</div>
      </>
    );
  }

  renderLeft(): JSX.Element {
    const targetPage = switchType(this.props.type, Paths.APPLICATIONS, Paths.SERVICES, Paths.WORKLOADS);
    const name = this.props.name;
    const status = this.props.status;
    const nbItems =
      status.inError.length + status.inWarning.length + status.inSuccess.length + status.notAvailable.length;
    let text: string;
    if (nbItems === 1) {
      text = switchType(this.props.type, '1 Application', '1 Service', '1 Workload');
    } else {
      text = nbItems + switchType(this.props.type, ' Applications', ' Services', ' Workloads');
    }
    const mainLink = <Link to={`/${targetPage}?namespaces=${name}`}>{text}</Link>;
    if (nbItems === status.notAvailable.length) {
      return (
        <>
          {mainLink}
          <Text component={TextVariants.h2}>N/A</Text>
        </>
      );
    }
    return (
      <>
        {mainLink}
        <OverviewCardBars status={this.props.status} />
        <OverviewCardSparkline metrics={this.props.metrics} duration={this.props.duration} />
        <div>
          <Text component={TextVariants.h2} style={{ marginTop: 0 }}>
            {status.inError.length > 0 && (
              <OverviewStatus
                id={name + '-failure'}
                namespace={name}
                status={FAILURE}
                items={status.inError}
                targetPage={targetPage}
              />
            )}
            {status.inWarning.length > 0 && (
              <OverviewStatus
                id={name + '-degraded'}
                namespace={name}
                status={DEGRADED}
                items={status.inWarning}
                targetPage={targetPage}
              />
            )}
            {status.inSuccess.length > 0 && (
              <OverviewStatus
                id={name + '-healthy'}
                namespace={name}
                status={HEALTHY}
                items={status.inSuccess}
                targetPage={targetPage}
              />
            )}
          </Text>
        </div>
      </>
    );
  }
}

export default OverviewCardContentExpanded;
