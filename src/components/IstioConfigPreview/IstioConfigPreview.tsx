import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Modal,
  Tab,
  Tabs,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Tooltip
} from '@patternfly/react-core';
import {
  AuthorizationPolicy,
  DestinationRule,
  Gateway,
  PeerAuthentication,
  Sidecar,
  VirtualService
} from 'types/IstioObjects';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { style } from 'typestyle';
import { KialiIcon, defaultIconStyle } from '../../config/KialiIcon';
import { safeDumpOptions } from '../../types/IstioConfigDetails';
import { jsYaml } from '../../types/AceValidations';
import { EditResources } from './EditResources';
import { cloneDeep } from 'lodash';
import _ from 'lodash';

export type IstioConfigItem =
  | AuthorizationPolicy
  | Sidecar
  | DestinationRule
  | PeerAuthentication
  | Gateway
  | VirtualService;

export interface ConfigPreviewItem {
  title: string;
  type: string;
  items: IstioConfigItem[];
}

interface Props {
  isOpen: boolean;
  ns: string;
  title?: string;
  actions?: any;
  items: ConfigPreviewItem[];
  opTarget: string;
  onClose: () => void;
  onKeyPress?: (e: any) => void;
  onConfirm: (items: ConfigPreviewItem[]) => void;
}

interface State {
  items: ConfigPreviewItem[];
  mainTab: string;
}

const separator = '\n---\n\n';

export class IstioConfigPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mainTab: this.props.items.length > 0 ? this.props.items[0].title.toLocaleLowerCase().replace(/\s/g, '') : '',
      items: cloneDeep(this.props.items)
    };
  }
  componentDidUpdate(prevProps: Props) {
    if (!_.isEqual(prevProps.items, this.props.items)) {
      this.setStateValues(this.props.items);
    }
  }

  setStateValues = (items: ConfigPreviewItem[]) => {
    this.setState({
      mainTab: items.length > 0 ? items[0].title.toLocaleLowerCase().replace(/\s/g, '') : '',
      items: cloneDeep(items)
    });
  };

  trafficToText = () => {
    var trafficPoliciesYaml = '';
    this.state.items.map(obj => {
      trafficPoliciesYaml += obj.items.map(item => jsYaml.safeDump(item, safeDumpOptions)).join(separator);
      trafficPoliciesYaml += separator;
      return undefined;
    });
    return trafficPoliciesYaml;
  };

  downloadTraffic = () => {
    const element = document.createElement('a');
    const file = new Blob([this.trafficToText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'trafficPolicies_' + this.props.ns + '.yaml';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  onConfirm = () => {
    this.props.onConfirm(this.state.items);
    this.setStateValues([]);
  };

  editorChange = (object: IstioConfigItem, index: number, title: string) => {
    const items = this.state.items;
    const ind = items.findIndex(it => it.title === title);
    const config = items[ind];
    config.items[index] = object;
    items[ind] = config;
    this.setState({ items });
  };

  addResource = (item: ConfigPreviewItem) => {
    const key = item.title.toLocaleLowerCase().replace(/\s/g, '');
    const propItems =
      this.props.items.length > 0 ? this.props.items.filter(it => it.title === item.title)[0].items : undefined;
    return (
      <Tab eventKey={key} key={key + '_tab_preview'} title={item.title}>
        <EditResources
          items={item.items}
          orig={propItems as IstioConfigItem[]}
          onChange={(obj, index) => this.editorChange(obj, index, item.title)}
        />
      </Tab>
    );
  };

  render() {
    return (
      <Modal
        width={'75%'}
        title={this.props.title ? this.props.title : 'Preview Traffic Policies '}
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        onKeyPress={e => (this.props.onKeyPress ? this.props.onKeyPress(e) : {})}
        actions={
          this.props.actions
            ? this.props.actions
            : [
                <Button key="cancel" variant="secondary" onClick={this.props.onClose}>
                  Cancel
                </Button>,
                <Button
                  key={this.props.opTarget}
                  variant={this.props.opTarget === 'delete' ? 'danger' : 'primary'}
                  onClick={this.onConfirm}
                >
                  {this.props.opTarget && this.props.opTarget[0].toUpperCase() + this.props.opTarget.substr(1)}
                </Button>
              ]
        }
      >
        <Toolbar>
          <ToolbarGroup
            className={style({
              marginLeft: 'auto'
            })}
          >
            <ToolbarItem>
              <Tooltip content={<>Copy all resources</>}>
                <CopyToClipboard text={this.trafficToText()}>
                  <Button variant={ButtonVariant.link} aria-label="Copy" isInline>
                    <KialiIcon.Copy className={defaultIconStyle} />
                  </Button>
                </CopyToClipboard>
              </Tooltip>
            </ToolbarItem>
            <ToolbarItem>
              <Tooltip content={<>Download all resources in a file</>}>
                <Button
                  variant={ButtonVariant.link}
                  isInline
                  aria-label="Download"
                  className={style({ marginLeft: '0.5em' })}
                  onClick={() => this.downloadTraffic()}
                >
                  <KialiIcon.Download className={defaultIconStyle} />
                </Button>
              </Tooltip>
            </ToolbarItem>
          </ToolbarGroup>
        </Toolbar>

        {this.state.items.length > 0 && (
          <Tabs
            activeKey={this.state.mainTab}
            onSelect={(_, tab) => this.setState({ mainTab: String(tab) })}
            isFilled={true}
          >
            {this.state.items.map(item => this.addResource(item))}
          </Tabs>
        )}
      </Modal>
    );
  }
}
