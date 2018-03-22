import * as React from 'react';
import { SummaryPanelPropType } from '../../types/Graph';
import SummaryPanelEdge from './SummaryPanelEdge';
import SummaryPanelGraph from './SummaryPanelGraph';
import SummaryPanelGroup from './SummaryPanelGroup';
import SummaryPanelNode from './SummaryPanelNode';

type SummaryPanelState = {
  // stateless
};

export default class SummaryPanel extends React.Component<SummaryPanelPropType, SummaryPanelState> {
  render() {
    return (
      <div>
        {this.props.data.summaryType === 'edge' ? (
          <SummaryPanelEdge data={this.props.data} namespace={this.props.namespace} duration={this.props.duration} />
        ) : null}
        {this.props.data.summaryType === 'graph' ? (
          <SummaryPanelGraph data={this.props.data} namespace={this.props.namespace} duration={this.props.duration} />
        ) : null}
        {this.props.data.summaryType === 'group' ? (
          <SummaryPanelGroup data={this.props.data} namespace={this.props.namespace} duration={this.props.duration} />
        ) : null}
        {this.props.data.summaryType === 'node' ? (
          <SummaryPanelNode data={this.props.data} namespace={this.props.namespace} duration={this.props.duration} />
        ) : null}
      </div>
    );
  }
}
