import React from 'react';
import { style } from 'typestyle';

const containerPadding = style({ padding: '30px 20px 0 20px' });
const containerWhite = style({ backgroundColor: '#fff' });

export class RenderContent extends React.Component {
  render() {
    return (
      <div className={containerPadding}>
        <div className={containerWhite}>{this.props.children}</div>
      </div>
    );
  }
}
