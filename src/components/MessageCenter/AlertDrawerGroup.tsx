import * as React from 'react';
import { connect } from 'react-redux';
import { Card, Button, CardBody, CardFooter } from '@patternfly/react-core';
import { NotificationGroup } from '../../types/MessageCenter';
import MessageCenterThunkActions from 'actions/MessageCenterThunkActions';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import { KialiAppAction } from 'actions/KialiAppAction';
import { InfoIcon } from '@patternfly/react-icons';
import AlertDrawerMessageContainer from './AlertDrawerMessage';

type ReduxProps = {
  clearGroup: (group: NotificationGroup) => void;
  markGroupAsRead: (group: NotificationGroup) => void;
};

type AlertDrawerGroupProps = ReduxProps & {
  group: NotificationGroup;
  reverseMessageOrder?: boolean;
};

const noNotificationsMessage = (
  <>
    <InfoIcon />
    No Messages Available
  </>
);

class AlertDrawerGroup extends React.PureComponent<AlertDrawerGroupProps> {
  getMessages = () => {
    return this.props.reverseMessageOrder ? [...this.props.group.messages].reverse() : this.props.group.messages;
  };

  render() {
    const group = this.props.group;

    if (group.hideIfEmpty && group.messages.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardBody>
          {group.messages.length === 0 && noNotificationsMessage}
          {this.getMessages().map(message => (
            <AlertDrawerMessageContainer key={message.id} message={message} />
          ))}
        </CardBody>
        {group.showActions && group.messages.length > 0 && (
          <CardFooter>
            <Button onClick={() => this.props.markGroupAsRead(group)}>Mark All Read</Button>
            <Button onClick={() => this.props.clearGroup(group)}>Clear All</Button>
          </CardFooter>
        )}
      </Card>
    );
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    clearGroup: group => dispatch(MessageCenterThunkActions.clearGroup(group.id)),
    markGroupAsRead: group => dispatch(MessageCenterThunkActions.markGroupAsRead(group.id))
  };
};

const AlertDrawerGroupContainer = connect(mapDispatchToProps)(AlertDrawerGroup);
export default AlertDrawerGroupContainer;
