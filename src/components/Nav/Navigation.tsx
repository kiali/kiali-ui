import * as React from 'react';
import { VerticalNav } from 'patternfly-react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';

import HelpDropdown from './HelpDropdown';
import ServiceDetailsPage from '../../pages/ServiceDetails/ServiceDetailsPage';
import ServiceGraphPage from '../../pages/ServiceGraph/ServiceGraphPage';
import ServiceListPage from '../../pages/ServiceList/ServiceListPage';
import ServiceJaegerPage from '../../pages/ServiceJaeger/ServiceJaegerPage';
import ServiceJaegerTracePage from '../../pages/ServiceJaeger/TracePage/TracePage';

const serviceGraphPath = '/service-graph/istio-system';
const serviceGraphTitle = 'Graph';
const servicesPath = '/services';
const servicesTitle = 'Services';
const servicesJaegerSearch = '/jaeger/search';
const servicesJaegerSearchTitle = 'Jaeger';
const pfLogo = require('../../img/logo-alt.svg');
const pfBrand = require('../../assets/img/kiali-title.svg');

class Navigation extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props: any) {
    super(props);
    this.navigateTo = this.navigateTo.bind(this);
  }

  navigateTo(e: any) {
    switch (e.title) {
      case servicesTitle:
        this.context.router.history.push(servicesPath);
        break;
      case serviceGraphTitle:
        this.context.router.history.push(serviceGraphPath);
        break;
      case servicesJaegerSearchTitle:
        this.context.router.history.push(servicesJaegerSearch);
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div>
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
          <VerticalNav.Item title={servicesJaegerSearchTitle} iconClass="fa pficon-search" onClick={this.navigateTo} />
        </VerticalNav>
        <Switch>
          <Route path="/service-graph/:namespace" component={ServiceGraphPage} />
          <Route path={servicesPath} component={ServiceListPage} />
          <Route path={servicesJaegerSearch} component={ServiceJaegerPage} />
          <Route path="/jaeger/traces/:trace" component={ServiceJaegerTracePage} />
          <Route path="/namespaces/:namespace/services/:service" component={ServiceDetailsPage} />
          <Redirect to={serviceGraphPath} />
        </Switch>
      </div>
    );
  }
}

export default Navigation;
