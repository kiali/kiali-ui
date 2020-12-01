import * as API from '../../services/Api';
import * as AlertUtils from '../../utils/AlertUtils';
import * as React from 'react';
import {
  Button,
  Card,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  GutterSize,
  Modal,
  Spinner,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { Workload } from '../../types/Workload';
import { Pod } from '../../types/IstioObjects';
import ToolbarDropdown from '../ToolbarDropdown/ToolbarDropdown';
import AceEditor from 'react-ace';
import { aceOptions } from '../../types/IstioConfigDetails';
import { style } from 'typestyle';
import { SummaryWriterBuilder } from './writers/BaseWriter';

// Enables the search box for the ACEeditor
require('ace-builds/src-noconflict/ext-searchbox');

const resources: string[] = ['all', 'bootstrap', 'clusters', 'listeners', 'routes'];

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
};

type EnvoyDetailProps = {
  namespace: string;
  workload: Workload;
  onClose: (changed?: boolean) => void;
};

type EnvoyDetailState = {
  config: any;
  resource: string;
  fetch: boolean;
  pod: Pod;
};

export const EnvoyDetailsModal = ({ namespace, workload, isOpen, onClose }: EnvoyDetailModalProps) => (
  <Modal
    isLarge={true}
    title={`Envoy config for ${workload.name}`}
    isOpen={isOpen}
    onClose={onClose}
    actions={[
      <Button key="cancel" variant="secondary" onClick={() => onClose(false)}>
        Cancel
      </Button>
    ]}
  >
    <EnvoyDetail namespace={namespace} workload={workload} onClose={onClose} />
  </Modal>
);

export const Loading = () => (
  <EmptyState variant={EmptyStateVariant.full}>
    <EmptyStateIcon variant="container" component={Spinner} />
    <Title size="lg" headingLevel="h4">
      Loading...
    </Title>
  </EmptyState>
);

class EnvoyDetail extends React.Component<EnvoyDetailProps, EnvoyDetailState> {
  aceEditorRef: React.RefObject<AceEditor>;

  constructor(props: EnvoyDetailProps) {
    super(props);
    this.aceEditorRef = React.createRef();
    this.state = {
      config: 'loading...',
      resource: 'all',
      fetch: true,
      pod: this.sortedPods()[0]
    };
  }

  componentDidMount() {
    this.fetchContent();
  }

  componentDidUpdate() {
    if (this.state.fetch) {
      this.fetchContent();
    }
  }

  sortedPods = (): Pod[] => {
    return this.props.workload.pods.sort((p1: Pod, p2: Pod) => (p1.name >= p2.name ? 1 : -1));
  };

  setPod = (podName: string) => {
    const podIdx: number = +podName;
    const targetPod: Pod = this.sortedPods()[podIdx];
    if (targetPod.name !== this.state.pod.name) {
      this.setState({
        fetch: true,
        pod: targetPod
      });
    }
  };

  setResource = (resource: string) => {
    const resourceIdx: number = +resource;
    const targetResource: string = resources[resourceIdx];
    if (targetResource !== this.state.resource) {
      this.setState({
        fetch: true,
        resource: targetResource
      });
    }
  };

  fetchContent = () => {
    if (this.state.resource === 'all') {
      this.fetchEnvoyProxy();
    } else {
      this.fetchEnvoyProxyResourceEntries();
    }
  };

  fetchEnvoyProxy = () => {
    API.getPodEnvoyProxy(this.props.namespace, this.state.pod.name)
      .then(resultEnvoyProxy => {
        this.setState({
          config: resultEnvoyProxy.data,
          fetch: false
        });
      })
      .catch(error => {
        this.props.onClose();
        AlertUtils.addError(`Could not fetch envoy config for ${this.state.pod.name}.`, error);
      });
  };

  fetchEnvoyProxyResourceEntries = () => {
    API.getPodEnvoyProxyResourceEntries(this.props.namespace, this.state.pod.name, this.state.resource)
      .then(resultEnvoyProxy => {
        this.setState({
          config: resultEnvoyProxy.data,
          fetch: false
        });
      })
      .catch(error => {
        this.props.onClose();
        AlertUtils.addError(
          `Could not fetch envoy config ${this.state.resource} entries for ${this.state.pod.name}.`,
          error
        );
      });
  };

  render() {
    const builder = SummaryWriterBuilder(this.state.resource, this.state.config);
    const SummaryWriterComp = builder[0];
    const summaryWriter = builder[1];
    return (
      <Stack gutter={GutterSize.sm}>
        <StackItem>
          <Toolbar key="envoy-toolbar">
            <ToolbarGroup>
              <ToolbarItem className={displayFlex}>
                <ToolbarDropdown
                  id="envoy_pods_list"
                  nameDropdown={'Pod'}
                  tooltip="Display envoy config for the selected pod"
                  handleSelect={key => this.setPod(key)}
                  value={this.state.pod.name}
                  label={this.state.pod.name}
                  options={this.props.workload.pods.map((pod: Pod) => pod.name).sort()}
                />
              </ToolbarItem>
              <ToolbarItem className={[displayFlex, toolbarSpace].join(' ')}>
                <ToolbarDropdown
                  id="envoy_xds_list"
                  nameDropdown={'Resources'}
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
          <Card style={{ height: '400px' }}>
            {this.state.fetch ? (
              <Loading />
            ) : this.state.resource === 'all' || this.state.resource === 'bootstrap' ? (
              <AceEditor
                ref={this.aceEditorRef}
                mode="yaml"
                theme="eclipse"
                height={'400px'}
                width={'100%'}
                className={'istio-ace-editor'}
                wrapEnabled={true}
                readOnly={true}
                setOptions={aceOptions || { foldStyle: 'markbegin' }}
                value={JSON.stringify(this.state.config, null, 2)}
              />
            ) : (
              <SummaryWriterComp writer={summaryWriter} />
            )}
          </Card>
        </StackItem>
      </Stack>
    );
  }
}
