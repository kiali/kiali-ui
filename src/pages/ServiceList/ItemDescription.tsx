import * as React from 'react';
import { Col, Row } from 'patternfly-react';
import { ServiceListItem } from '../../types/ServiceList';
import { ServiceHealth } from '../../types/Health';
import { DisplayMode, HealthIndicator } from '../../components/Health/HealthIndicator';
import MissingSidecar from '../../components/MissingSidecar/MissingSidecar';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import { ConfigIndicator } from '../../components/ConfigValidation/ConfigIndicator';
import { ApiTypeIndicator } from '../../components/ApiDocumentation/ApiTypeIndicator';

interface Props {
  item: ServiceListItem;
  hasApiColumn: boolean;
}
interface State {
  health?: ServiceHealth;
  nbColumns: number;
}

export default class ItemDescription extends React.PureComponent<Props, State> {
  private promises = new PromisesRegistry();

  constructor(props: Props) {
    super(props);
    this.state = { health: undefined, nbColumns: props.hasApiColumn ? 4 : 3 };
  }

  componentDidMount() {
    this.onItemChanged(this.props.item);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.item.healthPromise !== prevProps.item.healthPromise) {
      this.onItemChanged(this.props.item);
    }
  }

  componentWillUnmount() {
    this.promises.cancelAll();
  }

  onItemChanged(item: ServiceListItem) {
    this.promises
      .register('health', item.healthPromise)
      .then(h => this.setState({ health: h }))
      .catch(err => {
        if (!err.isCanceled) {
          this.setState({ health: undefined });
          throw err;
        }
      });
  }

  render() {
    var columnSize = 12 / this.state.nbColumns;
    return this.state.health ? (
      <Row>
        <Col xs={12} sm={12} md={columnSize} lg={columnSize}>
          <strong>Health: </strong>
          <HealthIndicator id={this.props.item.name} health={this.state.health} mode={DisplayMode.SMALL} />
        </Col>
        <Col xs={12} sm={12} md={columnSize} lg={columnSize}>
          {!this.props.item.istioSidecar && <MissingSidecar />}
        </Col>
        <Col xs={12} sm={12} md={columnSize} lg={columnSize}>
          <strong>Config: </strong>{' '}
          <ConfigIndicator
            id={this.props.item.name + '-config-validation'}
            validations={[this.props.item.validation]}
            size="medium"
          />
        </Col>
        <Col xs={12} sm={12} md={columnSize} lg={columnSize}>
          // If no api, the column is empty and not displayed
          {this.props.item.apiType && (
            <>
              <strong>Api: </strong>
              <ApiTypeIndicator apiType={this.props.item.apiType} />
            </>
          )}
        </Col> 
      </Row>
    ) : (
      <span />
    );
  }
}
