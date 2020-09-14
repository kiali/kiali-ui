import * as React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import { HealthDetails } from '../HealthDetails';
import { ServiceHealth } from '../../../types/Health';
import { setServerConfig } from '../../../config/ServerConfig';
import { serverRateConfig } from '../../../types/__testData__/ErrorRateConfig';

describe('HealthDetails', () => {
  beforeAll(() => {
    setServerConfig(serverRateConfig);
  });
  it('renders healthy', () => {
    const health = new ServiceHealth(
      'bookinfo',
      'reviews',
      { inbound: {}, outbound: {} },
      { rateInterval: 60, hasSidecar: true }
    );

    const wrapper = shallow(<HealthDetails health={health} tooltip={true} />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it('renders deployments failure', () => {
    const health = new ServiceHealth(
      'bookinfo',
      'reviews',
      { inbound: {}, outbound: {} },
      { rateInterval: 60, hasSidecar: true }
    );

    const wrapper = shallow(<HealthDetails health={health} tooltip={true} />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
