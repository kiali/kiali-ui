import * as React from 'react';
import { Button, Checkbox, Modal } from 'patternfly-react';

// Import Brace and the AceEditor Component
// import brace from 'brace';
import AceEditor from 'react-ace';

// Import a Mode (language)
import 'brace/mode/json';
// Import a Theme (okadia, github, xcode etc) for ACE
import 'brace/theme/terminal';
import { RouteRule } from '../../../types/ServiceInfo';

interface ViewSourceModalProps {
  rule: RouteRule;
}

interface ViewSourceModalState {
  showModal: boolean;
  allowEdit: boolean;
}

class ViewSourceModal extends React.Component<ViewSourceModalProps, ViewSourceModalState> {
  constructor(props: ViewSourceModalProps) {
    super(props);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);

    this.state = {
      showModal: false,
      allowEdit: false
    };
  }

  handleClose() {
    this.setState({ showModal: false });
  }

  handleShow() {
    this.setState({ showModal: true });
  }

  toggleEdit() {
    this.setState({ allowEdit: !this.state.allowEdit });
  }

  render() {
    let rule = this.props.rule;
    return (
      <div>
        <Button bsStyle="primary" bsSize="small" onClick={this.handleShow}>
          View source
        </Button>
        <Modal show={this.state.showModal} onHide={this.handleClose}>
          <Modal.Header>
            <Modal.Title>Source of {rule.name ? rule.name : 'Routing Rule'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AceEditor
              mode="json"
              theme="terminal"
              readOnly={!this.state.allowEdit}
              minLines={5}
              value={JSON.stringify(rule, null, ' ')}
            />
          </Modal.Body>
          <Modal.Footer>
            <Checkbox bsStyle="Danger" title="Edit" checked={this.state.allowEdit} onClick={this.toggleEdit}>
              Edit
            </Checkbox>
            <Button bsStyle="default" className="btn-cancel" onClick={this.handleClose}>
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ViewSourceModal;
