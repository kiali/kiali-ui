import * as React from 'react';
import { Alert, TabPane } from 'patternfly-react';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

function withErrorBoundary(Component) {
  return class WithErrorBoundary extends React.Component {
    wrongFormatMessage() {
      let message = this.props.message || 'Something went wrong rending this component';
      return (
        <div className="card-pf-body">
          <Alert type="warning">{message}</Alert>
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
}

const TabPaneWithErrorBoundary = withErrorBoundary(TabPane);
export default TabPaneWithErrorBoundary;
