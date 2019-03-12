import * as React from 'react';

import { default as MTLSIcon } from './MTLSIcon';

type Props = {
  status: string;
  statusDescriptors: Map<string, StatusDescriptor>;
  className?: string;
  overlayPosition?: string;
};

export enum MTLSStatuses {
  ENABLED = 'MTLS_ENABLED',
  PARTIALLY = 'MTLS_PARTIALLY_ENABLED',
  NOT_ENABLED = 'MTLS_NOT_ENABLED',
  DISABLED = 'MTLS_DISABLED'
}

export type StatusDescriptor = {
  message: string;
  icon: string;
  showStatus: boolean;
};

export const emptyDescriptor = {
  message: '',
  icon: '',
  showStatus: false
};

class MTLSStatus extends React.Component<Props> {
  statusDescriptor() {
    return this.props.statusDescriptors.get(this.props.status) || emptyDescriptor;
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

export default MTLSStatus;
