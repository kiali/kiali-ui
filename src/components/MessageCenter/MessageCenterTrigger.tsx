import * as React from 'react';
import * as PfReact from 'patternfly-react';

/** PFNext */
import { BellIcon } from '@patternfly/react-icons';
import { Badge } from '@patternfly/react-core/dist/js/components/Badge';

type PropsType = {
  newMessagesCount: number;
  systemErrorsCount: number;
  badgeDanger: boolean;
  toggleMessageCenter: () => void;
  toggleSystemErrorsCenter: () => void;
  pfNext?: boolean;
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
    return this.props.pfNext ? (
      <>
        {this.props.newMessagesCount > 0 && (
          <Badge isRead>{this.props.newMessagesCount > 0 ? this.props.newMessagesCount : ' '}</Badge>
        )}
        <BellIcon onClick={this.props.toggleMessageCenter} />
      </>
    ) : (
      <li className="drawer-pf-trigger">
        <a className="nav-item-iconic" onClick={this.props.toggleMessageCenter}>
          <PfReact.Icon name="bell" />
          {this.props.newMessagesCount > 0 && (
            <PfReact.Badge className={'pf-badge-bodered' + (this.props.badgeDanger ? ' badge-danger' : '')}>
              {this.props.newMessagesCount > 0 ? this.props.newMessagesCount : ' '}
            </PfReact.Badge>
          )}
        </a>
      </li>
    );
  };
}
