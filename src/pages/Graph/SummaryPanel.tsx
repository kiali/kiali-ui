import * as React from 'react';
import { Icon } from 'patternfly-react';
import { style } from 'typestyle';
import { SummaryPanelPropType } from '../../types/Graph';
import SummaryPanelEdge from './SummaryPanelEdge';
import SummaryPanelGraph from './SummaryPanelGraph';
import SummaryPanelGroup from './SummaryPanelGroup';
import SummaryPanelNode from './SummaryPanelNode';

type MainSummaryPanelPropType = SummaryPanelPropType & {
  isPageVisible: boolean;
  onToggle: (isCollapsed: boolean) => void;
};

const expandedStyle = style({
  paddingTop: '1em',
  position: 'relative'
});

const collapsedStyle = style({
  paddingTop: '1em',
  position: 'relative',
  $nest: {
    '& > .panel': {
      display: 'none'
    }
  }
});

const toggleSidePanelStyle = style({
  backgroundColor: 'white',
  border: '1px #ddd solid',
  borderRadius: '3px',
  cursor: 'pointer',
  left: '-1.7em',
  minWidth: '5em',
  position: 'absolute',
  textAlign: 'center',
  top: '6.5em',
  transform: 'rotate(-90deg)',
  transformOrigin: 'left top 0'
});

export default class SummaryPanel extends React.Component<MainSummaryPanelPropType> {
  private isCollapsed: boolean = false;

  constructor(props: MainSummaryPanelPropType) {
    super(props);
  }

  componentDidUpdate(prevProps: Readonly<MainSummaryPanelPropType>): void {
    const summaryTarget = this.props.data.summaryTarget;
    if (prevProps.data.summaryTarget !== summaryTarget) {
      this.setState({ isVisible: true });
    }
  }

  render() {
    if (!this.props.isPageVisible || !this.props.data.summaryTarget) {
      return null;
    }
    return (
      <div className={this.isCollapsed ? collapsedStyle : expandedStyle}>
        <div className={toggleSidePanelStyle} onClick={this.togglePanel}>
          {this.isCollapsed ? (
            <>
              <Icon name="angle-double-down" /> Hide
            </>
          ) : (
            <>
              <Icon name="angle-double-up" /> Show
            </>
          )}
        </div>
        {this.props.data.summaryType === 'edge' ? <SummaryPanelEdge {...this.props} /> : null}
        {this.props.data.summaryType === 'graph' ? (
          <SummaryPanelGraph
            data={this.props.data}
            namespaces={this.props.namespaces}
            graphType={this.props.graphType}
            injectServiceNodes={this.props.injectServiceNodes}
            queryTime={this.props.queryTime}
            duration={this.props.duration}
            step={this.props.step}
            rateInterval={this.props.rateInterval}
          />
        ) : null}
        {this.props.data.summaryType === 'group' ? (
          <SummaryPanelGroup
            data={this.props.data}
            namespaces={this.props.data.summaryTarget.namespaces}
            graphType={this.props.graphType}
            injectServiceNodes={this.props.injectServiceNodes}
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
            namespaces={this.props.namespaces}
            graphType={this.props.graphType}
            injectServiceNodes={this.props.injectServiceNodes}
            duration={this.props.duration}
            step={this.props.step}
            rateInterval={this.props.rateInterval}
          />
        ) : null}
      </div>
    );
  }

  private togglePanel = () => {
    this.isCollapsed = !this.isCollapsed;
    this.props.onToggle(this.isCollapsed);
  };
}
