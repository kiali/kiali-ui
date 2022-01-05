import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Cy from 'cytoscape';
import { Router } from 'react-router';
import tippy, { Instance } from 'tippy.js';
import { DecoratedGraphEdgeData, DecoratedGraphNodeData } from '../../types/Graph';
import { Provider } from 'react-redux';
import { store } from '../../store/ConfigStore';
import history from '../../app/History';
import { getOptions } from './ContextMenu/NodeContextMenu';

type Props = {
  boxContextMenuContent?: NodeContextMenuComponentType;
  edgeContextMenuContent?: EdgeContextMenuComponentType;
  nodeContextMenuContent?: NodeContextMenuComponentType;
};

type TippyInstance = Instance;

type ContextMenuContainer = HTMLDivElement & {
  _contextMenu: TippyInstance;
};

type ContextMenuProps = {
  element: Cy.NodeSingular | Cy.Core;
  contextMenu: TippyInstance;
};

export type EdgeContextMenuProps = DecoratedGraphEdgeData & ContextMenuProps;
export type EdgeContextMenuComponentType = React.ComponentType<EdgeContextMenuProps>;
export type NodeContextMenuProps = DecoratedGraphNodeData & ContextMenuProps;
export type NodeContextMenuComponentType = React.ComponentType<NodeContextMenuProps>;
export type ContextMenuComponentType = EdgeContextMenuComponentType | NodeContextMenuComponentType;

export class CytoscapeContextMenuWrapper extends React.PureComponent<Props> {
  private readonly contextMenuRef: React.RefObject<ContextMenuContainer>;

  constructor(props: Props) {
    super(props);
    this.contextMenuRef = React.createRef<ContextMenuContainer>();
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.handleDocumentMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
  }

  handleDocumentMouseUp = (event: MouseEvent) => {
    if (event.button === 2) {
      console.log('ignore mouseup');
      // Ignore mouseup of right button
      return;
    }
    const currentContextMenu = this.getCurrentContextMenu();
    if (currentContextMenu) {
      console.log('in mouseup');
      // Allow interaction in our popper component (Selecting and copying) without it disappearing
      if (event.target && currentContextMenu.popper.contains(event.target as Node)) {
        console.log('in mouseup ignore');
        return;
      }
      console.log('in mouseup hide');
      currentContextMenu.hide();
    }
  };

  handleContextMenu = (event: MouseEvent) => {
    console.log('handle');
    // Disable the context menu in popper
    const currentContextMenu = this.getCurrentContextMenu();
    if (currentContextMenu) {
      if (event.target && currentContextMenu.popper.contains(event.target as Node)) {
        console.log('handle prevent');
        event.preventDefault();
      }
    }
    console.log('handle true');
    return true;
  };

  // Connects cy to this component
  connectCy(cy: Cy.Core) {
    cy.on('cxttapstart', (event: Cy.EventObject) => {
      event.preventDefault();
      if (event.target) {
        const currentContextMenu = this.getCurrentContextMenu();
        if (currentContextMenu) {
          currentContextMenu.hide(0); // hide it in 0ms
        }

        let contextMenuType: ContextMenuComponentType | undefined;

        if (event.target === cy) {
          contextMenuType = undefined;
        } else if (event.target.isNode() && event.target.isParent()) {
          contextMenuType = this.props.boxContextMenuContent;
        } else if (event.target.isNode()) {
          contextMenuType = this.props.nodeContextMenuContent;
        } else if (event.target.isEdge()) {
          contextMenuType = this.props.edgeContextMenuContent;
        }

        if (contextMenuType && getOptions({ ...event.target.data() }).length > 0) {
          this.makeContextMenu(contextMenuType, event.target);
        }
      }
      return false;
    });
  }

  render() {
    return (
      <div className="hidden">
        <div ref={this.contextMenuRef} />
      </div>
    );
  }

  private getCurrentContextMenu() {
    return this.contextMenuRef?.current?._contextMenu;
  }

  private setCurrentContextMenu(current: TippyInstance) {
    this.contextMenuRef!.current!._contextMenu = current;
  }

  private tippyDistance(target: Cy.NodeSingular | Cy.EdgeSingular) {
    if (target.isNode === undefined || target.isNode()) {
      return 10;
    }
    return -30;
  }

  private addContextMenuEventListener() {
    document.addEventListener('contextmenu', this.handleContextMenu);
  }

  private removeContextMenuEventListener() {
    document.removeEventListener('contextmenu', this.handleContextMenu);
  }

  private makeContextMenu(
    ContextMenuComponentType: ContextMenuComponentType,
    target: Cy.NodeSingular | Cy.EdgeSingular
  ) {
    console.log('makeContextMenu');

    // Prevent the tippy content from picking up the right-click when we are moving it over to the edge/node
    this.addContextMenuEventListener();
    const content = this.contextMenuRef.current;
    const tippyInstance = tippy(
      (target as any).popperRef(), // Using an extension, popperRef is not in base definition
      {
        content: content as HTMLDivElement,
        trigger: 'manual',
        arrow: true,
        placement: 'bottom',
        hideOnClick: false,
        multiple: false,
        sticky: true,
        interactive: true,
        theme: 'light-border',
        size: 'large',
        distance: this.tippyDistance(target)
      }
    ).instances[0];

    const result = (
      <Provider store={store}>
        <Router history={history}>
          <ContextMenuComponentType element={target} contextMenu={tippyInstance} {...target.data()} />
        </Router>
      </Provider>
    );

    ReactDOM.render(result, content, () => {
      this.setCurrentContextMenu(tippyInstance);
      tippyInstance.show();
      // Schedule the removal of the contextmenu listener after finishing with the show procedure, so we can
      // interact with the popper content e.g. select and copy (with right click) values from it.
      setTimeout(() => {
        this.removeContextMenuEventListener();
      }, 0);
    });
  }
}
