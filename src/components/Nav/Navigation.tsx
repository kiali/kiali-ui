import * as React from 'react';
import { VerticalNav } from 'patternfly-react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';

import HelpDropdown from './HelpDropdown';
import ServiceDetailsPage from '../../pages/ServiceDetails/ServiceDetailsPage';
import ServiceGraphPage from '../../pages/ServiceGraph/ServiceGraphPage';
import ServiceListPage from '../../pages/ServiceList/ServiceListPage';
import DivlessWrapper from '../DivlessWrapper/DivlessWrapper';

const serviceGraphPath = '/service-graph/istio-system';
const serviceGraphTitle = 'Graph';
const servicesPath = '/services';
const servicesTitle = 'Services';

const pfLogo = require('../../img/logo-alt.svg');
const pfBrand = require('../../img/brand-alt.svg');

class Navigation extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props: any) {
    super(props);
    this.navigateTo = this.navigateTo.bind(this);
  }

  navigateTo(e: any) {
    if (e.title === servicesTitle) {
      this.context.router.history.push(servicesPath);
    } else {
      this.context.router.history.push(serviceGraphPath);
    }
  }

  render() {
    return (
      <DivlessWrapper>
        <VerticalNav>
          <VerticalNav.Masthead title="Swift Sunshine">
            <VerticalNav.Brand iconImg={pfLogo} titleImg={pfBrand} />
            <VerticalNav.IconBar>
              <HelpDropdown />
            </VerticalNav.IconBar>
          </VerticalNav.Masthead>
          <VerticalNav.Item
            title={serviceGraphTitle}
            iconClass="fa pficon-topology"
            onClick={this.navigateTo}
            initialActive={true}
          />
          <VerticalNav.Item title={servicesTitle} iconClass="fa pficon-service" onClick={this.navigateTo} />
        </VerticalNav>
        <Switch>
          <Route path="/service-graph/:namespace" component={ServiceGraphPage} />
          <Route path={servicesPath} component={ServiceListPage} />
          <Route path="/namespaces/:namespace/services/:service" component={ServiceDetailsPage} />
          <Redirect to={serviceGraphPath} />
        </Switch>
      </DivlessWrapper>
    );
  }
}

export default Navigation;
