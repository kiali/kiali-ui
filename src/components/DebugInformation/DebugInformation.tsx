import * as React from 'react';
import { Modal, Icon, Button, Alert } from 'patternfly-react';

import { KialiAppState } from '../../store/Store';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { style } from 'typestyle';
import memoizeOne from 'memoize-one';
import beautify from 'json-beautify';

type DebugInformationProps = {
  appState: KialiAppState;
};

type DebugInformationState = {
  show: boolean;
  copied: boolean;
};

const textAreaStyle = style({
  width: '100%',
  height: '200px'
});

type DebugInformationData = {
  currentURL: string;
  reduxState: KialiAppState;
};

export default class DebugInformation extends React.PureComponent<DebugInformationProps, DebugInformationState> {
  private textareaRef;

  constructor(props: DebugInformationProps) {
    super(props);
    this.textareaRef = React.createRef();
    this.state = { show: false, copied: false };
  }

  open = () => {
    this.setState({ show: true, copied: false });
  };

  close = () => {
    this.setState({ show: false });
  };

  copyCallback = (text: string, result: boolean) => {
    this.textareaRef.current.select();
    this.setState({ copied: result });
  };

  hideCopySuccess = () => {
    this.setState({ copied: false });
  };

  render() {
    const renderDebugInformation = memoizeOne(() => {
      const debugInformation: DebugInformationData = {
        currentURL: window.location.href,
        reduxState: this.props.appState
      };
      return beautify(
        debugInformation,
        (key: string, value: any) => {
          // We have to patch some runtime properties  we don't want to serialize
          if (['cyRef', 'summaryTarget'].includes(key)) {
            return null;
          }
          return value;
        },
        2
      );
    });

    return (
      <Modal show={this.state.show} onHide={this.close}>
        <Modal.Header>
          <button className="close" onClick={this.close} aria-hidden="true" aria-label="Close">
            <Icon type="pf" name="close" />
          </button>
          <Modal.Title>Debug information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.copied && (
            <Alert type="success" onDismiss={this.hideCopySuccess}>
              Debug information has been copied to your clipboard.
            </Alert>
          )}
          <span>Please include this information when opening a bug.</span>
          <CopyToClipboard onCopy={this.copyCallback} text={renderDebugInformation()}>
            <textarea ref={this.textareaRef} className={textAreaStyle} readOnly={true}>
              {renderDebugInformation()}
            </textarea>
          </CopyToClipboard>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.close}>Close</Button>
          <CopyToClipboard onCopy={this.copyCallback} text={renderDebugInformation()}>
            <Button bsStyle="primary">Copy</Button>
          </CopyToClipboard>
        </Modal.Footer>
      </Modal>
    );
  }
}
