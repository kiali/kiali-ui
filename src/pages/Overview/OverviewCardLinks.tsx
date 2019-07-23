import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { ApplicationsIcon, BundleIcon, PficonTemplateIcon, ServiceIcon, TopologyIcon } from '@patternfly/react-icons';

import { style } from 'typestyle';

import { Paths } from '../../config';

const linkStyle = style({
  paddingLeft: 10,
  paddingRight: 10
});

type Props = {
  name: string;
};
class OverviewCardLinks extends React.Component<Props> {
  render() {
    return (
      <div style={{ marginTop: '10px' }}>
        <Tooltip position={TooltipPosition.top} content={<>Go to graph</>}>
          <Link to={`/graph/namespaces?namespaces=` + this.props.name} className={linkStyle}>
            <TopologyIcon />
          </Link>
        </Tooltip>
        <Tooltip position={TooltipPosition.top} content={<>Go to applications</>}>
          <Link to={`/${Paths.APPLICATIONS}?namespaces=` + this.props.name} className={linkStyle}>
            <ApplicationsIcon />
          </Link>
        </Tooltip>
        <Tooltip position={TooltipPosition.top} content={<>Go to workloads</>}>
          <Link to={`/${Paths.WORKLOADS}?namespaces=` + this.props.name} className={linkStyle}>
            <BundleIcon />
          </Link>
        </Tooltip>
        <Tooltip position={TooltipPosition.top} content={<>Go to services</>}>
          <Link to={`/${Paths.SERVICES}?namespaces=` + this.props.name} className={linkStyle}>
            <ServiceIcon />
          </Link>
        </Tooltip>
        <Tooltip position={TooltipPosition.top} content={<>Go to Istio config</>}>
          <Link to={`/${Paths.ISTIO}?namespaces=` + this.props.name} className={linkStyle}>
            <PficonTemplateIcon />
          </Link>
        </Tooltip>
      </div>
    );
  }
}

export default OverviewCardLinks;
