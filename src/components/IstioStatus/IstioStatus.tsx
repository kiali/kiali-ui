import * as React from 'react';
import * as API from '../../services/Api';
import * as AlertUtils from '../../utils/AlertUtils';
import { TimeInMilliseconds } from '../../types/Common';
import { ComponentStatus, ComponentStatuses, Status } from '../../types/IstioStatus';
import { MessageType } from '../../types/MessageCenter';
import Namespace from '../../types/Namespace';
import { KialiAppState } from '../../store/Store';
import { istioStatusSelector, lastRefreshAtSelector, namespaceItemsSelector } from '../../store/Selectors';
import { KialiDispatch } from '../../types/Redux';
import { bindActionCreators } from 'redux';
import { IstioStatusActions } from '../../actions/IstioStatusActions';
import { connect } from 'react-redux';
import { ResourcesFullIcon } from '@patternfly/react-icons';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import IstioStatusList from './IstioStatusList';
import { PFAlertColor } from '../Pf/PfColors';
import './IstioStatus.css';

type ReduxProps = {
  lastRefreshAt: TimeInMilliseconds;
  setIstioStatus: (istioStatus: ComponentStatus[]) => void;
  namespaces: Namespace[] | undefined;
  status: ComponentStatus[];
}

type Props = ReduxProps & {}

const ValidToColor = {
  "false-false": PFAlertColor.Danger,
  "false-true": PFAlertColor.Danger,
  "true-false": PFAlertColor.Warning,
  "true-true": PFAlertColor.Success,
};

export class IstioStatus extends React.Component<Props> {
  componentDidMount() {
    this.fetchStatus();
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.lastRefreshAt !== prevProps.lastRefreshAt) {
      this.fetchStatus();
    }
  }

  mapToArray = (s: ComponentStatuses): ComponentStatus[] => {
    return Object.keys(s).map<ComponentStatus>((k: string) => {
     return {
       name: k,
       is_core: s[k].is_core,
       status: s[k].status,
     }
    });
  };

  fetchStatus = () => {
    API.getIstioStatus()
      .then(response => {
        return this.props.setIstioStatus(this.mapToArray(response.data));
      })
      .catch(error => {
        // User without namespaces can't have access to mTLS information. Reduce severity to info.
        const informative = this.props.namespaces && this.props.namespaces.length < 1;
        if (informative) {
          AlertUtils.addError('Istio deployment status disabled.', error, 'default', MessageType.INFO);
        } else {
          AlertUtils.addError('Error fetching Istio deployment status.', error, 'default', MessageType.ERROR);
        }
      });
  };

  tooltipContent = () => {
    return <IstioStatusList status={this.props.status} />;
  };

  tooltipColor = () => {
    let coreHealthy: boolean = true;
    let addonHealthy: boolean = true;

    Object.keys(this.props.status || {}).forEach((compKey: string) => {
      const { status, is_core } = this.props.status[compKey];
      const isHealthy: boolean = status == Status.Running;

      if (is_core) {
        coreHealthy = coreHealthy && isHealthy;
      } else {
        addonHealthy = addonHealthy && isHealthy;
      }
    });

    return ValidToColor[`${coreHealthy}-${addonHealthy}`];
  };

  render() {
    return (
      <Tooltip
        position={TooltipPosition.left}
        enableFlip={true}
        content={this.tooltipContent()}
        maxWidth={'25rem'}
      >
        <ResourcesFullIcon color={this.tooltipColor()} />
      </Tooltip>
    )
  }
}
const mapStateToProps = (state: KialiAppState) => ({
  status: istioStatusSelector(state),
  lastRefreshAt: lastRefreshAtSelector(state),
  namespaces: namespaceItemsSelector(state)
});

const mapDispatchToProps = (dispatch: KialiDispatch) => ({
  setIstioStatus: bindActionCreators(IstioStatusActions.setinfo, dispatch)
});

const IstioStatusConnected = connect(
    mapStateToProps,
    mapDispatchToProps
)(IstioStatus);

export default IstioStatusConnected;
