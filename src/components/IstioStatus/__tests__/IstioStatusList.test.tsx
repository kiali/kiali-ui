import * as React from 'react';
import { shallow } from 'enzyme';
import { ComponentStatus, Status } from '../../../types/IstioStatus';
import IstioStatusList from '../IstioStatusList';
import { shallowToJson } from 'enzyme-to-json';

it("lists all the components grouped", () => {
  const components: ComponentStatus[] = [
    {
      name: "grafana",
      status: Status.Running,
      is_core: false,
    },
    {
      name: "prometheus",
      status: Status.Running,
      is_core: false,
    },
    {
      name: "istiod",
      status: Status.NotRunning,
      is_core: true,
    },
    {
      name: "istio-egressgateway",
      status: Status.NotRunning,
      is_core: true,
    },
  ];

  const wrapper = shallow(<IstioStatusList status={components} />);

  expect(shallowToJson(wrapper)).toBeDefined();
  expect(shallowToJson(wrapper)).toMatchSnapshot();
});
