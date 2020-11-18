import * as API from '../../services/Api';
import * as AlertUtils from '../../utils/AlertUtils';
import * as React from 'react';
import { Card, GutterSize, Modal, Stack, StackItem, Toolbar, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { Workload } from '../../types/Workload';
import { Pod } from '../../types/IstioObjects';
import ToolbarDropdown from '../ToolbarDropdown/ToolbarDropdown';
import AceEditor from 'react-ace';
import { aceOptions } from '../../types/IstioConfigDetails';
import { style } from 'typestyle';

const resources: string[] = ['All', 'Clusters', 'Listeners', 'Routes'];

const displayFlex = style({
  display: 'flex'
});

const toolbarSpace = style({
  marginLeft: '1em'
});

type EnvoyDetailModalProps = {
  namespace: string;
  workload: Workload;
  isOpen: boolean;
  onClose: (changed?: boolean) => void;
}

type EnvoyDetailProps = {
  namespace: string;
  workload: Workload
}

type EnvoyDetailState = {
  config: any;
  resource: string,
  fetch: boolean;
  loading: boolean;
  pod: Pod
}

export const EnvoyDetailsModal = ({namespace, workload, isOpen, onClose}: EnvoyDetailModalProps) => (
  <Modal isLarge={true} title={`Envoy config for ${workload.name}`} isOpen={isOpen} onClose={onClose}>
    <EnvoyDetail namespace={namespace} workload={workload} />
  </Modal>
);

class EnvoyDetail extends React.Component<EnvoyDetailProps, EnvoyDetailState> {
  aceEditorRef: React.RefObject<AceEditor>;

  constructor(props: EnvoyDetailProps) {
    super(props);
    this.aceEditorRef = React.createRef();
    this.state = {
      config: 'loading...',
      resource: 'All',
      fetch: false,
      loading: true,
      pod: this.sortedPods()[0],
    }
  }

  sortedPods = (): Pod[] => {
    return this.props.workload.pods.sort((p1: Pod, p2: Pod) => (p1.name >= p2.name ? 1 : -1))
  };

  setPod = (podName: string) => {
    const podIdx: number = +podName;
    this.setState({
      fetch: true,
      pod: this.sortedPods()[podIdx],
    });
  };

  setResource = (resource: string) => {
    this.setState({
      resource: resource,
    });
  };

  fetchEnvoyProxy = () => {
    API.getPodEnvoyProxy(this.props.namespace, this.state.pod.name).then(resultEnvoyProxy => {
      console.log(`Update proxy status: ${this.props.namespace}, ${this.state.pod.name}`);
      this.setState({
        config: resultEnvoyProxy.data,
        fetch: false,
        loading: false,
      });
    }).catch(error => {
      AlertUtils.addError(`Could not fetch envoy config for ${this.state.pod.name}.`, error);
    });
  };

  componentDidMount() {
    this.fetchEnvoyProxy();
  }

  componentDidUpdate() {
    if (this.state.fetch) {
      console.log("update fetch!");
     this.fetchEnvoyProxy();
    }
  }

  render() {
    return (
      <Stack gutter={GutterSize.sm}>
        <StackItem>
          <Toolbar key="envoy-toolbar">
            <ToolbarGroup>
              <ToolbarItem className={displayFlex}>
                <ToolbarDropdown
                  id="envoy_pods_list"
                  nameDropdown={"Pod"}
                  tooltip="Display envoy config for the selected pod"
                  handleSelect={key => this.setPod(key)}
                  value={this.state.pod.name}
                  label={this.state.pod.name}
                  options={this.props.workload.pods.map((pod:Pod) => pod.name).sort()}
                />
              </ToolbarItem>
              <ToolbarItem className={[displayFlex, toolbarSpace].join(' ')}>
                <ToolbarDropdown
                  id="envoy_xds_list"
                  nameDropdown={"Resources"}
                  tooltip="Display the selected resources from the Envoy config"
                  handleSelect={key => this.setResource(key)}
                  value={this.state.resource}
                  label={this.state.resource}
                  options={resources}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </Toolbar>
        </StackItem>
        <StackItem>
          <Card style={{height: '400px'}}>
            {this.state.loading ? 'loading...' :
              <AceEditor
                ref={this.aceEditorRef}
                mode="yaml"
                theme="eclipse"
                height={'400px'}
                width={'100%'}
                className={'istio-ace-editor'}
                wrapEnabled={true}
                readOnly={true}
                setOptions={aceOptions || { foldStyle: "markbegin" } }
                value={JSON.stringify(this.state.config, null, 2)}
              />
            }
          </Card>
        </StackItem>
      </Stack>
    );
  }
}
