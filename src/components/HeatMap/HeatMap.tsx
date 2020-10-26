// A heatmap implementation tailored for Kiali design
// (inspired from https://github.com/arunghosh/react-grid-heatmap (MIT), credits to @arunghosh)

import { PfColors } from 'components/Pf/PfColors';
import React from 'react';
import { style } from 'typestyle';

// rgb needs to be in [0,1] bounds
export type Color = { r: number; g: number; b: number };

type Props = {
  xLabels: string[];
  yLabels: string[];
  data: (number | undefined)[][];
  colorRange: { min: Color; max: Color };
  dataRange: { min: number; max: number };
  colorUndefined: string;
  valueFormat: (v: number) => string;
  tooltip: (x: number, y: number, v: number) => string;
};

const cellHeight = '2rem';

const rowStyle = style({
  display: 'flex',
  flexDirection: 'row'
});

const columnStyle = style({
  display: 'flex',
  flexDirection: 'column'
});

const yLabelStyle = style({
  boxSizing: 'border-box',
  padding: '0 0.2rem',
  lineHeight: cellHeight
});

const xLabelRowStyle = style({
  display: 'flex',
  textAlign: 'center'
});

const xLabelStyle = style({
  padding: '0.2rem 0',
  boxSizing: 'border-box',
  overflow: 'hidden',
  flexShrink: 1,
  flexBasis: cellHeight,
  width: cellHeight
});

const cellStyle = style({
  border: '1px solid #000',
  borderWidth: '1px 1px 0 0',
  textAlign: 'center',
  overflow: 'hidden',
  boxSizing: 'border-box',
  flexBasis: cellHeight,
  flexShrink: 0,
  height: cellHeight,
  lineHeight: cellHeight,
  fontSize: '.7rem'
});

export class HeatMap extends React.Component<Props> {
  private getCellColors = (value: number) => {
    const r = Math.floor(256 * this.interpolate(c => c.r, value));
    const g = Math.floor(256 * this.interpolate(c => c.g, value));
    const b = Math.floor(256 * this.interpolate(c => c.b, value));
    const brightness = 0.21 * r + 0.72 * g + 0.07 * b; // https://www.johndcook.com/blog/2009/08/24/algorithms-convert-color-grayscale/
    const textColor = brightness > 90 ? PfColors.Black900 : PfColors.Black300;
    return {
      color: textColor,
      backgroundColor: `rgb(${r},${g},${b})`
    };
  };

  private interpolate = (getColChan: (c: Color) => number, value: number) => {
    const minC = getColChan(this.props.colorRange.min);
    const maxC = getColChan(this.props.colorRange.max);
    const { min, max } = this.props.dataRange;
    const clamped = Math.max(min, Math.min(max, value));
    const ratio = (clamped - min) / (max - min);
    const c = (maxC - minC) * ratio + minC;
    // Returning c² here gives prettier result (darker in middle colors, brighter on bounds)
    return c * c;
  };

  render() {
    return (
      <div className={rowStyle}>
        <div className={columnStyle} style={{ marginTop: cellHeight }}>
          {this.props.yLabels.map(label => (
            <div key={label} className={yLabelStyle}>
              {label}
            </div>
          ))}
        </div>
        <div className={columnStyle}>
          <div className={xLabelRowStyle}>
            {this.props.xLabels.map(label => (
              <div key={label} className={xLabelStyle}>
                {label}
              </div>
            ))}
          </div>
          <div className={columnStyle}>
            {this.props.data.map((rowItems, xi) => (
              <div key={xi} className={rowStyle}>
                {rowItems.map((value, yi) => {
                  if (value) {
                    const style = this.getCellColors(value);
                    return (
                      <div
                        key={`${xi}-${yi}`}
                        className={cellStyle}
                        style={style}
                        title={this.props.tooltip(xi, yi, value)}
                      >
                        {this.props.valueFormat(value)}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`${xi}-${yi}`}
                      className={cellStyle}
                      style={{ backgroundColor: this.props.colorUndefined }}
                    >
                      n/a
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
