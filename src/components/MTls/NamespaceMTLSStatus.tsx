import * as React from 'react';

import { MTLSIconTypes } from './MTLSIcon';
import { default as MTLSStatus, emptyDescriptor, MTLSStatuses, StatusDescriptor } from './MTLSStatus';
import { style } from 'typestyle';
import { KialiAppState } from '../../store/Store';
import { connect } from 'react-redux';
import { meshWideMTLSStatusSelector } from '../../store/Selectors';

type ReduxProps = {
  meshStatus: string;
};

type Props = ReduxProps & {
  status: string;
};

const statusDescriptors = new Map<string, StatusDescriptor>([
  [
    MTLSStatuses.ENABLED,
    {
      message: 'mTLS is enabled for this namespace',
      icon: MTLSIconTypes.LOCK_FULL_DARK,
      showStatus: true
    }
  ],
  [
    MTLSStatuses.PARTIALLY,
    {
      message: 'mTLS is partially enabled for this namespace',
      icon: MTLSIconTypes.LOCK_HOLLOW_DARK,
      showStatus: true
    }
  ],
  [MTLSStatuses.DISABLED, emptyDescriptor],
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

  status() {
    let finalStatus = this.props.status;

    // When mTLS is enabled meshwide but not disabled at ns level
    // Then the ns has mtls enabled
    if (this.props.meshStatus === MTLSStatuses.ENABLED && this.props.status === MTLSStatuses.NOT_ENABLED) {
      finalStatus = MTLSStatuses.ENABLED;
    }

    return finalStatus;
  }

  render() {
    return (
      <MTLSStatus
        status={this.status()}
        className={this.iconStyle()}
        statusDescriptors={statusDescriptors}
        overlayPosition={'left'}
      />
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  meshStatus: meshWideMTLSStatusSelector(state)
});

const NamespaceMTLSStatusContainer = connect(mapStateToProps)(NamespaceMTLSStatus);

export default NamespaceMTLSStatusContainer;
