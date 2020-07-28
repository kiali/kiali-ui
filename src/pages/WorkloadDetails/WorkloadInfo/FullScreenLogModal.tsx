import * as React from 'react';
import { style } from 'typestyle';
import { Modal } from '@patternfly/react-core';

type FullScreenLogProps = {
  logText?: string;
  title: string;
  ref: React.RefObject<any>;
};

type FullScreenLogState = {
  show: boolean;
};

const modalStyle = style({
  width: '100%',
  height: '100%',
  minHeight: '100%'
});

const textAreaStyle = style({
  width: '100%',
  height: '100%',
  minHeight: '100%',
  marginTop: '10px',
  overflow: 'auto',
  resize: 'none',
  color: '#fff',
  fontFamily: 'monospace',
  fontSize: '11pt',
  padding: '10px',
  whiteSpace: 'pre',
  backgroundColor: '#003145'
});

export class FullScreenLogModal extends React.PureComponent<FullScreenLogProps, FullScreenLogState> {
  private readonly textareaRef;

  constructor(props: FullScreenLogProps) {
    super(props);
    this.textareaRef = React.createRef();
    this.state = { show: false };
  }

  open = () => {
    this.setState({ show: true });
  };

  close = () => {
    this.setState({ show: false });
  };

  render() {
    if (!this.state.show || !this.props.logText) {
      return null;
    }

    return (
      <Modal
        isSmall={false}
        isOpen={this.state.show}
        onClose={this.close}
        title="Fullscreen Logs"
        className={modalStyle}
      >
        <h2>{this.props.title}</h2>
        <textarea ref={this.textareaRef} value={this.props.logText} className={textAreaStyle} readOnly={true} />
      </Modal>
    );
  }
}
