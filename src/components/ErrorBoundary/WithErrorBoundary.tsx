import * as React from 'react';
import { Alert, TabPane } from 'patternfly-react';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

interface WithErrorBoundaryProps {
  message: string;
}

const withErrorBoundary = <P extends object>(Component: React.ComponentType<P>) => {
  return class extends React.Component<P & WithErrorBoundaryProps> {
    wrongFormatMessage() {
      const { message, ...props } = this.props as WithErrorBoundaryProps;
      const displayingMessage = message || 'Something went wrong rending this component';
      return (
        <div className="card-pf-body">
          <Alert type="warning">{displayingMessage}</Alert>
        </div>
      );
    }

    render() {
      return (
        <Component {...this.props}>
          <ErrorBoundary fallBackComponent={this.wrongFormatMessage()}>{this.props.children}</ErrorBoundary>
        </Component>
      );
    }
  };
};

const TabPaneWithErrorBoundary = withErrorBoundary(TabPane);
export default TabPaneWithErrorBoundary;
