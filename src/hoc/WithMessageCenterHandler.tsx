import * as React from 'react';
import { connect } from 'react-redux';
import { MessageType } from '../types/MessageCenter';
import { MessageCenterActions } from '../actions/MessageCenterActions';

interface WithMessageCenterHandlerProps {
  messageCenterHandler?: (content: string, group?: string, type?: MessageType) => void;
}

const WithMessageCenterHandler = <P extends WithMessageCenterHandlerProps>( // Ensure we have a messageHandler
  WrappedComponent: React.ComponentType<P>
) => {
  class WithMessageHandlerInner extends React.Component<P> {
    render() {
      return <WrappedComponent {...this.props} messageCenterHandler={this.props.messageCenterHandler} />;
    }
  }

  const mapDispatchToProps = dispatch => {
    return {
      messageHandler: (content, group = 'default', type = MessageType.ERROR) => {
        dispatch(MessageCenterActions.addMessage(content, group, type));
      }
    };
  };
  return connect(undefined, mapDispatchToProps)(WithMessageHandlerInner);
};

export default WithMessageCenterHandler;
