import * as React from 'react';
import { render } from 'enzyme';
import WorkloadDestinations from '../WorkloadDestinations';
import { BrowserRouter as Router } from 'react-router-dom';
import { DestinationService } from '../../../../types/Workload';

describe('#WorkloadDestinations renders correctly', () => {
  it('renders a list of links to service details page', () => {
    const services: DestinationService[] = [
      { name: 'reviews', namespace: 'bookinfo' },
      { name: 'istio-citadel', namespace: 'istio-system' }
    ];

    const wrapper = render(
      <Router>
        <div>
          <WorkloadDestinations workloadName={'product-v1'} destinationServices={services} />
        </div>
      </Router>
    );

    const expectationData = {
      reviews: { href: '/namespaces/bookinfo/services/reviews' },
      'istio-citadel': { href: '/namespaces/istio-system/services/istio-citadel' }
    };

    expect(wrapper).toBeDefined();
    expect(wrapper).toMatchSnapshot();

    wrapper.find('a').each((index, selector) => {
      const serviceName = selector.children[0].data;
      expect(serviceName).toBeDefined();
      if (!serviceName) {
        return;
      }

      expect(selector.attribs['href']).toEqual(expectationData[serviceName]['href']);
    });
  });
});
