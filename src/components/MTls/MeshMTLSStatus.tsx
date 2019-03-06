import * as React from 'react';

import { Component } from '../../store/Store';
import { default as MTLSIcon, MTLSIconTypes } from './MTLSIcon';

type Props = {
  status: { [key: string]: string };
  components: Component[];
  warningMessages: string[];
  className?: string;
  overlayPosition?: string;
};

const statusName = 'Istio mTLS';

enum MTLSStatus {
  ENABLED = 'MTLS_ENABLED',
  PARTIALLY = 'MTLS_PARTIALLY_ENABLED',
  NOT_ENABLED = 'MTLS_NOT_ENABLED'
}

type StatusDescriptor = {
  message: string;
  icon: string;
  showStatus: boolean;
};

const emptyDescriptor = {
  message: '',
  icon: '',
  showStatus: false
};

const StatusDescriptors = new Map<string, StatusDescriptor>([
  [
    MTLSStatus.ENABLED,
    {
      message: 'Namespace-wide mTLS is enabled',
      icon: MTLSIconTypes.LOCKED_FULL,
      showStatus: true
    }
  ],
  [
    MTLSStatus.PARTIALLY,
    {
      message: 'Namespace-wide TLS is partially enabled',
      icon: MTLSIconTypes.LOCKED_HOLLOW,
      showStatus: true
    }
  ],
  [MTLSStatus.NOT_ENABLED, emptyDescriptor]
]);

class MeshMTLSStatus extends React.Component<Props> {
  statusDescriptor() {
    return StatusDescriptors.get(this.props.status[statusName]) || emptyDescriptor;
  }

  icon() {
    return this.statusDescriptor().icon;
  }

  message() {
    return this.statusDescriptor().message;
  }

  showStatus() {
    return this.statusDescriptor().showStatus;
  }

  overlayPosition() {
    return this.props.overlayPosition || 'left';
  }

  iconClassName() {
    return this.props.className || '';
  }

  render() {
    if (this.showStatus()) {
      return (
        <MTLSIcon
          icon={this.icon()}
          iconClassName={this.iconClassName()}
          overlayText={this.message()}
          overlayPosition={this.overlayPosition()}
        />
      );
    }

    return null;
  }
}

export default MeshMTLSStatus;
