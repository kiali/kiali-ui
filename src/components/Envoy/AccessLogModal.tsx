import * as React from 'react';
import { Modal } from '@patternfly/react-core';
import { style } from 'typestyle';
import { AccessLog } from 'types/IstioObjects';
import { PfColors } from 'components/Pf/PfColors';

export interface AccessLogModalProps {
  accessLog: AccessLog;
  accessLogMessage: string;
  className?: string;
  onClose?: () => void;
}

// const preface = 'Detailed information about an Envoy Access Log Entry.  Hover over a field for more information';

const alFieldName = style({
  color: PfColors.Gold,
  display: 'inline-block'
});

const modalStyle = style({
  width: '40%',
  height: '50%',
  overflow: 'hidden',
  overflowX: 'auto',
  overflowY: 'auto'
});

const prefaceStyle = style({
  fontFamily: 'monospace',
  fontSize: '14px',
  backgroundColor: PfColors.Black1000,
  color: PfColors.Gold400,
  width: '90%',
  margin: '10px',
  overflow: 'auto',
  resize: 'none',
  padding: '10px',
  whiteSpace: 'pre'
});

export default class AccessLogModal extends React.Component<AccessLogModalProps> {
  render() {
    return (
      <Modal
        className={modalStyle}
        disableFocusTrap={true}
        title="Envoy Access Log Entry"
        isOpen={true}
        onClose={this.props.onClose}
      >
        <>
          <div className={prefaceStyle}>{this.props.accessLogMessage} </div>
          {this.accessLogContent(this.props.accessLog)}
        </>
      </Modal>
    );
  }

  private accessLogContent = (al: AccessLog): any => {
    return (
      <div style={{ textAlign: 'left' }}>
        {this.accessLogField('authority', al.authority)}
        {this.accessLogField('bytes received', al.bytes_received)}
        {this.accessLogField('bytes sent', al.bytes_sent)}
        {this.accessLogField('downstream local', al.downstream_local)}
        {this.accessLogField('downstream remote', al.downstream_remote)}
        {this.accessLogField('duration', al.duration)}
        {this.accessLogField('forwarded for', al.forwarded_for)}
        {this.accessLogField('method', al.method)}
        {this.accessLogField('protocol', al.protocol)}
        {this.accessLogField('request id', al.request_id)}
        {this.accessLogField('requested server', al.requested_server)}
        {this.accessLogField('response flags', al.response_flags)}
        {this.accessLogField('route name', al.route_name)}
        {this.accessLogField('status code', al.status_code)}
        {this.accessLogField('tcp service time', al.tcp_service_time)}
        {this.accessLogField('timestamp', al.timestamp)}
        {this.accessLogField('upstream cluster', al.upstream_cluster)}
        {this.accessLogField('upstream failure reason', al.upstream_failure_reason)}
        {this.accessLogField('upstream local', al.upstream_local)}
        {this.accessLogField('upstream service', al.upstream_service)}
        {this.accessLogField('upstream service time', al.upstream_service_time)}
        {this.accessLogField('uri param', al.uri_param)}
        {this.accessLogField('uri path', al.uri_path)}
        {this.accessLogField('user agent', al.user_agent)}
      </div>
    );
  };

  private accessLogField = (key: string, val: string): any => {
    return !val ? null : (
      <>
        <span className={alFieldName}>{key}:&nbsp;</span>
        <span>{val}</span>
        <br />
      </>
    );
  };
}
