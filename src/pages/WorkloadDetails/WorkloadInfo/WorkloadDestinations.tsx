import * as React from 'react';
import { Row, Col } from 'patternfly-react';
import { Link } from 'react-router-dom';
import { DestinationService } from '../../../types/Workload';

interface WorkloadDestinationsProps {
  destinationServices: DestinationService[];
}

class WorkloadDestinations extends React.Component<WorkloadDestinationsProps> {
  render() {
    return (
      <Row className="card-pf-body">
        <Col xs={12}>
          <ul className="workload-destination-services">
            {this.props.destinationServices.map(service => (
              <li key={`dest-service-${service.name}`}>
                <Link to={`/namespaces/${service.namespace}/services/${service.name}`}>{service.name}</Link>
              </li>
            ))}
          </ul>
        </Col>
      </Row>
    );
  }
}

export default WorkloadDestinations;
