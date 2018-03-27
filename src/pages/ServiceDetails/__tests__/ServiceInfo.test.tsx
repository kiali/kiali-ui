import * as React from 'react';
import { shallow } from 'enzyme';
import ServiceInfo from '../ServiceInfo';

jest.mock('../../../services/Api');

describe('#ServiceInfo render correctly with data', () => {
  it('should render serviceInfo', () => {
    const wrapper = shallow(<ServiceInfo namespace="istio-system" service="reviews" />);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('ServiceInfoDescription').length === 1).toBeTruthy();
    expect(wrapper.find('ServiceInfoDeployments').length === 1).toBeTruthy();
    expect(wrapper.find('ServiceInfoRoutes').length === 1).toBeTruthy();
    expect(wrapper.find('ServiceInfoRouteRules').length === 1).toBeTruthy();
    expect(wrapper.find('ServiceInfoDestinationPolicies').length === 1).toBeTruthy();
  });
});
