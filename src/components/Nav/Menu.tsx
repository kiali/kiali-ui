import * as React from 'react';
import { navItems } from '../../routes';
import { matchPath } from 'react-router';
import { Nav, NavList, NavItem, PageSidebar } from '@patternfly/react-core/dist/js';
import * as icons from '@patternfly/react-icons';
import _ from 'lodash';

type MenuProps = {
  isNavOpen: boolean;
  location: any;
  jaegerUrl: string;
};

type MenuState = {
  activeItem: string;
};

class Menu extends React.Component<MenuProps, MenuState> {
  static contextTypes = {
    router: () => null
  };

  constructor(props: MenuProps) {
    super(props);
    this.state = {
      activeItem: 'Overview'
    };
  }

  goTojaeger() {
    window.open(this.props.jaegerUrl, '_blank');
  }

  renderMenuItems = () => {
    const { location } = this.props;
    const activeItem = navItems.find(item => {
      let isRoute = matchPath(location.pathname, { path: item.to, exact: true, strict: false }) ? true : false;
      if (!isRoute && item.pathsActive) {
        isRoute = _.filter(item.pathsActive, path => path.test(location.pathname)).length > 0;
      }
      return isRoute;
    });
    return navItems.map(item => {
      const Icon = icons[item.icon];
      if (item.title === 'Distributed Tracing') {
        if (this.props.jaegerUrl === '') {
          return '';
        }
        return (
          <NavItem key={item.title} to={item.to} itemId={item.title} onClick={() => this.goTojaeger()}>
            <Icon style={{ marginRight: '10px' }} /> {item.title}
          </NavItem>
        );
      }
      return (
        <NavItem
          key={item.title}
          to={item.to}
          itemId={item.title}
          isActive={activeItem === item}
          onClick={() => this.context.router.history.push(item.to)}
        >
          <Icon style={{ marginRight: '10px' }} /> {item.title}
        </NavItem>
      );
    });
  };

  render() {
    const { isNavOpen } = this.props;

    const PageNav = (
      <Nav onSelect={() => undefined} onToggle={() => undefined} aria-label="Nav">
        <NavList>{this.renderMenuItems()}</NavList>
      </Nav>
    );

    return <PageSidebar isNavOpen={isNavOpen} nav={PageNav} />;
  }
}

export default Menu;
