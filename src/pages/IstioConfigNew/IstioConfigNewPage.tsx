import * as React from 'react';
import { KialiAppState } from '../../store/Store';
import { activeNamespacesSelector } from '../../store/Selectors';
import { connect } from 'react-redux';
import Namespace from '../../types/Namespace';
import { ActionGroup, Button, Form, FormGroup, FormSelect, FormSelectOption, TextInput } from '@patternfly/react-core';
import { RenderContent } from '../../components/Nav/Page';
import { style } from 'typestyle';
import GatewayForm, { GatewayServer } from './GatewayForm';
import SidecarForm, { EgressHost } from './SidecarForm';
import { serverConfig } from '../../config';

type Props = {
  activeNamespaces: Namespace[];
};

type State = {
  istioResource: string;
  name: string;
  // Gateway state
  gatewayServers: GatewayServer[];
  // Sidecar state
  egressHosts: EgressHost[];
};

const formPadding = style({ padding: '30px 20px 30px 20px' });

const GATEWAY = 'Gateway';
const SIDECAR = 'Sidecar';

const istioResourceOptions = [
  { value: GATEWAY, label: GATEWAY, disabled: false },
  { value: SIDECAR, label: SIDECAR, disabled: false }
];

class IstioConfigNewPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      istioResource: istioResourceOptions[0].value,
      name: '',
      gatewayServers: [],
      egressHosts: [
        // Init with the istio-system/* for sidecar
        {
          host: serverConfig.istioNamespace + '/*'
        }
      ]
    };
  }
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
    console.log('TODELETE Create the resource selected');
  };

  render() {
    const isNameValid = this.state.name.length > 0;
    const isNamespacesValid = this.props.activeNamespaces.length > 0;
    const isGatewayFormValid = this.state.istioResource === GATEWAY && this.state.gatewayServers.length > 0;
    const isFutureFormsValid = false;
    const isFormValid = isNameValid && isNamespacesValid && (isGatewayFormValid || isFutureFormsValid);
    return (
      <RenderContent>
        <Form className={formPadding} isHorizontal={true}>
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
          {this.state.istioResource === GATEWAY && (
            <GatewayForm
              gatewayServers={this.state.gatewayServers}
              onAdd={gatewayServer => {
                this.setState(prevState => {
                  prevState.gatewayServers.push(gatewayServer);
                  return {
                    gatewayServers: prevState.gatewayServers
                  };
                });
              }}
              onRemove={index => {
                this.setState(prevState => {
                  prevState.gatewayServers.splice(index, 1);
                  return {
                    gatewayServers: prevState.gatewayServers
                  };
                });
              }}
            />
          )}
          {this.state.istioResource === SIDECAR && (
            <SidecarForm
              egressHosts={this.state.egressHosts}
              onAdd={egressHost => {
                this.setState(prevState => {
                  prevState.egressHosts.push(egressHost);
                  return {
                    egressHosts: prevState.egressHosts
                  };
                });
              }}
              onRemove={index => {
                this.setState(prevState => {
                  prevState.egressHosts.splice(index, 1);
                  return {
                    egressHosts: prevState.egressHosts
                  };
                });
              }}
            />
          )}
          <ActionGroup>
            <Button variant="primary" isDisabled={!isFormValid}>
              Create
            </Button>
            <Button variant="secondary">Cancel</Button>
          </ActionGroup>
        </Form>
      </RenderContent>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  activeNamespaces: activeNamespacesSelector(state)
});

const IstioConfigNewPageContainer = connect(
  mapStateToProps,
  null
)(IstioConfigNewPage);

export default IstioConfigNewPageContainer;
