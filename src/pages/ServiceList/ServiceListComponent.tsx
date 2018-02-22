import * as React from 'react';
import { ListView, ListViewItem, ListViewIcon } from 'patternfly-react';
import { Link } from 'react-router-dom';

class ServiceListComponent extends React.Component {
  render() {
    return (
      <div>
        <ListView>
          <Link to={'/namespaces/istio-system/services/ProductPage'} style={{ color: 'black' }}>
          <ListViewItem
            key="Product Page"
            leftContent={<ListViewIcon type="pf" name="service" />}
            heading={
              <span>
                Product Page
                <small>Feb 23, 2015 12:32 am</small>
              </span>
            }
          />
          </Link>
        </ListView>
      </div>
    );
  }
}

export default ServiceListComponent;
