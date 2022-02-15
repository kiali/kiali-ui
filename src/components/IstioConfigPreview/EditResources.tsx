import * as React from 'react';
import { IstioConfigItem } from './IstioConfigPreview';
import { jsYaml } from '../../types/AceValidations';
import AceEditor from 'react-ace';
import { Tab, Tabs } from '@patternfly/react-core';
import { EditorPreview } from './EditorPreview';
import { safeDumpOptions } from '../../types/IstioConfigDetails';
import _ from 'lodash';

interface Props {
  items: IstioConfigItem[];
  orig: IstioConfigItem[];
  isIstioNew?: boolean;
  onChange: (obj, index) => void;
}

interface State {
  resourceTab: number;
}

export class EditResources extends React.Component<Props, State> {
  aceEditorRef: React.RefObject<AceEditor>;
  constructor(props: Props) {
    super(props);
    this.state = { resourceTab: 0 };
    this.aceEditorRef = React.createRef();
  }

  render() {
    return (
      <Tabs activeKey={this.state.resourceTab} onSelect={(_, tab) => this.setState({ resourceTab: Number(tab) })}>
        {this.props.items
          .sort((a, b) =>
            this.props.isIstioNew
              ? a.metadata.namespace!.localeCompare(b.metadata.namespace!)
              : a.metadata.name.localeCompare(b.metadata.name)
          )
          .map((item, i) => {
            return (
              <Tab
                eventKey={i}
                key={i}
                title={
                  <>
                    {this.props.isIstioNew ? item.metadata.namespace : item.metadata.name}{' '}
                    {!_.isEqual(
                      item,
                      this.props.orig.filter(it =>
                        this.props.isIstioNew
                          ? it.metadata.namespace === item.metadata.namespace
                          : it.metadata.name === item.metadata.name
                      )[0]
                    ) && '*'}
                  </>
                }
              >
                <EditorPreview
                  yaml={jsYaml.safeDump(item, safeDumpOptions)}
                  onChange={obj => this.props.onChange(obj, i)}
                />
              </Tab>
            );
          })}
      </Tabs>
    );
  }
}
