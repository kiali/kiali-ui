import * as React from 'react';
import { shallow } from 'enzyme';

import ServiceInfo from '../ServiceInfo';

describe('Test suite "ServiceInfo"', () => {
  it('should have correct props', () => {
    const wrapper = shallow(<ServiceInfo namespace="system" service="pinger" />);

    expect(wrapper.instance().props.namespace).toMatch('system');
    expect(wrapper.instance().props.service).toMatch('pinger');

    expect(wrapper.render().text()).toMatch('system / pinger');
  });
});
