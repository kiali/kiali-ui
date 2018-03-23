import * as React from 'react';
import Switch from 'react-bootstrap-switch';
import { Toolbar } from 'patternfly-react';

interface LabelFilterType {
  showEdgeLabels: boolean;
  showNodeLabels: boolean;
}

type LabelFilterProps = LabelFilterType;
type LabelFilterState = LabelFilterType;

export default class LabelsFilter extends React.Component<LabelFilterProps, LabelFilterState> {
  constructor(props: LabelFilterProps) {
    super(props);
    this.state = {
      showEdgeLabels: false,
      showNodeLabels: true
    };
  }

  toggleEdgeLabels(elem: any, state: any) {
    this.setState({ showEdgeLabels: !this.state.showEdgeLabels });
    console.log('new edge state:', state);
  }

  toggleNodeLabels(elem: any, state: any) {
    this.setState({ showEdgeLabels: !this.state.showEdgeLabels });
    console.log('new node state:', state);
  }

  render() {
    return (
      <Toolbar.RightContent style={{ marginLeft: 10, marginRight: 15 }}>
        <span style={{ marginLeft: 10 }}>
          <Switch
            bsSize={'medium'}
            labelText={'Edges'}
            defaultValue={false}
            onChange={(el, state) => this.toggleEdgeLabels(el, state)}
          />
        </span>
        <span style={{ marginLeft: 10 }}>
          <Switch
            bsSize={'medium'}
            labelText={'Nodes'}
            defaultValue={true}
            onChange={(el, state) => this.toggleNodeLabels(el, state)}
          />
        </span>
      </Toolbar.RightContent>
    );
  }
}
