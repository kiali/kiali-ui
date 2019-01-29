import * as React from 'react';

import { Component } from '../../store/Store';
import { Icon, Tooltip, OverlayTrigger } from 'patternfly-react';
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
const globallyEnabled = 'GLOBAL_MTLS_ENABLED';

class GlobalMTLSStatus extends React.Component<Props> {
  isGloballyEnabled() {
    return this.props.status[statusName] === globallyEnabled;
  }

  infotipContent() {
    return <Tooltip id={'mtls-status-masthead'}>mTLS is globally enabled</Tooltip>;
  }

  render() {
    if (this.isGloballyEnabled()) {
      return (
        <li className={iconStyle}>
          <OverlayTrigger
            placement={'left'}
            overlay={this.infotipContent()}
            trigger={['hover', 'focus']}
            rootClose={false}
          >
            <Icon type="pf" name="locked" />
          </OverlayTrigger>
        </li>
      );
    }

    return null;
  }
}

export default GlobalMTLSStatus;
