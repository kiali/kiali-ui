import * as React from 'react';
import { Button, Modal } from '@patternfly/react-core';
import NamespaceInfo from './NamespaceInfo';
import { AuthorizationPolicy, Sidecar } from 'types/IstioObjects';
import { MessageType } from 'types/MessageCenter';
import { PromisesRegistry } from 'utils/CancelablePromises';
import { DurationInSeconds } from 'types/Common';
import { ConfigPreviewItem, IstioConfigPreview } from 'components/IstioConfigPreview/IstioConfigPreview';
import * as AlertUtils from 'utils/AlertUtils';
import * as API from 'services/Api';
import { serverConfig } from '../../config';
import GraphDataSource from 'services/GraphDataSource';
import {
  buildGraphAuthorizationPolicy,
  buildNamespaceInjectionPatch,
  buildGraphSidecars
} from 'components/IstioWizards/WizardActions';
import { AUTHORIZATION_POLICIES } from '../IstioConfigNew/AuthorizationPolicyForm';

type OverviewTrafficPoliciesProps = {
  opTarget: string;
  kind: string;
  isOpen: boolean;
  nsTarget: string;
  nsInfo: NamespaceInfo;
  hideConfirmModal: () => void;
  load: () => void;
  duration: DurationInSeconds;
};

type State = {
  confirmationModal: boolean;
  authorizationPolicies: AuthorizationPolicy[];
  sidecars: Sidecar[];
  disableOp: boolean;
  canaryVersion: string;
  loaded: boolean;
};

type colorButton = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'link' | 'plain' | 'control';

export default class OverviewTrafficPolicies extends React.Component<OverviewTrafficPoliciesProps, State> {
  private promises = new PromisesRegistry();
  constructor(props: OverviewTrafficPoliciesProps) {
    super(props);
    this.state = {
      confirmationModal: this.confirmationModalStatus(),
      authorizationPolicies: [],
      sidecars: [],
      loaded: this.props.opTarget === 'update',
      disableOp: true,
      canaryVersion: this.props.kind === 'canary' ? serverConfig.istioCanaryRevision[this.props.opTarget] : ''
    };
  }

  confirmationModalStatus = () => {
    return this.props.kind === 'canary' || this.props.kind === 'injection';
  };

  componentDidUpdate(prevProps: OverviewTrafficPoliciesProps) {
    if (prevProps.nsTarget !== this.props.nsTarget || prevProps.opTarget !== this.props.opTarget) {
      switch (this.props.kind) {
        case 'injection':
          this.fetchPermission(true);
          break;
        case 'canary':
          this.setState({ canaryVersion: serverConfig.istioCanaryRevision[this.props.opTarget] }, () =>
            this.fetchPermission(true)
          );
          break;
        default:
          if (this.props.opTarget === 'create') {
            this.generateTrafficPolicies();
            this.fetchPermission();
          } else if (this.props.opTarget === 'update') {
            var authorizationPolicies = this.props.nsInfo?.istioConfig?.authorizationPolicies || [];
            var sidecars = this.props.nsInfo?.istioConfig?.sidecars || [];
            const remove = ['uid', 'resourceVersion', 'generation', 'creationTimestamp', 'managedFields'];
            sidecars.map(sdc => remove.map(key => delete sdc.metadata[key]));
            authorizationPolicies.map(ap => remove.map(key => delete ap.metadata[key]));
            this.setState({ authorizationPolicies, sidecars }, () => this.fetchPermission());
          } else if (this.props.opTarget === 'delete') {
            var nsInfo = this.props.nsInfo.istioConfig;
            this.setState(
              {
                authorizationPolicies: nsInfo?.authorizationPolicies || [],
                sidecars: nsInfo?.sidecars || []
              },
              () => this.fetchPermission(true)
            );
          }
          break;
      }
    }
  }

  fetchPermission = (
    confirmationModal: boolean = false,
    loaded: boolean = this.props.opTarget === 'update' || this.props.opTarget === 'create'
  ) => {
    this.promises.register('namespacepermissions', API.getIstioPermissions([this.props.nsTarget])).then(result => {
      const permission = result.data[this.props.nsTarget][AUTHORIZATION_POLICIES];
      const disableOp = !(permission.create && permission.update && permission.delete);
      this.setState({
        confirmationModal,
        disableOp,
        loaded
      });
    });
  };

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
    switch (this.props.kind) {
      case 'injection':
        this.onAddRemoveAutoInjection();
        break;
      case 'canary':
        this.onUpgradeDowngradeIstio();
        break;
      default:
        this.onAddRemoveTrafficPolicies();
        break;
    }
    this.onHideConfirmModal();
  };

  onAddRemoveAutoInjection = () => {
    const jsonPatch = buildNamespaceInjectionPatch(
      this.props.opTarget === 'enable',
      this.props.opTarget === 'remove',
      null
    );
    API.updateNamespace(this.props.nsTarget, jsonPatch)
      .then(_ => {
        AlertUtils.add('Namespace ' + this.props.nsTarget + ' updated', 'default', MessageType.SUCCESS);
        this.props.load();
      })
      .catch(error => {
        AlertUtils.addError('Could not update namespace ' + this.props.nsTarget, error);
      });
  };

  onUpgradeDowngradeIstio = (): void => {
    const jsonPatch = buildNamespaceInjectionPatch(false, false, this.state.canaryVersion);
    API.updateNamespace(this.props.nsTarget, jsonPatch)
      .then(_ => {
        AlertUtils.add('Namespace ' + this.props.nsTarget + ' updated', 'default', MessageType.SUCCESS);
        this.props.load();
      })
      .catch(error => {
        AlertUtils.addError('Could not update namespace ' + this.props.nsTarget, error);
      });
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

  getItemsPreview = () => {
    const items: ConfigPreviewItem[] = [];
    this.state.authorizationPolicies.length > 0 &&
      items.push({
        type: 'authorizationPolicy',
        items: this.state.authorizationPolicies,
        title: 'Authorization Policies'
      });
    this.state.sidecars.length > 0 && items.push({ type: 'sidecar', items: this.state.sidecars, title: 'Sidecars' });
    return items;
  };

  onConfirmPreviewPoliciesModal = (items: ConfigPreviewItem[]) => {
    const aps = items.filter(i => i.type === 'authorizationPolicy')[0];
    const sds = items.filter(i => i.type === 'sidecar')[0];
    this.setState(
      { authorizationPolicies: aps.items as AuthorizationPolicy[], sidecars: sds.items as Sidecar[], loaded: false },
      () => this.fetchPermission(true, false)
    );
  };

  onHideConfirmModal = () => {
    this.setState({ confirmationModal: false, sidecars: [], authorizationPolicies: [], loaded: false }, () =>
      this.props.hideConfirmModal()
    );
  };

  render() {
    const canaryVersion = this.props.kind === 'canary' ? serverConfig.istioCanaryRevision[this.props.opTarget] : '';
    const modalAction =
      this.props.opTarget.length > 0
        ? this.props.opTarget.charAt(0).toLocaleUpperCase() + this.props.opTarget.slice(1)
        : '';
    const colorAction = ['enable', 'disable', 'create'].includes(this.props.opTarget) ? 'primary' : 'danger';
    const title =
      'Confirm ' +
      modalAction +
      (this.props.kind === 'policy'
        ? ' Traffic Policies'
        : this.props.kind === 'injection'
        ? ' Auto Injection'
        : ' to ' + canaryVersion) +
      '?';
    return (
      <>
        {this.state.loaded && (
          <IstioConfigPreview
            isOpen={
              this.props.isOpen &&
              this.props.kind === 'policy' &&
              this.props.opTarget !== 'delete' &&
              this.state.authorizationPolicies.length > 0
            }
            disableAction={this.state.disableOp}
            onClose={this.onHideConfirmModal}
            onConfirm={this.onConfirmPreviewPoliciesModal}
            ns={this.props.nsTarget}
            items={this.getItemsPreview()}
            opTarget={this.props.opTarget}
          />
        )}
        <Modal
          isSmall={true}
          title={title}
          isOpen={this.state.confirmationModal}
          onClose={this.onHideConfirmModal}
          actions={[
            <Button key="cancel" variant="secondary" onClick={this.onHideConfirmModal}>
              Cancel
            </Button>,
            <Button
              key="confirm"
              isDisabled={this.state.disableOp}
              variant={colorAction as colorButton}
              onClick={this.onConfirm}
            >
              {modalAction}
            </Button>
          ]}
        >
          {this.props.kind === 'injection' ? (
            <>
              You're going to {this.props.opTarget} Auto Injection in the namespace {this.props.nsTarget}. Are you sure?
            </>
          ) : this.props.kind === 'canary' ? (
            <>
              You're going to {this.props.opTarget} to {this.state.canaryVersion} revision in the namespace{' '}
              {this.props.nsTarget}. Are you sure?
            </>
          ) : (
            <>
              Namespace {this.props.nsTarget} {this.props.opTarget === 'create' ? 'has not ' : 'has'} existing traffic
              policies objects. Do you want to {this.props.opTarget} them ?
            </>
          )}
          {}
        </Modal>
      </>
    );
  }
}
