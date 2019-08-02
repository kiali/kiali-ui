import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import ErrorBoundary from './ErrorBoundary';

interface MessageProps {
  message: string;
}

export default class ErrorBoundaryWithMessage extends React.Component<MessageProps> {
  alert() {
    return (
      <div className="card-pf-body">
        <Alert variant="warning" title={this.props.message || 'Something went wrong rending this component'}>
          {' '}
        </Alert>
      </div>
    );
  }

  render() {
    return <ErrorBoundary fallBackComponent={this.alert()}>{this.props.children}</ErrorBoundary>;
  }
}
