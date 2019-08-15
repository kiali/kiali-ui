import * as React from 'react';
import Draggable from 'react-draggable';
import { style } from 'typestyle';
import { Button, Icon } from 'patternfly-react';
import legendData, { GraphLegendItem, GraphLegendItemRow } from './GraphLegendData';

export interface GraphLegendProps {
  closeLegend: () => void;
  className?: string;
  isMTLSEnabled: boolean;
}

export interface GraphLegendState {
  width: number;
  height: number;
}

export default class GraphLegend extends React.Component<GraphLegendProps, GraphLegendState> {
  constructor(props: GraphLegendProps) {
    super(props);
    this.state = {
      width: 300,
      height: 660
    };
  }

  render() {
    const parentClassName = this.props.className ? this.props.className : '';
    const width = 'calc(100vw - 50px - var(--pf-c-page__sidebar--md--Width))'; // 50px prevents full coverage
    const maxWidth = this.state.width + 2; // +2 includes border and prevents scroll

    const contentStyle = style({
      width: width,
      maxWidth: maxWidth
    });

    const headerStyle = style({
      width: this.state.width
    });

    const bodyStyle = style({
      width: this.state.width,
      height: this.state.height,
      overflowY: 'scroll',
      overflowX: 'hidden'
    });

    const legendListStyle = style({
      display: 'flex',
      flexDirection: 'column'
    });

    return (
      <Draggable bounds="#root">
        <div className={`modal-content ${parentClassName} ${contentStyle}`}>
          <div className={`modal-header ${headerStyle}`}>
            <Button className="close" bsClass="" onClick={this.props.closeLegend}>
              <Icon title="Close" type="pf" name="close" />
            </Button>
            <span className="modal-title">Graph Legend</span>
          </div>
          <div className={`modal-body ${bodyStyle}`}>
            <div className={legendListStyle}>{this.renderGraphLegendList(legendData)}</div>
          </div>
        </div>
      </Draggable>
    );
  }

  renderGraphLegendList(legendData: GraphLegendItem[]) {
    const legendColumnHeadingStyle = style({
      fontSize: '1.3em',
      fontWeight: 'bold',
      paddingTop: '10px'
    });

    return (
      <>
        {legendData.map((legendItem: GraphLegendItem) => (
          <div key={legendItem.title} className={legendColumnHeadingStyle}>
            {legendItem.title}
            {GraphLegend.renderLegendRowItems(legendItem.data)}
          </div>
        ))}
      </>
    );
  }

  static renderLegendRowItems(legendData: GraphLegendItemRow[]) {
    const legendRowStyle = style({
      overflowY: 'scroll'
    });
    return (
      <div className={legendRowStyle}>
        {legendData.map((legendItemRow: GraphLegendItemRow) => GraphLegend.renderLegendIconAndLabel(legendItemRow))}
      </div>
    );
  }

  static renderLegendIconAndLabel(legendItemRow: GraphLegendItemRow) {
    const legendItemContainerStyle = style({
      fontSize: '1em',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '270px',
      padding: '5px 5px 0 5px'
    });

    const legendItemLabelStyle = style({
      fontSize: '1em',
      fontWeight: 'normal',
      width: '160px'
    });

    return (
      <div key={legendItemRow.icon} className={legendItemContainerStyle}>
        <img alt={legendItemRow.label} src={legendItemRow.icon} />
        <span className={legendItemLabelStyle}>{legendItemRow.label}</span>
      </div>
    );
  }
}
