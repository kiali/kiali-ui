import * as React from 'react';
import { NodeContextMenuProps } from '../CytoscapeContextMenu';
import { JaegerSearchOptions, JaegerURLSearch } from '../../JaegerIntegration/RouteHelper';
import history from '../../../app/History';
import { Paths } from '../../../config';

type NodeContextMenuState = {
  nodeType: string;
  app: string | undefined;
};

export class NodeContextMenu extends React.PureComponent<NodeContextMenuProps, NodeContextMenuState> {
  constructor(props: NodeContextMenuProps) {
    super(props);
    let app = this.props.app;
    let nodeType = '';
    switch (this.props.nodeType) {
      case 'app':
        nodeType = Paths.APPLICATIONS;
        break;
      case 'service':
        nodeType = Paths.SERVICES;
        break;
      case 'workload':
        app = this.props.workload;
        nodeType = Paths.WORKLOADS;
        break;
      default:
    }
    this.state = { nodeType, app };
  }
  // @todo: We need take care of this at global app level
  makeDetailsPageUrl() {
    return `/namespaces/${this.props.namespace}/${this.state.nodeType}/${this.state.app}`;
  }

  getJaegerURL() {
    let tracesUrl = `/jaeger?namespaces=${this.props.namespace}&service=${this.state.app}.${this.props.namespace}`;
    if (!this.props.jaegerIntegration) {
      const url = new JaegerURLSearch(this.props.jaegerURL, false);
      const options: JaegerSearchOptions = {
        serviceSelected: `${this.state.app}.${this.props.namespace}`,
        limit: 20,
        start: '',
        end: '',
        minDuration: '',
        maxDuration: '',
        lookback: '3600',
        tags: ''
      };

      tracesUrl = url.createRoute(options);
    }
    return tracesUrl;
  }

  render() {
    const version = this.props.version ? `${this.props.version}` : '';
    const detailsPageUrl = this.makeDetailsPageUrl();
    const nodetype = this.state.nodeType;
    return (
      <div className="kiali-graph-context-menu-container">
        <div className="kiali-graph-context-menu-title">
          <strong>{this.props.app}</strong>:{version}
        </div>
        <div className="kiali-graph-context-menu-item">
          <a onClick={this.redirectContextLink} className="kiali-graph-context-menu-item-link" href={detailsPageUrl}>
            Show Details
          </a>
        </div>
        <div className="kiali-graph-context-menu-item">
          <a
            onClick={this.redirectContextLink}
            className="kiali-graph-context-menu-item-link"
            href={`${detailsPageUrl}?tab=traffic`}
          >
            Show Traffic
          </a>
        </div>
        {nodetype === Paths.WORKLOADS && (
          <div className="kiali-graph-context-menu-item">
            <a
              onClick={this.redirectContextLink}
              className="kiali-graph-context-menu-item-link"
              href={`${detailsPageUrl}?tab=logs`}
            >
              Show Logs
            </a>
          </div>
        )}
        <div className="kiali-graph-context-menu-item">
          <a
            onClick={this.redirectContextLink}
            className="kiali-graph-context-menu-item-link"
            href={`${detailsPageUrl}?tab=${nodetype === Paths.SERVICES ? 'metrics' : 'in_metrics'}`}
          >
            Show Inbound Metrics
          </a>
        </div>
        {nodetype !== Paths.SERVICES && (
          <div className="kiali-graph-context-menu-item">
            <a
              onClick={this.redirectContextLink}
              className="kiali-graph-context-menu-item-link"
              href={`${detailsPageUrl}?tab=out_metrics`}
            >
              Show Outbound Metrics
            </a>
          </div>
        )}
        {nodetype === Paths.SERVICES && this.props.jaegerURL !== '' && (
          <div className="kiali-graph-context-menu-item">
            <a
              onClick={this.redirectContextLink}
              className="kiali-graph-context-menu-item-link"
              target={this.props.jaegerIntegration ? '_self' : '_blank'}
              href={this.getJaegerURL()}
            >
              Show Traces
            </a>
          </div>
        )}
      </div>
    );
  }

  private redirectContextLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.target) {
      const anchor = e.target as HTMLAnchorElement;
      const href = anchor.getAttribute('href');
      const newTab = anchor.getAttribute('target') === '_blank';
      if (href && !newTab) {
        e.preventDefault();
        this.props.contextMenu.hide(0);
        history.push(href);
      }
    }
  };
}
