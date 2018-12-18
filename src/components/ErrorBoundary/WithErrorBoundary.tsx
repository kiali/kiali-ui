import * as React from 'react';
import PropTypes from 'prop-types';
import { Alert, TabPane } from 'patternfly-react';
import ErrorBoundary from './ErrorBoundary';

const propTypes = {
  /** content inside the ErrorBoundary */
  children: PropTypes.any,
  /** Message */
  message: PropTypes.string,
  /** Sets the base component to render. defaults to TabPane */
  component: PropTypes.object
};

const defaultProps = {
  children: null,
  message: 'Something went wrong rending this component',
  component: TabPane
};

const WithErrorBoundary = ({ children, component: Component = TabPane, message, ...props }) => (
  <Component {...props}>
    <ErrorBoundary
      fallBackComponent={
        <div className="card-pf-body">
          <Alert type="warning">{message}</Alert>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  </Component>
);

WithErrorBoundary.propTypes = propTypes;
WithErrorBoundary.defaultProps = defaultProps;

export default WithErrorBoundary;
