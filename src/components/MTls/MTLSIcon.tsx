import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'patternfly-react';

type Props = {
  icon: string;
  iconClassName: string;
  overlayText: string;
  overlayPosition: string;
};

const fullIcon = require('../../assets/img/mtls-status-full.svg');
const hollowIcon = require('../../assets/img/mtls-status-partial.svg');

export enum MTLSIconTypes {
  LOCK_FULL = 'LOCK_FULL',
  LOCK_HOLLOW = 'LOCK_HOLLOW'
}

const nameToSource = new Map<string, string>([
  [MTLSIconTypes.LOCK_FULL, fullIcon],
  [MTLSIconTypes.LOCK_HOLLOW, hollowIcon]
]);

class MTLSIcon extends React.Component<Props> {
  infotipContent() {
    return <Tooltip id={'mtls-status-masthead'}>{this.props.overlayText}</Tooltip>;
  }

  render() {
    return (
      <OverlayTrigger
        placement={this.props.overlayPosition}
        overlay={this.infotipContent()}
        trigger={['hover', 'focus']}
        rootClose={false}
      >
        <img
          className={this.props.iconClassName}
          src={nameToSource.get(this.props.icon)}
          alt={this.props.overlayPosition}
        />
      </OverlayTrigger>
    );
  }
}
export default MTLSIcon;
