import React from 'react';
import { style } from 'typestyle';

const containerPadding = style({ padding: '0 20px 20px 20px' });
const containerWhite = style({ backgroundColor: '#fff' });

export class RenderHeader extends React.Component {
  render() {
    return <div className={`${containerPadding} ${containerWhite}`}>{this.props.children}</div>;
  }
}
