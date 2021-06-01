import * as React from 'react';
import { connect } from 'react-redux';
import { KialiAppState } from 'store/Store';
import { namespaceItemsSelector } from 'store/Selectors';
import { RenderComponentScroll } from 'components/Nav/Page';
import { ISortBy, SortByDirection } from '@patternfly/react-table';
import { Workload } from 'types/Workload';
import { EnvoyProxyDump, Pod } from 'types/IstioObjects';
import * as API from '../../services/Api';
import * as AlertUtils from '../../utils/AlertUtils';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Checkbox,
  Grid,
  GridItem,
  TooltipPosition
} from '@patternfly/react-core';
import { SummaryTableBuilder } from './tables/BaseTable';
import Namespace from 'types/Namespace';
import { style } from 'typestyle';
import AceEditor from 'react-ace';
import { PFBadge, PFBadges } from 'components/Pf/PfBadges';
import ToolbarDropdown from 'components/ToolbarDropdown/ToolbarDropdown';
import { KialiIcon, defaultIconStyle } from 'config/KialiIcon';
import { aceOptions } from 'types/IstioConfigDetails';
import { CopyToClipboard } from 'react-copy-to-clipboard';

// Enables the search box for the ACEeditor
require('ace-builds/src-noconflict/ext-searchbox');

const iconStyle = style({
  display: 'inline-block',
  paddingTop: '5px'
});

export type ResourceSorts = { [resource: string]: ISortBy };

type ReduxProps = {
  namespaces: Namespace[];
};

type EnvoyDetailsProps = ReduxProps & {
  namespace: string;
  workload: Workload;
  resource: string;
};

type EnvoyDetailsState = {
  config: EnvoyProxyDump;
  pod: Pod;
  tableSortBy: ResourceSorts;
  onlyBootstrap: boolean;
};

class EnvoyDetails extends React.Component<EnvoyDetailsProps, EnvoyDetailsState> {
  aceEditorRef: React.RefObject<AceEditor>;

  constructor(props: EnvoyDetailsProps) {
    super(props);

    this.aceEditorRef = React.createRef();

    this.state = {
      pod: this.sortedPods()[0],
      config: {},
      onlyBootstrap: false,
      tableSortBy: {
        clusters: {
          index: 0,
          direction: 'asc'
        },
        listeners: {
          index: 0,
          direction: 'asc'
        },
        routes: {
          index: 0,
          direction: 'asc'
        }
      }
    };
  }

  componentDidMount() {
    this.fetchContent();
  }

  componentDidUpdate(prevProps: EnvoyDetailsProps, prevState: EnvoyDetailsState) {
    if (
      this.state.pod.name !== prevState.pod.name ||
      this.props.resource !== prevProps.resource ||
      this.state.onlyBootstrap !== prevState.onlyBootstrap
    ) {
      this.fetchContent();
    }
  }

  fetchEnvoyProxyResourceEntries = (resource: string) => {
    API.getPodEnvoyProxyResourceEntries(this.props.namespace, this.state.pod.name, resource)
      .then(resultEnvoyProxy => {
        this.setState({
          config: resultEnvoyProxy.data
        });
      })
      .catch(error => {
        AlertUtils.addError(`Could not fetch envoy config ${resource} entries for ${this.state.pod.name}.`, error);
      });
  };

  fetchEnvoyProxy = () => {
    API.getPodEnvoyProxy(this.props.namespace, this.state.pod.name)
      .then(resultEnvoyProxy => {
        this.setState({
          config: resultEnvoyProxy.data
        });
      })
      .catch(error => {
        AlertUtils.addError(`Could not fetch envoy config for ${this.state.pod.name}.`, error);
      });
  };

  fetchContent = () => {
    if (this.props.resource === 'all') {
      if (this.state.onlyBootstrap) {
        this.fetchEnvoyProxyResourceEntries('bootstrap');
      } else {
        this.fetchEnvoyProxy();
      }
    } else {
      this.fetchEnvoyProxyResourceEntries(this.props.resource);
    }
  };

  setPod = (podName: string) => {
    const podIdx: number = +podName;
    const targetPod: Pod = this.sortedPods()[podIdx];
    if (targetPod.name !== this.state.pod.name) {
      this.setState({
        config: {},
        pod: targetPod
      });
    }
  };

  sortedPods = (): Pod[] => {
    return this.props.workload.pods.sort((p1: Pod, p2: Pod) => (p1.name >= p2.name ? 1 : -1));
  };

  onSort = (tab: string, index: number, direction: SortByDirection) => {
    if (this.state.tableSortBy[tab].index !== index || this.state.tableSortBy[tab].direction !== direction) {
      let tableSortBy = this.state.tableSortBy;
      tableSortBy[tab].index = index;
      tableSortBy[tab].direction = direction;
      this.setState({
        tableSortBy: tableSortBy
      });
    }
  };

  editorContent = () => JSON.stringify(this.state.config, null, '  ');

  onCopyToClipboard = (_text: string, _result: boolean) => {
    const editor = this.aceEditorRef.current!['editor'];
    if (editor) {
      editor.selectAll();
    }
  };

  onOnlyBootstrap = () => {
    this.setState({ onlyBootstrap: !this.state.onlyBootstrap });
  };

  showEditor = () => {
    return this.props.resource === 'all' || this.props.resource === 'bootstrap';
  };

  render() {
    const builder = SummaryTableBuilder(
      this.props.resource,
      this.state.config,
      this.state.tableSortBy,
      this.props.namespaces,
      this.props.namespace
    );
    const SummaryWriterComp = builder[0];
    const summaryWriter = builder[1];
    return (
      <RenderComponentScroll>
        <Grid>
          <GridItem span={12}>
            <Card>
              <CardBody>
                {this.showEditor() ? (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <div key="service-icon" className={iconStyle}>
                        <PFBadge badge={PFBadges.Pod} position={TooltipPosition.top} />
                      </div>
                      <ToolbarDropdown
                        id="envoy_pods_list"
                        tooltip="Display envoy config for the selected pod"
                        handleSelect={key => this.setPod(key)}
                        value={this.state.pod.name}
                        label={this.state.pod.name}
                        options={this.props.workload.pods.map((pod: Pod) => pod.name).sort()}
                      />
                      <span style={{ float: 'right' }}>
                        <CopyToClipboard onCopy={this.onCopyToClipboard} text={this.editorContent()}>
                          <Button variant={ButtonVariant.link} isInline>
                            <KialiIcon.Copy className={defaultIconStyle} />
                          </Button>
                        </CopyToClipboard>
                      </span>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <Checkbox
                        onChange={this.onOnlyBootstrap}
                        label="Show only bootstrap configuration"
                        aria-label="show only boostrap configuration"
                        isChecked={this.state.onlyBootstrap}
                        id="only-bootstrap"
                      />
                    </div>
                    <AceEditor
                      ref={this.aceEditorRef}
                      mode="yaml"
                      theme="eclipse"
                      width={'100%'}
                      className={'istio-ace-editor'}
                      wrapEnabled={true}
                      readOnly={true}
                      setOptions={aceOptions || { foldStyle: 'markbegin' }}
                      value={this.editorContent()}
                    />
                  </div>
                ) : (
                  <SummaryWriterComp
                    writer={summaryWriter}
                    sortBy={this.state.tableSortBy}
                    onSort={this.onSort}
                    pod={this.state.pod.name}
                    pods={this.props.workload.pods.map(pod => pod.name)}
                    setPod={this.setPod}
                  />
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </RenderComponentScroll>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  namespaces: namespaceItemsSelector(state)!
});

const EnvoyDetailsContainer = connect(mapStateToProps)(EnvoyDetails);

export default EnvoyDetailsContainer;
