import * as React from 'react';

import { Component } from '../../store/Store';
import { MTLSIconTypes } from './MTLSIcon';
import { default as MTLSStatus, emptyDescriptor, MTLSStatuses, StatusDescriptor } from './MTLSStatus';
import { style } from 'typestyle';

type Props = {
  status: { [key: string]: string };
  components: Component[];
  warningMessages: string[];
};

const statusName = 'Istio mTLS';

const statusDescriptors = new Map<string, StatusDescriptor>([
  [
    MTLSStatuses.ENABLED,
    {
      message: 'Mesh-wide mTLS is enabled',
      icon: MTLSIconTypes.LOCK_FULL,
      showStatus: true
    }
  ],
  [
    MTLSStatuses.PARTIALLY,
    {
      message: 'Mesh-wide TLS is partially enabled',
      icon: MTLSIconTypes.LOCK_HOLLOW,
      showStatus: true
    }
  ],
  [MTLSStatuses.NOT_ENABLED, emptyDescriptor]
]);

class MeshMTLSStatus extends React.Component<Props> {
  iconStyle() {
    return style({
      marginTop: 18,
      marginRight: 8,
      width: 13
    });
  }

  render() {
    return (
      <li className={this.iconStyle()}>
        <MTLSStatus
          status={this.props.status[statusName]}
          statusDescriptors={statusDescriptors}
          overlayPosition={'left'}
        />
      </li>
    );
  }
}

export default MeshMTLSStatus;
