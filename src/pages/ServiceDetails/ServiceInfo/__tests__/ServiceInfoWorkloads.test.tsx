import * as React from 'react';
import { shallow } from 'enzyme';
import ServiceWorkload from '../ServiceInfoWorkload';
import { shallowToJson } from 'enzyme-to-json';
import { Service } from './ServiceMock';

describe('#ServiceInfoWorkload render correctly with data', () => {
  it('should render service pods', () => {
    const wrapper = shallow(<ServiceWorkload service={Service} workloads={Service.workloads} namespace={'ns'} />);
    expect(shallowToJson(wrapper)).toBeDefined();
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
