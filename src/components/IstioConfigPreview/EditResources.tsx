import * as React from 'react';
import { AuthorizationPolicy, Sidecar } from 'types/IstioObjects';
import { jsYaml } from '../../types/AceValidations';
import AceEditor from 'react-ace';
import { Grid, GridItem, Tab, Tabs } from '@patternfly/react-core';
import { EditorPreview } from './EditorPreview';
import { safeDumpOptions } from '../../types/IstioConfigDetails';
import { style } from 'typestyle';
import _ from 'lodash';

type PolicyItem = AuthorizationPolicy | Sidecar;

interface Props {
  items: PolicyItem[];
  orig: PolicyItem[];
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
      <Grid className={style({ padding: '20px' })}>
        <GridItem span={12}>
          <Tabs activeKey={this.state.resourceTab} onSelect={(_, tab) => this.setState({ resourceTab: Number(tab) })}>
            {this.props.items
              .sort((a, b) => a.metadata.name.localeCompare(b.metadata.name))
              .map((item, i) => {
                return (
                  <Tab
                    eventKey={i}
                    key={i}
                    title={
                      <>
                        {item.metadata.name}{' '}
                        {!_.isEqual(item, this.props.orig.filter(it => it.metadata.name === item.metadata.name)[0]) &&
                          '*'}
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
        </GridItem>
      </Grid>
    );
  }
}
