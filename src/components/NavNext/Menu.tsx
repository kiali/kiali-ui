import * as React from 'react';
import { navItems } from '../../routes';
import { Nav, NavList, NavItem } from '@patternfly/react-core/dist/js/components/Nav';
import { PageSidebar } from '@patternfly/react-core/dist/js/components/Page';
import * as icons from '@patternfly/react-icons';

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

  onNavSelect = result => {
    this.setState({
      activeItem: result.itemId
    });
  };

  renderMenuItems = () => {
    return navItems.map(item => {
      const Icon = icons[item.iconNext];
      if (item.title === 'Distributed Tracing') {
        if (this.props.jaegerUrl === '') {
          return '';
        }
        return (
          <NavItem to={item.to} itemId={item.title} onClick={() => this.goTojaeger()}>
            <Icon style={{ marginRight: '10px' }} /> {item.title}
          </NavItem>
        );
      }
      return (
        <NavItem to={item.to} itemId={item.title} isActive={this.state.activeItem === item.title}>
          <Icon style={{ marginRight: '10px' }} /> {item.title}
        </NavItem>
      );
    });
  };

  render() {
    const { isNavOpen } = this.props;

    const PageNav = (
      <Nav onSelect={this.onNavSelect} onToggle={() => {}} aria-label="Nav">
        <NavList>{this.renderMenuItems()}</NavList>
      </Nav>
    );

    return <PageSidebar isNavOpen={isNavOpen} nav={PageNav} />;
  }
}

export default Menu;
