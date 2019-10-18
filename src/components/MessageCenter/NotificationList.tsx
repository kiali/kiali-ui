import * as React from 'react';
import { NotificationMessage, MessageType } from '../../types/MessageCenter';
import { Alert, AlertVariant, AlertActionCloseButton } from '@patternfly/react-core';

// const DEFAULT_TIMER_DELAY = 5000;

type PropsType = {
  messages: NotificationMessage[];
  onDismiss: (message: NotificationMessage, userDismissed: boolean) => void;
};
type StateType = {};

export default class NotificationList extends React.PureComponent<PropsType, StateType> {
  render() {
    return (
      <>
        {this.props.messages.map((message, i) => {
          let variant: AlertVariant;
          switch (message.type) {
            case MessageType.SUCCESS:
              variant = AlertVariant.success;
              break;
            case MessageType.WARNING:
              variant = AlertVariant.warning;
              break;
            default:
              variant = AlertVariant.danger;
          }
          const onClose = () => {
            this.props.onDismiss(message, true);
          };
          return (
            <Alert
              style={{ width: '30em', right: '0', top: `${(i + 1) * 5}em`, position: 'absolute' }}
              key={message.id}
              variant={variant}
              title={message.content}
              action={<AlertActionCloseButton onClose={onClose} />}
            />
          );
        })}
      </>
    );
  }
}
