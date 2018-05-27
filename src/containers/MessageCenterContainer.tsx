import { connect } from 'react-redux';

import { MessageCenterActions } from 'actions/MessageCenterActions';
import { MessageCenter, MessageCenterTrigger } from 'components/MessageCenter';
import { MessageType } from 'types/MessageCenter';

const mapStateToPropsMessageCenter = state => {
  return {
    groups: state.messageCenter.groups,
    drawerIsHidden: state.messageCenter.hidden,
    drawerIsExpanded: state.messageCenter.expanded,
    drawerExpandedGroupId: state.messageCenter.expandedGroupId
  };
};

const mapDispatchToPropsMessageCenter = dispatch => {
  return {
    onExpandDrawer: () => dispatch(MessageCenterActions.togleExpandedMessageCenter()),
    onHideDrawer: () => dispatch(MessageCenterActions.hideMessageCenter()),
    onToggleGroup: group => dispatch(MessageCenterActions.toggleGroup(group.id)),
    onMarkGroupAsRead: group => dispatch(MessageCenterActions.markGroupAsRead(group.id)),
    onClearGroup: group => dispatch(MessageCenterActions.clearGroup(group.id)),
    onNotificationClick: message => dispatch(MessageCenterActions.markAsRead(message.id)),
    onDismissNotification: (message, group, userDismissed) => {
      if (userDismissed) {
        dispatch(MessageCenterActions.markAsRead(message.id));
      } else {
        dispatch(MessageCenterActions.hideNotification(message.id));
      }
    }
  };
};

const mapStateToPropsMessageCenterTrigger = state => {
  type MessageCenterTriggerPropsToMap = {
    newMessagesCount: number;
    badgeDanger: boolean;
  };
  const dangerousMessageTypes = [MessageType.ERROR, MessageType.WARNING];
  const messageCenterTriggerPropsToMap = state.messageCenter.groups
    .reduce((unreadMessages: any[], group) => {
      return unreadMessages.concat(
        group.messages.reduce((unreadMessagesInGroup: any[], message) => {
          if (!message.seen) {
            unreadMessagesInGroup.push(message);
          }
          return unreadMessagesInGroup;
        }, [])
      );
    }, [])
    .reduce(
      (propsToMap: MessageCenterTriggerPropsToMap, message) => {
        propsToMap.newMessagesCount++;
        propsToMap.badgeDanger = propsToMap.badgeDanger || dangerousMessageTypes.includes(message.type);
        return propsToMap;
      },
      { newMessagesCount: 0, badgeDanger: false }
    );
  console.log(messageCenterTriggerPropsToMap);

  return messageCenterTriggerPropsToMap;
};

const mapDispatchToPropsMessageCenterTrigger = dispatch => {
  return {
    toggleMessageCenter: () => dispatch(MessageCenterActions.toggleMessageCenter())
  };
};

const MessageCenterContainer = connect(mapStateToPropsMessageCenter, mapDispatchToPropsMessageCenter)(MessageCenter);
MessageCenterContainer.Trigger = connect(mapStateToPropsMessageCenterTrigger, mapDispatchToPropsMessageCenterTrigger)(
  MessageCenterTrigger
);

export default MessageCenterContainer;
