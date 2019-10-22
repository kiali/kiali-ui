import * as React from 'react';
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
import { CloseIcon, AngleDoubleRightIcon, AngleDoubleLeftIcon, InfoIcon } from '@patternfly/react-icons';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import { style } from 'typestyle';
import { NotificationMessage, NotificationGroup } from '../../types/MessageCenter';
import { MessageCenterActions } from 'actions/MessageCenterActions';
import { KialiAppAction } from 'actions/KialiAppAction';
import AlertDrawerGroupContainer from './AlertDrawerGroup';
import {
  BoundingClientAwareComponent,
  PropertyType
} from 'components/BoundingClientAwareComponent/BoundingClientAwareComponent';

type ReduxProps = {
  expandedGroupId: string | undefined;
  groups: NotificationGroup[];
  isExpanded: boolean;
  isHidden: boolean;

  expandDrawer: () => void;
  hideDrawer: () => void;
  toggleGroup: (group) => void;
};

type AlertDrawerProps = ReduxProps & {
  title: string;
};

const hideGroup = (group: NotificationGroup): boolean => {
  return group.hideIfEmpty && group.messages.length === 0;
};

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

export class AlertDrawer extends React.PureComponent<AlertDrawerProps> {
  render() {
    const drawerStyle = style({
      position: 'absolute',
      right: '0',
      width: this.props.isExpanded ? '75%' : '30em'
    });
    const drawerBodyStyle = style({
      paddingLeft: 0,
      paddingRight: 0
    });
    const boundingComponentStyle = style({
      overflow: 'auto'
    });
    const drawerBodyMarginBottom = 20;

    return (
      <Card className={drawerStyle} hidden={this.props.isHidden}>
        <CardHead>
          <CardActions>
            {this.props.isExpanded ? (
              <Button id="alert_drawer_collapse" variant="plain" onClick={this.props.expandDrawer}>
                <AngleDoubleRightIcon />
              </Button>
            ) : (
              <Button id="alert_drawer_expand" variant="plain" onClick={this.props.expandDrawer}>
                <AngleDoubleLeftIcon />
              </Button>
            )}
            <Button id="alert_drawer_close" variant="plain" onClick={this.props.hideDrawer}>
              <CloseIcon />
            </Button>
          </CardActions>
          <CardHeader>{this.props.title}</CardHeader>
        </CardHead>
        <CardBody className={drawerBodyStyle}>
          {this.props.groups.length === 0 ? (
            noNotificationsMessage
          ) : (
            <BoundingClientAwareComponent
              className={boundingComponentStyle}
              maxHeight={{ type: PropertyType.VIEWPORT_HEIGHT_MINUS_TOP, margin: drawerBodyMarginBottom }}
            >
              <Accordion>
                {this.props.groups.map(group => {
                  return hideGroup(group) ? null : (
                    <AccordionItem key={group.id + '_item'}>
                      <AccordionToggle
                        id={group.id + '_toggle'}
                        isExpanded={group.id === this.props.expandedGroupId}
                        onClick={() => {
                          this.props.toggleGroup(group);
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
            </BoundingClientAwareComponent>
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
    expandDrawer: () => dispatch(MessageCenterActions.toggleExpandedMessageCenter()),
    hideDrawer: () => dispatch(MessageCenterActions.hideMessageCenter()),
    toggleGroup: group => dispatch(MessageCenterActions.toggleGroup(group.id))
  };
};

const AlertDrawerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertDrawer);
export default AlertDrawerContainer;
