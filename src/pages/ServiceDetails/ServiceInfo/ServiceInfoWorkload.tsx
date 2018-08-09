import * as React from 'react';
import { Col, Row } from 'patternfly-react';
import { WorkloadOverview } from '../../../types/ServiceInfo';
import Label from '../../../components/Label/Label';

interface ServiceInfoWorkloadProps {
  workloads?: WorkloadOverview[];
}

class ServiceInfoWorkload extends React.Component<ServiceInfoWorkloadProps> {
  constructor(props: ServiceInfoWorkloadProps) {
    super(props);
  }

  render() {
    return (
      <div className="card-pf">
        <Row className="row-cards-pf">
          <Col xs={12} sm={12} md={12} lg={12}>
            {(this.props.workloads || []).map((workload, u) => (
              <div className="card-pf-body" key={'workloads_' + u}>
                <h3>{workload.name}</h3>
                <div key="labels" className="label-collection">
                  {Object.keys(workload.labels || {}).map((key, i) => (
                    <Label key={'workload_' + i} name={key} value={workload.labels ? workload.labels[key] : ''} />
                  ))}
                </div>
                <hr />
              </div>
            ))}
          </Col>
        </Row>
      </div>
    );
  }
}

export default ServiceInfoWorkload;
