import * as React from 'react';
import { Col, Row } from 'patternfly-react';
import LocalTime from '../../../components/Time/LocalTime';
import Badge from '../../../components/Badge/Badge';
import { Pod } from '../../../types/ServiceInfo';
import { PfColors } from '../../../components/Pf/PfColors';

interface Props {
  pods?: Pod[];
}

class ServiceInfoPods extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    if (props.pods) {
      props.pods.forEach(pod => {
        if (pod.annotations && pod.annotations.hasOwnProperty('kubernetes.io/created-by')) {
          pod.k8sCreatedBy = JSON.parse(pod.annotations['kubernetes.io/created-by']);
        }
        if (pod.annotations && pod.annotations.hasOwnProperty('sidecar.istio.io/status')) {
          pod.istioSideCar = JSON.parse(pod.annotations['sidecar.istio.io/status']);
        }
      });
    }
  }

  render() {
    return (
      <div className="card-pf">
        <Row className="row-cards-pf">
          <Col xs={12} sm={12} md={12} lg={12}>
            {(this.props.pods || []).map((pod, u) => (
              <div className="card-pf-body" key={'pods_' + u}>
                <h3>{pod.name}</h3>
                <div key="labels">
                  {Object.keys(pod.labels || {}).map((key, i) => (
                    <Badge
                      key={'pod_' + i}
                      scale={0.8}
                      style="plastic"
                      color={PfColors.Green}
                      leftText={key}
                      rightText={pod.labels ? pod.labels[key] : ''}
                    />
                  ))}
                </div>
                <div>
                  <span>
                    <strong>Created at: </strong>
                    <LocalTime time={pod.created_at} />
                  </span>
                </div>
                {pod.k8sCreatedBy && (
                  <div>
                    <span>
                      <strong>Created by: </strong>
                      {pod.k8sCreatedBy.reference.name + ' (' + pod.k8sCreatedBy.reference.kind + ')'}
                    </span>
                  </div>
                )}
                {pod.istioSideCar && (
                  <div>
                    <span>
                      <strong>Istio init containers: </strong>
                      {pod.istioSideCar.initContainers.join(', ')}
                    </span>
                  </div>
                )}
                {pod.istioSideCar && (
                  <div>
                    <span>
                      <strong>Istio containers: </strong>
                      {pod.istioSideCar.containers.join(', ')}
                    </span>
                  </div>
                )}
                <hr />
              </div>
            ))}
          </Col>
        </Row>
      </div>
    );
  }
}

export default ServiceInfoPods;
