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

export type EdgeContextMenuProps = DecoratedGraphEdgeData & ContextMenuProps;
export type EdgeContextMenuComponentType = React.ComponentType<EdgeContextMenuProps>;
export type NodeContextMenuProps = DecoratedGraphNodeData & ContextMenuProps;
export type NodeContextMenuComponentType = React.ComponentType<NodeContextMenuProps>;
export type ContextMenuComponentType = EdgeContextMenuComponentType | NodeContextMenuComponentType;

type Props = {
  contextMenuEdgeComponent?: EdgeContextMenuComponentType;
  contextMenuNodeComponent?: NodeContextMenuComponentType;
};

type TippyInstance = Instance;

type ContextMenuContainer = HTMLDivElement & {
  _contextMenu: TippyInstance;
};

type ContextMenuProps = {
  contextMenu: TippyInstance;
  element: Cy.NodeSingular | Cy.EdgeSingular;
  isHover: boolean;
};

export class CytoscapeContextMenuWrapper extends React.PureComponent<Props> {
  private readonly contextMenuRef: React.RefObject<ContextMenuContainer>;
  private isHover: boolean | undefined;

  constructor(props: Props) {
    super(props);
    this.contextMenuRef = React.createRef<ContextMenuContainer>();
    this.isHover = undefined;
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.handleDocumentMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
  }

  render() {
    return (
      <div className="hidden">
        <div ref={this.contextMenuRef} />
      </div>
    );
  }

  // Add cy listener for context menu events on nodes and edges
  connectCy(cy: Cy.Core) {
    cy.on('cxttapstart', 'node,edge', (event: Cy.EventObject) => {
      event.preventDefault();
      if (event.target) {
        this.handleContextMenu(event.target, false);
      }
      return false;
    });
  }

  // Connects cy to this component
  handleContextMenu(elem: Cy.NodeSingular | Cy.EdgeSingular, isHover: boolean) {
    const contextMenuType = elem.isNode() ? this.props.contextMenuNodeComponent : this.props.contextMenuEdgeComponent;

    if (contextMenuType) {
      this.makeContextMenu(contextMenuType, elem, isHover);
    }
  }

  hideContextMenu(isHover: boolean | undefined) {
    const currentContextMenu = this.getCurrentContextMenu();
    if (currentContextMenu) {
      if (!isHover || this.isHover) {
        currentContextMenu.hide(0); // hide it in 0ms
        this.isHover = undefined;
      }
    }
  }

  private handleDocumentMouseUp = (event: MouseEvent) => {
    if (event.button === 2) {
      // Ignore mouseup of right button
      return;
    }
    const currentContextMenu = this.getCurrentContextMenu();
    if (currentContextMenu) {
      // Allow interaction in our popper component (Selecting and copying) without it disappearing
      if (event.target && currentContextMenu.popper.contains(event.target as Node)) {
        return;
      }

      this.hideContextMenu(this.isHover);
    }
  };

  private makeContextMenu(
    ContextMenuComponentType: ContextMenuComponentType,
    target: Cy.NodeSingular | Cy.EdgeSingular,
    isHover: boolean
  ) {
    // Don't let a hover trump a non-hover context menu
    if (isHover && this.isHover === false) {
      return;
    }
    // If there is no valid context menu just return
    if (!isHover && (target.isEdge() || getOptions({ ...target.data() }).length === 0)) {
      return;
    }

    // hide any existing context menu
    this.hideContextMenu(isHover);

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
          <ContextMenuComponentType element={target} contextMenu={tippyInstance} isHover={isHover} {...target.data()} />
        </Router>
      </Provider>
    );

    // save the context menu type to make sure we don't hide full context menus
    this.isHover = isHover;

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

  private getCurrentContextMenu() {
    return this.contextMenuRef?.current?._contextMenu;
  }

  private setCurrentContextMenu(current: TippyInstance) {
    this.contextMenuRef!.current!._contextMenu = current;
  }

  private addContextMenuEventListener() {
    document.addEventListener('contextmenu', this.handleContextMenuEvent);
  }

  private removeContextMenuEventListener() {
    document.removeEventListener('contextmenu', this.handleContextMenuEvent);
  }

  private handleContextMenuEvent = (event: MouseEvent) => {
    // Disable the context menu in popper
    const currentContextMenu = this.getCurrentContextMenu();
    if (currentContextMenu) {
      if (event.target && currentContextMenu.popper.contains(event.target as Node)) {
        event.preventDefault();
      }
    }
    return true;
  };

  private tippyDistance(_target: Cy.NodeSingular | Cy.EdgeSingular) {
    return 10;
  }
}
