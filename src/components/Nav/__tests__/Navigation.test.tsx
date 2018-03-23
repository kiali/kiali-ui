import * as React from 'react';
import { shallow } from 'enzyme';

import Navigation, { servicesTitle, istioRulesTitle } from '../Navigation';
import { VerticalNav } from 'patternfly-react';

const _tester = (path: string, expectedMenuPath: string) => {
  const wrapper = shallow(<Navigation location={{ pathname: path }} />);
  const navWrapper = wrapper.find(VerticalNav);
  expect(navWrapper.prop('activePath')).toEqual(`/${expectedMenuPath}/`);
};

describe('Navigation test', () => {
  it('should select menu item according to browser url', () => {
    _tester('/services', servicesTitle);
    _tester('/rules', istioRulesTitle);
  });
});
