import * as React from 'react';
import { Link } from 'react-router-dom';
import { DestinationService } from '../../../types/Workload';

interface WorkloadDestinationsProps {
  destinationServices: DestinationService[];
}

class WorkloadDestinations extends React.Component<WorkloadDestinationsProps> {
  render() {
    return (
      <ul className="workload-destination-services">
        {this.props.destinationServices.map(service => (
          <li key={`dest-service-${service.name}`}>
            <Link to={`/namespaces/${service.namespace}/services/${service.name}`}>{service.name}</Link>
          </li>
        ))}
      </ul>
    );
  }
}

export default WorkloadDestinations;
