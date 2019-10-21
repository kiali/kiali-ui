import * as React from 'react';
import { connect } from 'react-redux';
import { Expandable } from '@patternfly/react-core';
import { MessageType, NotificationMessage } from '../../types/MessageCenter';
import moment from 'moment';
import { MessageCenterActions } from 'actions/MessageCenterActions';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import { KialiAppAction } from 'actions/KialiAppAction';

// KIALI-3172 For some reason not fully explained, when loaded with "import" it happens that the NotificationDrawer
// does not come with the expected ".Title", ".Accordion" (etc.) fields.
// Which ends up in React error "Element type is invalid" as those components are undefined.
// Using the "require" way is a workaround.
// Note that it is unclear what triggers the error
// (may happen with or without lazy loading, generally not seen using `yarn start` but seen with build)
const Pf = require('patternfly-react');

const typeForPfIcon = (type: MessageType) => {
  switch (type) {
    case MessageType.ERROR:
      return 'error-circle-o';
    case MessageType.INFO:
      return 'info';
    case MessageType.SUCCESS:
      return 'ok';
    case MessageType.WARNING:
      return 'warning-triangle-o';
    default:
      throw Error('Unexpected type');
  }
};

type ReduxProps = {
  markAsRead: (message: NotificationMessage) => void;
  toggleMessageDetail: (message: NotificationMessage) => void;
};

type AlertDrawerMessageProps = ReduxProps & {
  message: NotificationMessage;
};

class AlertDrawerMessage extends React.PureComponent<AlertDrawerMessageProps> {
  render() {
    return (
      <Pf.Notification seen={this.props.message.seen} onClick={() => this.props.markAsRead(this.props.message)}>
        <Pf.Icon className="pull-left" type="pf" name={typeForPfIcon(this.props.message.type)} />
        <Pf.Notification.Content>
          <Pf.Notification.Message>
            {this.props.message.content}
            {this.props.message.detail && (
              <Expandable
                toggleText={this.props.message.showDetail ? 'Hide Detail' : 'Show Detail'}
                onToggle={() => this.props.toggleMessageDetail(this.props.message)}
                isExpanded={this.props.message.showDetail}
              >
                <pre>{this.props.message.detail}</pre>
              </Expandable>
            )}
            {this.props.message.count > 1 && (
              <div>
                {this.props.message.count} {moment().from(this.props.message.firstTriggered)}
              </div>
            )}
          </Pf.Notification.Message>
          <Pf.Notification.Info
            leftText={this.props.message.created.toLocaleDateString()}
            rightText={this.props.message.created.toLocaleTimeString()}
          />
        </Pf.Notification.Content>
      </Pf.Notification>
    );
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    markAsRead: message => dispatch(MessageCenterActions.markAsRead(message.id)),
    toggleMessageDetail: message => dispatch(MessageCenterActions.toggleMessageDetail(message.id))
  };
};

const AlertDrawerMessageContainer = connect(
  null,
  mapDispatchToProps
)(AlertDrawerMessage);
export default AlertDrawerMessageContainer;
