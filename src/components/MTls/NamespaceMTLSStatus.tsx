import * as React from 'react';

import { MTLSIconTypes } from './MTLSIcon';
import { default as MTLSStatus, emptyDescriptor, MTLSStatuses, StatusDescriptor } from './MTLSStatus';
import { style } from 'typestyle';

type Props = {
  status: string;
};

const statusDescriptors = new Map<string, StatusDescriptor>([
  [
    MTLSStatuses.ENABLED,
    {
      message: 'mTLS is enabled for this namespace',
      icon: MTLSIconTypes.LOCK_FULL,
      showStatus: true
    }
  ],
  [
    MTLSStatuses.PARTIALLY,
    {
      message: 'mTLS is partially enabled for this namespace',
      icon: MTLSIconTypes.LOCK_HOLLOW,
      showStatus: true
    }
  ],
  [MTLSStatuses.NOT_ENABLED, emptyDescriptor]
]);

class NamespaceMTLSStatus extends React.Component<Props> {
  iconStyle() {
    return style({
      marginTop: -2,
      marginRight: 6,
      width: 10
    });
  }

  render() {
    return (
      <MTLSStatus
        status={this.props.status}
        className={this.iconStyle()}
        statusDescriptors={statusDescriptors}
        overlayPosition={'left'}
      />
    );
  }
}

export default NamespaceMTLSStatus;
