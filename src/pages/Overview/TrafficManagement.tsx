import * as React from 'react';
import { Button, Modal } from '@patternfly/react-core';
import NamespaceInfo from './NamespaceInfo';
import { AuthorizationPolicy, Sidecar } from 'types/IstioObjects';
import { MessageType } from 'types/MessageCenter';
import { PromisesRegistry } from 'utils/CancelablePromises';
import { DurationInSeconds } from 'types/Common';
import { IstioConfigPreview } from 'components/IstioConfigPreview/IstioConfigPreview';
import * as AlertUtils from 'utils/AlertUtils';
import * as API from 'services/Api';
import GraphDataSource from 'services/GraphDataSource';
import { buildGraphAuthorizationPolicy, buildGraphSidecars } from 'components/IstioWizards/WizardActions';

type TrafficManagementProps = {
  opTarget: string;
  isOpen: boolean;
  nsTarget: string;
  nsInfo: NamespaceInfo;
  disableOp: boolean;
  hideConfirmModal: () => void;
  load: () => void;
  duration: DurationInSeconds;
};

type State = {
  confirmationModal: boolean;
  authorizationPolicies: AuthorizationPolicy[];
  sidecars: Sidecar[];
};

export default class TrafficManagement extends React.Component<TrafficManagementProps, State> {
  private promises = new PromisesRegistry();
  constructor(props: TrafficManagementProps) {
    super(props);
    this.state = { confirmationModal: false, authorizationPolicies: [], sidecars: [] };
  }

  componentDidUpdate(prevProps: TrafficManagementProps) {
    if (prevProps.nsTarget !== this.props.nsTarget || prevProps.opTarget !== this.props.opTarget) {
      var authorizationPolicies = this.props.nsInfo?.istioConfig?.authorizationPolicies || [];
      var sidecars = this.props.nsInfo?.istioConfig?.sidecars || [];
      if (this.props.opTarget === 'create') {
        this.generateTrafficPolicies();
      } else if (this.props.opTarget === 'update') {
        const remove = ['uid', 'resourceVersion', 'generation', 'creationTimestamp', 'managedFields'];
        sidecars.map(sdc => remove.map(key => delete sdc.metadata[key]));
        authorizationPolicies.map(ap => remove.map(key => delete ap.metadata[key]));
        this.setState({ authorizationPolicies, sidecars });
      } else if (this.props.opTarget === 'delete') {
        var nsInfo = this.props.nsInfo.istioConfig;
        this.setState({
          confirmationModal: true,
          authorizationPolicies: nsInfo?.authorizationPolicies || [],
          sidecars: nsInfo?.sidecars || []
        });
      }
    }
  }

  generateTrafficPolicies = () => {
    const graphDataSource = new GraphDataSource();
    graphDataSource.on('fetchSuccess', () => {
      const aps = buildGraphAuthorizationPolicy(this.props.nsTarget, graphDataSource.graphDefinition);
      const scs = buildGraphSidecars(this.props.nsTarget, graphDataSource.graphDefinition);
      this.setState({ authorizationPolicies: aps, sidecars: scs });
    });
    graphDataSource.fetchForNamespace(this.props.duration, this.props.nsTarget);
  };

  onConfirm = () => {
    this.setState({ confirmationModal: false });
    this.onAddRemoveTrafficPolicies();
    this.props.hideConfirmModal();
  };

  onAddRemoveTrafficPolicies = (): void => {
    const op = this.props.opTarget;
    const ns = this.props.nsTarget;
    const duration = this.props.duration;
    const apsP = this.state.authorizationPolicies;
    const sdsP = this.state.sidecars;
    if (op !== 'create') {
      this.promises
        .registerAll(
          'trafficPoliciesDelete',
          apsP
            .map(ap => API.deleteIstioConfigDetail(ns, 'authorizationpolicies', ap.metadata.name))
            .concat(sdsP.map(sc => API.deleteIstioConfigDetail(ns, 'sidecars', sc.metadata.name)))
        )
        .then(_ => {
          //Error here
          if (op !== 'delete') {
            this.createTrafficPolicies(ns, duration, apsP, sdsP, op);
          } else {
            AlertUtils.add('Traffic policies ' + op + 'd for ' + ns + ' namespace.', 'default', MessageType.SUCCESS);
            this.props.load();
          }
        })
        .catch(errorDelete => {
          if (!errorDelete.isCanceled) {
            AlertUtils.addError('Could not delete traffic policies.', errorDelete);
          }
        });
    } else {
      this.createTrafficPolicies(ns, duration, apsP, sdsP);
    }
  };

  createTrafficPolicies = (
    ns: string,
    duration: DurationInSeconds,
    aps: AuthorizationPolicy[],
    sds: Sidecar[],
    op: string = 'create'
  ) => {
    const graphDataSource = new GraphDataSource();
    graphDataSource.on('fetchSuccess', () => {
      this.promises
        .registerAll(
          'trafficPoliciesCreate',
          aps
            .map(ap => API.createIstioConfigDetail(ns, 'authorizationpolicies', JSON.stringify(ap)))
            .concat(sds.map(sc => API.createIstioConfigDetail(ns, 'sidecars', JSON.stringify(sc))))
        )
        .then(results => {
          if (results.length > 0) {
            AlertUtils.add('Traffic policies ' + op + 'd for ' + ns + ' namespace.', 'default', MessageType.SUCCESS);
          }
          this.props.load();
        })
        .catch(errorCreate => {
          if (!errorCreate.isCanceled) {
            AlertUtils.addError('Could not ' + op + ' traffic policies.', errorCreate);
          }
        });
    });
    graphDataSource.on('fetchError', (errorMessage: string | null) => {
      if (errorMessage !== '') {
        errorMessage = 'Could not fetch traffic data: ' + errorMessage;
      } else {
        errorMessage = 'Could not fetch traffic data.';
      }
      AlertUtils.addError(errorMessage);
    });
    graphDataSource.fetchForNamespace(duration, ns);
  };

  onConfirmPreviewPoliciesModal = (aps: AuthorizationPolicy[], sds: Sidecar[]) => {
    this.setState({ authorizationPolicies: aps, sidecars: sds, confirmationModal: true });
  };

  render() {
    const modalAction =
      this.props.opTarget.length > 0
        ? this.props.opTarget.charAt(0).toLocaleUpperCase() + this.props.opTarget.slice(1)
        : '';
    return (
      <>
        <IstioConfigPreview
          isOpen={this.props.isOpen && this.props.opTarget !== 'delete' && this.state.authorizationPolicies.length > 0}
          onClose={this.props.hideConfirmModal}
          onConfirm={this.onConfirmPreviewPoliciesModal}
          ns={this.props.nsTarget}
          authorizationPolicies={this.state.authorizationPolicies}
          sidecars={this.state.sidecars}
          opTarget={this.props.opTarget}
          disableOp={this.props.disableOp}
        />
        <Modal
          isSmall={true}
          title={'Confirm ' + modalAction + ' Traffic Policies ?'}
          isOpen={this.state.confirmationModal}
          onClose={this.props.hideConfirmModal}
          actions={[
            <Button key="cancel" variant="secondary" onClick={this.props.hideConfirmModal}>
              Cancel
            </Button>,
            <Button key="confirm" variant="danger" onClick={this.onConfirm}>
              {modalAction}
            </Button>
          ]}
        >
          {'Namespace ' +
            this.props.nsTarget +
            ' has existing traffic policies objects. Do you want to ' +
            this.props.opTarget +
            ' them ?'}
        </Modal>
      </>
    );
  }
}
