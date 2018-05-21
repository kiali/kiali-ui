import * as React from 'react';
import { shallow } from 'enzyme';

import Navigation, { istioRulesTitle } from '../Navigation';
import { VerticalNav } from 'patternfly-react';

const _tester = (path: string, expectedMenuPath: string) => {
  const wrapper = shallow(<Navigation location={{ pathname: path }} />);
  const navWrapper = wrapper.find(VerticalNav);
  expect(navWrapper.prop('activePath')).toEqual(`/${expectedMenuPath}/`);
};

const paths = {
  Services: '/services',
  'Istio Mixer': '/rules',
  'Distributed Tracing': '/jaeger',
  Graph: '/service-graph/istio-system'
};
const servicesTitle = 'Services';

describe('Navigation test', () => {
  it('should select menu item according to browser url when is logged', () => {
    sessionStorage.setItem('user', 'user');
    _tester('/services', servicesTitle);
    _tester('/rules', istioRulesTitle);
  });

  it('should navigate add to the router history', () => {
    const wrapper = shallow(<Navigation location={{ pathname: '/service-graph/istio-system' }} />);
    const realComponentInstance = wrapper.instance();
    // const context = realComponentInstance.context.router.history;
    realComponentInstance.context.router = { history: [] };
    Object.keys(paths).forEach(key => {
      let value = paths[key];
      (realComponentInstance as Navigation).navigateTo({ title: key });
      expect(
        realComponentInstance.context.router.history[realComponentInstance.context.router.history.length - 1]
      ).toBe(value);
    });
  });
});
