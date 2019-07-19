import * as React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import { ApiDocumentation } from '../ApiDocumentation';

describe('ApiDocumentation', () => {
  it('renders when not known', () => {
    let wrapper = shallow(<ApiDocumentation apiType="rest" baseUrl="aaa" />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
