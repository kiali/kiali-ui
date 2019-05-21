import * as React from 'react';
import { Link } from 'react-router-dom';
import { Icon, OverlayTrigger, Tooltip } from 'patternfly-react';
import { Paths } from '../../config';

type Props = {
  name: string;
};

class OverviewCardLinks extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div style={{ marginTop: '10px' }}>
        <OverlayTrigger key="ot_graph" placement="top" overlay={<Tooltip id="tt_graph">Go to graph...</Tooltip>}>
          <Link to={`/graph/namespaces?namespaces=` + this.props.name}>
            <Icon type="pf" name="topology" style={{ paddingLeft: 10, paddingRight: 10 }} />
          </Link>
        </OverlayTrigger>
        <OverlayTrigger key="ot_apps" placement="top" overlay={<Tooltip id="tt_apps">Go to applications...</Tooltip>}>
          <Link to={`/${Paths.APPLICATIONS}?namespaces=` + this.props.name}>
            <Icon type="pf" name="applications" style={{ paddingLeft: 10, paddingRight: 10 }} />
          </Link>
        </OverlayTrigger>
        <OverlayTrigger
          key="ot_workloads"
          placement="top"
          overlay={<Tooltip id="tt_workloads">Go to workloads...</Tooltip>}
        >
          <Link to={`/${Paths.WORKLOADS}?namespaces=` + this.props.name}>
            <Icon type="pf" name="bundle" style={{ paddingLeft: 10, paddingRight: 10 }} />
          </Link>
        </OverlayTrigger>
        <OverlayTrigger
          key="ot_services"
          placement="top"
          overlay={<Tooltip id="tt_services">Go to services...</Tooltip>}
        >
          <Link to={`/${Paths.SERVICES}?namespaces=` + this.props.name}>
            <Icon type="pf" name="service" style={{ paddingLeft: 10, paddingRight: 10 }} />
          </Link>
        </OverlayTrigger>
        <OverlayTrigger
          key="ot_istio"
          placement="top"
          overlay={<Tooltip id="tt_istio">Go to Istio configs...</Tooltip>}
        >
          <Link to={`/${Paths.ISTIO}?namespaces=` + this.props.name}>
            <Icon type="pf" name="template" style={{ paddingLeft: 10, paddingRight: 10 }} />
          </Link>
        </OverlayTrigger>
      </div>
    );
  }
}

export default OverviewCardLinks;
