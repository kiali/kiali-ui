import * as React from 'react';
import { mount } from 'enzyme';

import Menu from '../Menu';
import { NavItem } from '@patternfly/react-core';

const _tester = (path: string) => {
  const wrapper = mount(<Menu isNavOpen={true} location={{ pathname: path }} jaegerUrl={''} />);
  const navWrapper = wrapper.find(NavItem).findWhere(el => el.props()['to'] === path);
  expect(navWrapper.props()['isActive']).toBeTruthy();
};

describe('Navigation test', () => {
  it('should select menu item according to browser url', () => {
    _tester('/services');
    _tester('/istio');
  });
});
