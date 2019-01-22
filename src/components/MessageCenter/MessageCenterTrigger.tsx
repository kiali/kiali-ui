import * as React from 'react';
import * as PfReact from 'patternfly-react';
import { Badge, Button, ButtonVariant } from '@patternfly/react-core';
import { BellIcon } from '@patternfly/react-icons/';

type PropsType = {
  newMessagesCount: number;
  systemErrorsCount: number;
  badgeDanger: boolean;
  toggleMessageCenter: () => void;
  toggleSystemErrorsCenter: () => void;
};

export default class MessageCenterTrigger extends React.PureComponent<PropsType, {}> {
  render() {
    return (
      <>
        {this.renderSystemErrorBadge()}
        {this.renderMessageCenterBadge()}
      </>
    );
  }

  private renderSystemErrorBadge = () => {
    if (this.props.systemErrorsCount === 0) {
      return null;
    }

    return (
      <li className="drawer-pf-trigger">
        <a className="nav-item-iconic" onClick={this.props.toggleSystemErrorsCenter}>
          <PfReact.Icon name="warning-triangle-o" type="pf" /> {this.props.systemErrorsCount}
          {this.props.systemErrorsCount === 1 ? ' Open Issue' : ' Open Issues'}
        </a>
      </li>
    );
  };

  private renderMessageCenterBadge = () => {
    return (
      <Button
        id={'bell_icon_warning'}
        aria-label={'Notifications'}
        onClick={this.props.toggleMessageCenter}
        variant={ButtonVariant.plain}
      >
        <BellIcon />
        {this.props.newMessagesCount > 0 && (
          <Badge className={'pf-badge-bodered' + (this.props.badgeDanger ? ' badge-danger' : '')}>
            {this.props.newMessagesCount > 0 ? this.props.newMessagesCount : ' '}
          </Badge>
        )}
      </Button>
    );
  };
}
