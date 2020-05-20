import * as React from 'react';
import { KialiAppState } from '../../store/Store';
import { activeNamespacesSelector } from '../../store/Selectors';
import { connect } from 'react-redux';
import Namespace from '../../types/Namespace';
import { ActionGroup, Button, Form, FormGroup, FormSelect, FormSelectOption, TextInput } from '@patternfly/react-core';
import { RenderContent } from '../../components/Nav/Page';
import { style } from 'typestyle';
import GatewayForm, { GatewayState } from './GatewayForm';
import SidecarForm, { SidecarState } from './SidecarForm';
import { Paths, serverConfig } from '../../config';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import * as API from '../../services/Api';
import { IstioPermissions } from '../../types/IstioConfigDetails';
import * as AlertUtils from '../../utils/AlertUtils';
import history from '../../app/History';
import {
  buildAuthorizationPolicy,
  buildGateway,
  buildPeerAuthentication,
  buildRequestAuthentication,
  buildSidecar
} from '../../components/IstioWizards/IstioWizardActions';
import { MessageType } from '../../types/MessageCenter';
import AuthorizationPolicyForm, {
  AuthorizationPolicyState,
  INIT_AUTHORIZATION_POLICY
} from './AuthorizationPolicyForm';
import PeerAuthenticationForm, { INIT_PEER_AUTHENTICATION, PeerAuthenticationState } from './PeerAuthenticationForm';
import RequestAuthenticationForm, {
  INIT_REQUEST_AUTHENTICATION,
  RequestAuthenticationState
} from './RequestAuthenticationForm';

type Props = {
  activeNamespaces: Namespace[];
};

type State = {
  istioResource: string;
  name: string;
  istioPermissions: IstioPermissions;
  authorizationPolicy: AuthorizationPolicyState;
  gateway: GatewayState;
  peerAuthentication: PeerAuthenticationState;
  requestAuthentication: RequestAuthenticationState;
  sidecar: SidecarState;
};

const formPadding = style({ padding: '30px 20px 30px 20px' });

const AUTHORIZACION_POLICY = 'AuthorizationPolicy';
const AUTHORIZATION_POLICIES = 'authorizationpolicies';
const GATEWAY = 'Gateway';
const GATEWAYS = 'gateways';
const PEER_AUTHENTICATION = 'PeerAuthentication';
const PEER_AUTHENTICATIONS = 'peerauthentications';
const REQUEST_AUTHENTICATION = 'RequestAuthentication';
const REQUEST_AUTHENTICATIONS = 'requestauthentications';
const SIDECAR = 'Sidecar';
const SIDECARS = 'sidecars';

const DIC = {
  AuthorizationPolicy: AUTHORIZATION_POLICIES,
  Gateway: GATEWAYS,
  PeerAuthentication: PEER_AUTHENTICATIONS,
  RequestAuthentication: REQUEST_AUTHENTICATIONS,
  Sidecar: SIDECARS
};

const istioResourceOptions = [
  { value: AUTHORIZACION_POLICY, label: AUTHORIZACION_POLICY, disabled: false },
  { value: GATEWAY, label: GATEWAY, disabled: false },
  { value: PEER_AUTHENTICATION, label: PEER_AUTHENTICATION, disabled: false },
  { value: REQUEST_AUTHENTICATION, label: REQUEST_AUTHENTICATION, disabled: false },
  { value: SIDECAR, label: SIDECAR, disabled: false }
];

const INIT_STATE = (): State => ({
  istioResource: istioResourceOptions[0].value,
  name: '',
  istioPermissions: {},
  authorizationPolicy: INIT_AUTHORIZATION_POLICY(),
  gateway: {
    gatewayServers: []
  },
  peerAuthentication: INIT_PEER_AUTHENTICATION(),
  requestAuthentication: INIT_REQUEST_AUTHENTICATION(),
  sidecar: {
    egressHosts: [
      // Init with the istio-system/* for sidecar
      {
        host: serverConfig.istioNamespace + '/*'
      }
    ],
    addWorkloadSelector: false,
    workloadSelectorValid: false,
    workloadSelectorLabels: ''
  }
});

class IstioConfigNewPage extends React.Component<Props, State> {
  private promises = new PromisesRegistry();

  constructor(props: Props) {
    super(props);
    this.state = INIT_STATE();
  }

  componentWillUnmount() {
    this.promises.cancelAll();
  }

  componentDidMount() {
    // Init component state
    this.setState(Object.assign({}, INIT_STATE));
    this.fetchPermissions();
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    if (prevProps.activeNamespaces !== this.props.activeNamespaces) {
      this.fetchPermissions();
    }
  }

  canCreate = (namespace: string): boolean => {
    return (
      this.state.istioPermissions[namespace] &&
      this.state.istioResource.length > 0 &&
      this.state.istioPermissions[namespace][DIC[this.state.istioResource]].create
    );
  };

  fetchPermissions = () => {
    if (this.props.activeNamespaces.length > 0) {
      this.promises
        .register('permissions', API.getIstioPermissions(this.props.activeNamespaces.map(n => n.name)))
        .then(permResponse => {
          this.setState(
            {
              istioPermissions: permResponse.data
            },
            () => {
              this.props.activeNamespaces.forEach(ns => {
                if (!this.canCreate(ns.name)) {
                  AlertUtils.addWarning('User has not permissions to create Istio Config on namespace: ' + ns.name);
                }
              });
            }
          );
        })
        .catch(error => {
          // Canceled errors are expected on this query when page is unmounted
          if (!error.isCanceled) {
            AlertUtils.addError('Could not fetch Permissions.', error);
          }
        });
    }
  };

  onIstioResourceChange = (value, _) => {
    this.setState({
      istioResource: value,
      name: ''
    });
  };

  onNameChange = (value, _) => {
    this.setState({
      name: value
    });
  };

  onIstioResourceCreate = () => {
    const jsonIstioObjects: { namespace: string; json: string }[] = [];
    this.props.activeNamespaces.map(ns => {
      switch (this.state.istioResource) {
        case AUTHORIZACION_POLICY:
          jsonIstioObjects.push({
            namespace: ns.name,
            json: JSON.stringify(buildAuthorizationPolicy(this.state.name, ns.name, this.state.authorizationPolicy))
          });
          break;
        case GATEWAY:
          jsonIstioObjects.push({
            namespace: ns.name,
            json: JSON.stringify(buildGateway(this.state.name, ns.name, this.state.gateway))
          });
          break;
        case PEER_AUTHENTICATION:
          jsonIstioObjects.push({
            namespace: ns.name,
            json: JSON.stringify(buildPeerAuthentication(this.state.name, ns.name, this.state.peerAuthentication))
          });
          break;
        case REQUEST_AUTHENTICATION:
          jsonIstioObjects.push({
            namespace: ns.name,
            json: JSON.stringify(buildRequestAuthentication(this.state.name, ns.name, this.state.requestAuthentication))
          });
          break;
        case SIDECAR:
          jsonIstioObjects.push({
            namespace: ns.name,
            json: JSON.stringify(buildSidecar(this.state.name, ns.name, this.state.sidecar))
          });
          break;
      }
    });

    this.promises
      .registerAll(
        'Create ' + DIC[this.state.istioResource],
        jsonIstioObjects.map(o => API.createIstioConfigDetail(o.namespace, DIC[this.state.istioResource], o.json))
      )
      .then(results => {
        if (results.length > 0) {
          AlertUtils.add('Istio ' + this.state.istioResource + ' created', 'default', MessageType.SUCCESS);
        }
        this.backToList();
      })
      .catch(error => {
        AlertUtils.addError('Could not create Istio ' + this.state.istioResource + ' objects.', error);
      });
  };

  backToList = () => {
    this.setState(INIT_STATE(), () => {
      // Back to list page
      history.push(`/${Paths.ISTIO}?namespaces=${this.props.activeNamespaces.join(',')}`);
    });
  };

  isAuthorizationPolicyValid = (): boolean => {
    return this.state.istioResource === AUTHORIZACION_POLICY;
  };

  isGatewayValid = (): boolean => {
    return this.state.istioResource === GATEWAY && this.state.gateway.gatewayServers.length > 0;
  };

  isPeerAuthenticationValid = (): boolean => {
    const validPortsMtls =
      this.state.peerAuthentication.portLevelMtls.length > 0 &&
      this.state.peerAuthentication.workloadSelector.length === 0
        ? false
        : true;
    return this.state.istioResource === PEER_AUTHENTICATION && validPortsMtls;
  };

  isRequestAuthenticationValid = (): boolean => {
    return this.state.istioResource === REQUEST_AUTHENTICATION;
  };

  isSidecarValid = (): boolean => {
    return (
      this.state.istioResource === SIDECAR &&
      this.state.sidecar.egressHosts.length > 0 &&
      (!this.state.sidecar.addWorkloadSelector ||
        (this.state.sidecar.addWorkloadSelector && this.state.sidecar.workloadSelectorValid))
    );
  };

  onChangeAuthorizationPolicy = (authorizationPolicy: AuthorizationPolicyState) => {
    this.setState(prevState => {
      prevState.authorizationPolicy.workloadSelector = authorizationPolicy.workloadSelector;
      prevState.authorizationPolicy.action = authorizationPolicy.action;
      prevState.authorizationPolicy.policy = authorizationPolicy.policy;
      prevState.authorizationPolicy.rules = authorizationPolicy.rules;
      return {
        authorizationPolicy: prevState.authorizationPolicy
      };
    });
  };

  onChangePeerAuthentication = (peerAuthentication: PeerAuthenticationState) => {
    this.setState(prevState => {
      prevState.peerAuthentication.workloadSelector = peerAuthentication.workloadSelector;
      return {
        peerAuthentication: prevState.peerAuthentication
      };
    });
  };

  onChangeRequestAuthentication = (requestAuthentication: RequestAuthenticationState) => {
    this.setState(prevState => {
      prevState.requestAuthentication.workloadSelector = requestAuthentication.workloadSelector;
      prevState.requestAuthentication.jwtRules = requestAuthentication.jwtRules;
      return {
        requestAuthentication: prevState.requestAuthentication
      };
    });
  };

  render() {
    const canCreate = this.props.activeNamespaces.every(ns => this.canCreate(ns.name));
    const isNameValid = this.state.name.length > 0;
    const isNamespacesValid = this.props.activeNamespaces.length > 0;
    const isFormValid =
      canCreate &&
      isNameValid &&
      isNamespacesValid &&
      (this.isGatewayValid() ||
        this.isSidecarValid() ||
        this.isAuthorizationPolicyValid() ||
        this.isPeerAuthenticationValid() ||
        this.isRequestAuthenticationValid());
    return (
      <RenderContent>
        <Form className={formPadding} isHorizontal={true}>
          <FormGroup
            label="Namespaces"
            isRequired={true}
            fieldId="namespaces"
            helperText={'Select namespace(s) where this configuration will be applied'}
            helperTextInvalid={'At least one namespace should be selected'}
            isValid={isNamespacesValid}
          >
            <TextInput
              value={this.props.activeNamespaces.map(n => n.name).join(',')}
              isRequired={true}
              type="text"
              id="namespaces"
              aria-describedby="namespaces"
              name="namespaces"
              isDisabled={true}
              isValid={isNamespacesValid}
            />
          </FormGroup>
          <FormGroup label="Istio Resource" fieldId="istio-resource">
            <FormSelect
              value={this.state.istioResource}
              onChange={this.onIstioResourceChange}
              id="istio-resource"
              name="istio-resource"
            >
              {istioResourceOptions.map((option, index) => (
                <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup
            label="Name"
            isRequired={true}
            fieldId="name"
            helperText={this.state.istioResource + ' name'}
            helperTextInvalid={this.state.istioResource + ' name is required'}
            isValid={isNameValid}
          >
            <TextInput
              value={this.state.name}
              isRequired={true}
              type="text"
              id="name"
              aria-describedby="name"
              name="name"
              onChange={this.onNameChange}
              isValid={isNameValid}
            />
          </FormGroup>
          {this.state.istioResource === AUTHORIZACION_POLICY && (
            <AuthorizationPolicyForm
              authorizationPolicy={this.state.authorizationPolicy}
              onChange={this.onChangeAuthorizationPolicy}
            />
          )}
          {this.state.istioResource === GATEWAY && (
            <GatewayForm
              gatewayServers={this.state.gateway.gatewayServers}
              onAdd={gatewayServer => {
                this.setState(prevState => {
                  prevState.gateway.gatewayServers.push(gatewayServer);
                  return {
                    gateway: {
                      gatewayServers: prevState.gateway.gatewayServers
                    }
                  };
                });
              }}
              onRemove={index => {
                this.setState(prevState => {
                  prevState.gateway.gatewayServers.splice(index, 1);
                  return {
                    gateway: {
                      gatewayServers: prevState.gateway.gatewayServers
                    }
                  };
                });
              }}
            />
          )}
          {this.state.istioResource === PEER_AUTHENTICATION && (
            <PeerAuthenticationForm
              peerAuthentication={this.state.peerAuthentication}
              onChange={this.onChangePeerAuthentication}
            />
          )}
          {this.state.istioResource === REQUEST_AUTHENTICATION && (
            <RequestAuthenticationForm
              requestAuthentication={this.state.requestAuthentication}
              onChange={this.onChangeRequestAuthentication}
            />
          )}
          {this.state.istioResource === SIDECAR && (
            <SidecarForm
              egressHosts={this.state.sidecar.egressHosts}
              addWorkloadSelector={this.state.sidecar.addWorkloadSelector}
              workloadSelectorLabels={this.state.sidecar.workloadSelectorLabels}
              onAddEgressHost={egressHost => {
                this.setState(prevState => {
                  prevState.sidecar.egressHosts.push(egressHost);
                  return {
                    sidecar: {
                      egressHosts: prevState.sidecar.egressHosts,
                      addWorkloadSelector: prevState.sidecar.addWorkloadSelector,
                      workloadSelectorValid: prevState.sidecar.workloadSelectorValid,
                      workloadSelectorLabels: prevState.sidecar.workloadSelectorLabels
                    }
                  };
                });
              }}
              onChangeSelector={(addWorkloadSelector, workloadSelectorValid, workloadSelectorLabels) => {
                this.setState(prevState => {
                  return {
                    sidecar: {
                      egressHosts: prevState.sidecar.egressHosts,
                      addWorkloadSelector: addWorkloadSelector,
                      workloadSelectorValid: workloadSelectorValid,
                      workloadSelectorLabels: workloadSelectorLabels
                    }
                  };
                });
              }}
              onRemoveEgressHost={index => {
                this.setState(prevState => {
                  prevState.sidecar.egressHosts.splice(index, 1);
                  return {
                    sidecar: {
                      egressHosts: prevState.sidecar.egressHosts,
                      addWorkloadSelector: prevState.sidecar.addWorkloadSelector,
                      workloadSelectorValid: prevState.sidecar.workloadSelectorValid,
                      workloadSelectorLabels: prevState.sidecar.workloadSelectorLabels
                    }
                  };
                });
              }}
            />
          )}
          <ActionGroup>
            <Button variant="primary" isDisabled={!isFormValid} onClick={() => this.onIstioResourceCreate()}>
              Create
            </Button>
            <Button variant="secondary" onClick={() => this.backToList()}>
              Cancel
            </Button>
          </ActionGroup>
        </Form>
      </RenderContent>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => {
  return {
    activeNamespaces: activeNamespacesSelector(state)
  };
};

const IstioConfigNewPageContainer = connect(
  mapStateToProps,
  null
)(IstioConfigNewPage);

export default IstioConfigNewPageContainer;
