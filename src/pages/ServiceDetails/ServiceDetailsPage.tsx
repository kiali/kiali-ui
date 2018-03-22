import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import ServiceInfo from './ServiceInfo';
import ServiceMetrics from './ServiceMetrics';
import ServiceId from '../../types/ServiceId';
import { Nav, NavItem, TabContainer, TabContent, TabPane } from 'patternfly-react';
import { NamespaceFilterSelected } from '../../components/NamespaceFilter/NamespaceFilter';
import { ActiveFilter } from '../../types/NamespaceFilter';

const ServiceDetails = (routeProps: RouteComponentProps<ServiceId>) => {
  let updateFilter = () => {
    let activeFilter: ActiveFilter = {
      label: 'Namespace: ' + routeProps.match.params.namespace,
      category: 'Namespace',
      value: routeProps.match.params.namespace.toString()
    };
    NamespaceFilterSelected.setSelected([activeFilter]);
  };
  const tracesJaeger = `http://jaeger-query-istio-system.127.0.0.1.nip.io/search?service=${
    routeProps.match.params.service
  }`;
  return (
    <div className="container-fluid container-pf-nav-pf-vertical">
      <div className="page-header">
        <h2>
          Service{' '}
          <Link to="/services" onClick={updateFilter}>
            {routeProps.match.params.namespace}
          </Link>{' '}
          / {routeProps.match.params.service}
        </h2>
      </div>
      <TabContainer id="basic-tabs" defaultActiveKey={1}>
        <div>
          <Nav bsClass="nav nav-tabs nav-tabs-pf">
            <NavItem eventKey={1}>
              <div dangerouslySetInnerHTML={{ __html: 'Info' }} />
            </NavItem>
            <NavItem eventKey={2}>
              <div dangerouslySetInnerHTML={{ __html: 'Metrics' }} />
            </NavItem>
            <li role="presentation">
              <a href={tracesJaeger} target="_blank">
                <div dangerouslySetInnerHTML={{ __html: 'Traces' }} />
              </a>
            </li>
          </Nav>
          <TabContent>
            <TabPane eventKey={1}>
              <ServiceInfo namespace={routeProps.match.params.namespace} service={routeProps.match.params.service} />
            </TabPane>
            <TabPane eventKey={2}>
              <ServiceMetrics namespace={routeProps.match.params.namespace} service={routeProps.match.params.service} />
            </TabPane>
          </TabContent>
        </div>
      </TabContainer>
    </div>
  );
};

export default ServiceDetails;
