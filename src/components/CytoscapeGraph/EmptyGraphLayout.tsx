import * as React from 'react';
import { Button, EmptyState, EmptyStateTitle, EmptyStateInfo, EmptyStateAction } from 'patternfly-react';
import { style } from 'typestyle';
import * as MessageCenter from '../../utils/MessageCenter';

type EmptyGraphLayoutProps = {
  elements?: any;
  namespace?: string;
  action?: any;
  isLoading?: boolean;
  isError: boolean;
};

const emptyStateStyle = style({
  height: '98%',
  marginRight: 5,
  marginBottom: 10,
  marginTop: 10
});

type EmptyGraphLayoutState = {};

export default class EmptyGraphLayout extends React.Component<EmptyGraphLayoutProps, EmptyGraphLayoutState> {
  toogleMessageCenter = () => {
    MessageCenter.toggleMessageCenter();
  };

  render() {
    if (this.props.isError) {
      return (
        <EmptyState className={emptyStateStyle}>
          <EmptyStateTitle>Error loading Service Graph</EmptyStateTitle>
          <EmptyStateInfo>
            Service Graph cannot be loaded. Please access to the Message Center for more details.
          </EmptyStateInfo>
          <EmptyStateAction>
            <Button bsStyle="primary" bsSize="large" onClick={this.toogleMessageCenter}>
              Message Center
            </Button>
          </EmptyStateAction>
        </EmptyState>
      );
    }
    if (this.props.isLoading) {
      return (
        <EmptyState className={emptyStateStyle}>
          <EmptyStateTitle>Loading Service Graph</EmptyStateTitle>
        </EmptyState>
      );
    }
    if (
      !this.props.elements ||
      this.props.elements.length < 1 ||
      !this.props.elements.nodes ||
      this.props.elements.nodes.length < 1
    ) {
      return (
        <EmptyState className={emptyStateStyle}>
          <EmptyStateTitle>Empty Service Graph</EmptyStateTitle>
          <EmptyStateInfo>
            There is currently no service graph available for namespace <b>{this.props.namespace}</b>. This could either
            mean there are no service mesh available in this namespace or that nothing has accessed the service mesh.
            Please try accessing something in the service mesh and click 'Refresh'.
          </EmptyStateInfo>
          <EmptyStateAction>
            <Button bsStyle="primary" bsSize="large" onClick={this.props.action}>
              Refresh
            </Button>
          </EmptyStateAction>
        </EmptyState>
      );
    } else {
      return this.props.children;
    }
  }
}
