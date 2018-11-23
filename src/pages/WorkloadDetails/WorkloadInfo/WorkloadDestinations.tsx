import * as React from 'react';
import { Row, Col } from 'patternfly-react';
import { Link } from 'react-router-dom';
import { DestinationService } from '../../../types/Workload';

interface WorkloadDestinationsProps {
  workloadName: string;
  destinationServices: DestinationService[];
}

class WorkloadDestinations extends React.Component<WorkloadDestinationsProps> {
  render() {
    return (
      <Row className="card-pf-body">
        <Col xs={12}>
          <div className="progress-description">
            <strong>From: </strong>
            {this.props.workloadName}
          </div>
          <ul className="workload-destination-services" style={{ listStyleType: 'none' }}>
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
