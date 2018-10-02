import * as React from 'react';
import { Badge, ListViewItem, ListViewIcon } from 'patternfly-react';
import { IstioLogo } from '../../config';
import { WorkloadIcons, WorkloadListItem, worloadLink } from '../../types/Workload';
import { PfColors } from '../../components/Pf/PfColors';
import { Link } from 'react-router-dom';
import * as API from '../../services/Api';
import { authentication } from '../../utils/Authentication';
import { WorkloadHealth } from '../../types/Health';
import { DisplayMode, HealthIndicator } from '../../components/Health/HealthIndicator';
import ErrorRate from './ErrorRate';

type ItemDescriptionState = {
  health?: WorkloadHealth;
};

type ItemDescriptionProps = {
  workloadItem: WorkloadListItem;
  position: Number;
};

class ItemDescription extends React.Component<ItemDescriptionProps, ItemDescriptionState> {
  constructor(props: ItemDescriptionProps) {
    super(props);
    this.state = {
      health: undefined
    };
    this.fetchHealth();
  }

  componentDidMount() {
    this.fetchHealth();
  }

  componentDidUpdate(prevProps: ItemDescriptionProps) {
    if (this.props.workloadItem !== prevProps.workloadItem) {
      this.fetchHealth();
    }
  }

  fetchHealth = () => {
    API.getWorkloadHealth(
      authentication(),
      this.props.workloadItem.namespace,
      this.props.workloadItem.workload.name,
      600
    )
      .then(response => {
        this.setState({ health: response });
      })
      .catch(error => {
        console.log(error);
        this.setState({ health: undefined });
      });
  };

  render() {
    let namespace = this.props.workloadItem.namespace;
    let object = this.props.workloadItem.workload;
    let iconName = WorkloadIcons[object.type];
    let iconType = 'pf';
    const heading = (
      <div className="ServiceList-Heading">
        <div className="ServiceList-IstioLogo">
          {object.istioSidecar && <img className="IstioLogo" src={IstioLogo} alt="Istio sidecar" />}
        </div>
        <div className="ServiceList-Title">
          {object.name}
          <small>{namespace}</small>
          <small>{object.type}</small>
        </div>
      </div>
    );
    const itemDescription = (
      <table style={{ width: '50em', tableLayout: 'fixed' }}>
        <tbody>
          <tr>
            {this.state.health && (
              <td>
                <strong>Health: </strong>
                <HealthIndicator id={object.name} health={this.state.health} mode={DisplayMode.SMALL} />
              </td>
            )}
            {this.state.health && (
              <td>
                <ErrorRate requestHealth={this.state.health.requests} />
              </td>
            )}
            {object.appLabel || object.versionLabel ? (
              <td>
                <strong>Label Validation :</strong>
                {object.appLabel && <Badge>app</Badge>}
                {object.versionLabel && <Badge>version</Badge>}
              </td>
            ) : (
              <td />
            )}
          </tr>
        </tbody>
      </table>
    );
    const content = (
      <ListViewItem
        leftContent={<ListViewIcon type={iconType} name={iconName} />}
        key={'worloadItemItemView_' + this.props.position + '_' + namespace + '_' + object.name}
        heading={heading}
        description={itemDescription}
      />
    );
    return (
      <Link
        key={'worloadItemItem_' + this.props.position + '_' + namespace + '_' + object.name}
        to={worloadLink(namespace, object.name)}
        style={{ color: PfColors.Black }}
      >
        {content}
      </Link>
    );
  }
}

export default ItemDescription;
