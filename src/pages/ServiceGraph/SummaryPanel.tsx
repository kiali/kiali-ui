import * as React from 'react';
import { SummaryPanelPropType } from '../../types/Graph';
import SummaryPanelEdge from './SummaryPanelEdge';
import SummaryPanelGraph from './SummaryPanelGraph';
import SummaryPanelGroup from './SummaryPanelGroup';
import SummaryPanelNode from './SummaryPanelNode';

export default class SummaryPanel extends React.Component<SummaryPanelPropType, {}> {
  updateSummary = () => {
    this.forceUpdate();
  };

  componentDidMount() {
    window.addEventListener('resize', this.updateSummary);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSummary);
  }

  render() {
    if (window.innerWidth > 1024) {
      return (
        <>
          {this.props.data.summaryType === 'edge' ? (
            <SummaryPanelEdge
              data={this.props.data}
              namespace={this.props.namespace}
              queryTime={this.props.queryTime}
              duration={this.props.duration}
              step={this.props.step}
              rateInterval={this.props.rateInterval}
            />
          ) : null}
          {this.props.data.summaryType === 'graph' ? (
            <SummaryPanelGraph
              data={this.props.data}
              namespace={this.props.namespace}
              queryTime={this.props.queryTime}
              duration={this.props.duration}
              step={this.props.step}
              rateInterval={this.props.rateInterval}
            />
          ) : null}
          {this.props.data.summaryType === 'group' ? (
            <SummaryPanelGroup
              data={this.props.data}
              namespace={this.props.namespace}
              queryTime={this.props.queryTime}
              duration={this.props.duration}
              step={this.props.step}
              rateInterval={this.props.rateInterval}
            />
          ) : null}
          {this.props.data.summaryType === 'node' ? (
            <SummaryPanelNode
              data={this.props.data}
              queryTime={this.props.queryTime}
              namespace={this.props.namespace}
              duration={this.props.duration}
              step={this.props.step}
              rateInterval={this.props.rateInterval}
            />
          ) : null}
        </>
      );
    } else {
      // Just a placeholder, just something that is not going to be rendered.
      return <span />;
    }
  }
}
