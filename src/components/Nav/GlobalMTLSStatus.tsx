import * as React from 'react';

import { Component } from '../../store/Store';
import { Icon } from 'patternfly-react';
import { style } from 'typestyle';
import { PfColors } from '../Pf/PfColors';

type Props = {
  status: { [key: string]: string };
  components: Component[];
  warningMessages: string[];
};

const iconStyle = style({
  marginTop: 20,
  marginRight: 8,
  color: PfColors.Green
});

const statusName = 'Istio mTLS';
const globallyEnabled = 'GLOBALLY_ENABLED';

class GlobalMTLSStatus extends React.Component<Props> {
  render() {
    if (this.props.status[statusName] === globallyEnabled) {
      return (
        <li className={iconStyle}>
          <Icon type="pf" name="locked" />
        </li>
      );
    }

    return null;
  }
}

export default GlobalMTLSStatus;
