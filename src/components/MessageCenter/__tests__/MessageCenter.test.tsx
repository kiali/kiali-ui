import * as React from 'react';
import { shallow } from 'enzyme';

import NotificationList from '../NotificationList';
import MessageCenter from '../MessageCenter';
import { NotificationGroup, MessageType } from '../../../types/MessageCenter';

describe('MessageCenter', () => {
  const groupMessages: NotificationGroup[] = [
    {
      id: 'first',
      title: 'im first',
      messages: [
        {
          id: 1,
          seen: false,
          content: 'show me',
          type: MessageType.ERROR,
          show_notification: true,
          created: new Date()
        },
        {
          id: 2,
          seen: false,
          content: 'hide me',
          type: MessageType.ERROR,
          created: new Date()
        }
      ]
    },
    {
      id: 'second',
      title: 'im second',
      messages: [
        {
          id: 2,
          seen: true,
          content: 'show me too',
          type: MessageType.SUCCESS,
          show_notification: true,
          created: new Date()
        }
      ]
    }
  ];

  it('.getNotificationMessages only gets notifications', () => {
    const wrapper = shallow(
      <MessageCenter
        drawerTitle="Title"
        onExpandDrawer={() => console.log('onExpand')}
        onHideDrawer={() => console.log('onHideDrawer')}
        onToggleGroup={() => console.log('onToggleGroup')}
        onMarkGroupAsRead={() => console.log('onMarkGroupAsRead')}
        onClearGroup={() => console.log('onClearGroup')}
        onNotificationClick={() => console.log('onNotificationClick')}
        onDismissNotification={() => console.log('onDismissNotification')}
        groups={groupMessages}
      />
    );
    const notificationList = wrapper.find(NotificationList);
    expect(notificationList.prop('messages').length).toEqual(2);
  });
});
