import { store } from '../store/ConfigStore';
import { MessageType } from '../types/MessageCenter';
import { MessageCenterActions } from '../actions/MessageCenterActions';
import { AxiosError } from 'axios';
import * as API from '../services/Api';

export type Message = {
  content: string;
  detail?: string;
  group?: string;
  type?: MessageType;
  showNotification?: boolean;
};

export const add = (content: string, group?: string, type?: MessageType) => {
  store.dispatch(MessageCenterActions.addMessage(content, '', group, type));
};

export const addMessage = (msg: Message) => {
  store.dispatch(
    MessageCenterActions.addMessage(msg.content, msg.detail || '', msg.group, msg.type, msg.showNotification)
  );
};

export const addError = (message: string, error?: AxiosError, group?: string, type?: MessageType, detail?: string) => {
  if (!error) {
    store.dispatch(MessageCenterActions.addMessage(message, detail ? detail : '', group, MessageType.ERROR));
    return;
  }
  const finalType: MessageType = type ? type : MessageType.ERROR;
  const err = extractAxiosError(message, error);
  addMessage({
    ...err,
    group: group,
    type: finalType
  });
};

export const extractAxiosError = (message: string, error: AxiosError): { content: string; detail: string } => {
  const errorString: string = API.getErrorString(error);
  const errorDetail: string = API.getErrorDetail(error);
  if (message) {
    // combine error string and detail into a single detail
    if (errorString && errorDetail) {
      return { content: message, detail: `${errorString}\nAdditional Detail:\n${errorDetail}` };
    } else if (errorDetail) {
      return { content: message, detail: errorDetail };
    } else {
      return { content: message, detail: errorString };
    }
  }
  return { content: errorString, detail: errorDetail };
};

// info level message do not generate a toast notification
export const addInfo = (content: string, showNotification?: boolean, group?: string) => {
  store.dispatch(MessageCenterActions.addMessage(content, '', group, MessageType.INFO, showNotification));
};

export const addSuccess = (content: string, showNotification?: boolean, group?: string) => {
  store.dispatch(MessageCenterActions.addMessage(content, '', group, MessageType.SUCCESS, showNotification));
};

export const addWarning = (content: string, showNotification?: boolean, group?: string, detail?: string) => {
  store.dispatch(
    MessageCenterActions.addMessage(content, detail ? detail : '', group, MessageType.WARNING, showNotification)
  );
};
