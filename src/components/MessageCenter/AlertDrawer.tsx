import * as React from 'react';
import { connect } from 'react-redux';
import {
  Card,
  CardHead,
  CardActions,
  CardHeader,
  Button,
  CardBody,
  Accordion,
  AccordionToggle,
  AccordionItem,
  AccordionContent
} from '@patternfly/react-core';
import { NotificationMessage, NotificationGroup } from '../../types/MessageCenter';
import { style } from 'typestyle';
import { MessageCenterActions } from 'actions/MessageCenterActions';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import { KialiAppAction } from 'actions/KialiAppAction';
import { CloseIcon, AngleDoubleRightIcon, AngleDoubleLeftIcon, InfoIcon } from '@patternfly/react-icons';
import AlertDrawerGroupContainer from './AlertDrawerGroup';

const getUnreadCount = (messages: NotificationMessage[]) => {
  return messages.reduce((count, message) => {
    return message.seen ? count : count + 1;
  }, 0);
};

const getUnreadMessageLabel = (messages: NotificationMessage[]) => {
  const unreadCount = getUnreadCount(messages);
  return unreadCount === 1 ? '1 Unread Message' : `${getUnreadCount(messages)} Unread Messages`;
};

const noNotificationsMessage = (
  <>
    <InfoIcon />
    No Messages Available
  </>
);

type ReduxProps = {
  expandedGroupId: string | undefined;
  groups: NotificationGroup[];
  isExpanded: boolean;
  isHidden: boolean;

  onExpandDrawer: () => void;
  onHideDrawer: () => void;
  onToggleGroup: (groupId) => void;
};

type AlertDrawerProps = ReduxProps & {
  title: string;
};

export class AlertDrawer extends React.PureComponent<AlertDrawerProps> {
  render() {
    const adStyle = style({
      right: '0',
      top: `5em`,
      position: 'absolute',
      width: this.props.isExpanded ? '75%' : '25em'
    });

    console.log(`ExpandedGroupId=${this.props.expandedGroupId}`);

    return (
      <Card className={adStyle} hidden={this.props.isHidden}>
        <CardHead>
          <CardActions>
            {this.props.isExpanded ? (
              <Button id="alert_drawer_collapse" variant="plain" onClick={this.props.onExpandDrawer}>
                <AngleDoubleRightIcon />
              </Button>
            ) : (
              <Button id="alert_drawer_expand" variant="plain" onClick={this.props.onExpandDrawer}>
                <AngleDoubleLeftIcon />
              </Button>
            )}
            <Button id="alert_drawer_close" variant="plain" onClick={this.props.onHideDrawer}>
              <CloseIcon />
            </Button>
          </CardActions>
          <CardHeader>{this.props.title}</CardHeader>
        </CardHead>
        <CardBody>
          {this.props.groups.length === 0 ? (
            noNotificationsMessage
          ) : (
            <Accordion>
              {this.props.groups.map(group => {
                return (
                  <AccordionItem key={group.id + '_item'}>
                    <AccordionToggle
                      id={group.id + '_toggle'}
                      isExpanded={group.id === this.props.expandedGroupId}
                      onClick={() => {
                        this.props.onToggleGroup(group);
                      }}
                    >
                      {group.title} {getUnreadMessageLabel(group.messages)}
                    </AccordionToggle>
                    <AccordionContent id={group.id + '_content'} isHidden={group.id !== this.props.expandedGroupId}>
                      <AlertDrawerGroupContainer key={group.id} group={group} />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardBody>
      </Card>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => {
  return {
    expandedGroupId: state.messageCenter.expandedGroupId,
    groups: state.messageCenter.groups,
    isExpanded: state.messageCenter.expanded,
    isHidden: state.messageCenter.hidden
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    onExpandDrawer: () => dispatch(MessageCenterActions.toggleExpandedMessageCenter()),
    onHideDrawer: () => dispatch(MessageCenterActions.hideMessageCenter()),
    onToggleGroup: group => dispatch(MessageCenterActions.toggleGroup(group.id))
  };
};

const AlertDrawerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertDrawer);
export default AlertDrawerContainer;
