import * as React from 'react';
import { Button, Icon } from 'patternfly-react';
import Draggable from 'react-draggable';
import { Pod } from '../../../types/IstioObjects';
import WorkloadPodLogs from './WorkloadPodLogs';

export interface WorkloadPodLogsProps {
  className?: string;
  namespace: string;
  pods: Pod[];
  onClose: () => void;
}

export default class WorkloadPodLogsDraggable extends React.Component<WorkloadPodLogsProps> {
  constructor(props: WorkloadPodLogsProps) {
    super(props);
  }

  render() {
    const className = this.props.className ? this.props.className : '';

    return (
      <Draggable handle="#wpl_header">
        <div
          className={`modal-content ${className}`}
          style={{
            width: '75%',
            height: '600px',
            top: '-300px',
            right: '0',
            position: 'absolute',
            zIndex: 9999
          }}
        >
          <div id="wpl_header" className="modal-header">
            <Button className="close" bsClass="" onClick={this.props.onClose}>
              <Icon title="Close" type="pf" name="close" />
            </Button>
            <span className="modal-title">Pod Logs</span>
          </div>
          <WorkloadPodLogs namespace={this.props.namespace} pods={this.props.pods} />
        </div>
      </Draggable>
    );
  }
}
