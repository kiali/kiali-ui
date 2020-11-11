import * as React from 'react';
import { style } from 'typestyle';
import { PfColors } from '../../components/Pf/PfColors';

type Props = {
  filterToolbar?: JSX.Element;
  rightToolbar?: JSX.Element;
  actionsToolbar?: JSX.Element;
};

const containerPadding = style({
  backgroundColor: PfColors.White,
  padding: '0px 20px 0px 20px'
});

const containerFlex = style({
  display: 'flex',
  flexWrap: 'wrap'
});

const filterToolbarStyle = style({
  paddingTop: '10px'
});

const rightToolbarStyle = style({
  marginLeft: 'auto',
  height: '118px',
  padding: '10px 0px 0px 0px'
});

const actionsToolbarStyle = style({});

class OverviewHeader extends React.Component<Props> {
  render() {
    return (
      <div className={containerPadding}>
        <div className={containerFlex}>
          <div className={filterToolbarStyle}>{this.props.filterToolbar}</div>
          <div className={rightToolbarStyle}>
            {this.props.rightToolbar}
            <div className={actionsToolbarStyle}>{this.props.actionsToolbar}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default OverviewHeader;
