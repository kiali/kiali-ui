import * as React from 'react';
import { shallow } from 'enzyme';

import { ApiTypeIndicator } from '../ApiTypeIndicator';

describe('ApiTypeIndicator', () => {
  it('renders when not known', () => {
    let wrapper = shallow(<ApiTypeIndicator apiType="unknown" />);
    expect(wrapper.html()).not.toContain('img');
  });

  it('renders when known', () => {
    let wrapper = shallow(<ApiTypeIndicator apiType="rest" />);
    expect(wrapper.html()).toContain('img');
  });
});
