import * as React from 'react';
import { DestinationRule, EditorLink } from '../../../types/ServiceInfo';
import { Col, Row } from 'patternfly-react';
import LocalTime from '../../../components/Time/LocalTime';
import DetailObject from '../../../components/Details/DetailObject';
import { Link } from 'react-router-dom';

interface ServiceInfoDestinationRulesProps extends EditorLink {
  destinationRules?: DestinationRule[];
}

class ServiceInfoDestinationRules extends React.Component<ServiceInfoDestinationRulesProps> {
  constructor(props: ServiceInfoDestinationRulesProps) {
    super(props);
  }

  render() {
    return (
      <div className="card-pf">
        <Row className="row-cards-pf">
          <Col xs={12} sm={12} md={12} lg={12}>
            {(this.props.destinationRules || []).map((destinationRule, i) => (
              <div className="card-pf-body" key={'destinationRule' + i}>
                <h3>
                  <Link to={this.props.editorLink + '?destinationrule=' + destinationRule.name}>
                    {destinationRule.name}
                  </Link>
                </h3>
                <div>
                  <strong>Created at</strong>: <LocalTime time={destinationRule.createdAt} />
                </div>
                <div>
                  <strong>Resource Version</strong>: {destinationRule.resourceVersion}
                </div>
                {destinationRule.host ? <DetailObject name="Host" detail={destinationRule.host} /> : undefined}
                {destinationRule.trafficPolicy ? (
                  <DetailObject name="Traffic Policy" detail={destinationRule.trafficPolicy} />
                ) : (
                  undefined
                )}
                {destinationRule.subsets && destinationRule.subsets.length > 0 ? (
                  <DetailObject name="Subsets" detail={destinationRule.subsets} labels={['labels']} />
                ) : (
                  undefined
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

export default ServiceInfoDestinationRules;
