import * as React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import { HealthIndicator, DisplayMode } from '../HealthIndicator';
import { AppHealth } from '../../../types/Health';
import { PFAlertColor } from 'components/Pf/PfColors';
import { setServerConfig } from '../../../config/ServerConfig';
import { healthConfig } from '../../../types/__testData__/HealthConfig';

describe('HealthIndicator', () => {
  beforeAll(() => {
    setServerConfig(healthConfig);
  });
  it('renders when empty', () => {
    // SMALL
    let wrapper = shallow(<HealthIndicator id="svc" mode={DisplayMode.SMALL} />);
    expect(wrapper.html()).not.toContain('pficon');

    // LARGE
    wrapper = shallow(<HealthIndicator id="svc" mode={DisplayMode.LARGE} />);
    expect(wrapper.html()).not.toContain('pficon');
  });

  it('renders healthy', () => {
    const health = new AppHealth(
      'bookinfo',
      'reviews',
      [
        { name: 'A', availableReplicas: 1, currentReplicas: 1, desiredReplicas: 1 },
        { name: 'B', availableReplicas: 2, currentReplicas: 2, desiredReplicas: 2 }
      ],
      { inbound: {}, outbound: {} },
      { rateInterval: 600, hasSidecar: true }
    );

    // SMALL
    let wrapper = shallow(<HealthIndicator id="svc" health={health} mode={DisplayMode.SMALL} />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
    let html = wrapper.html();
    expect(html).toContain(PFAlertColor.Success);

    // LARGE
    wrapper = shallow(<HealthIndicator id="svc" health={health} mode={DisplayMode.LARGE} />);
    html = wrapper.html();
    expect(html).toContain(PFAlertColor.Success);
  });

  it('renders workloads degraded', () => {
    const health = new AppHealth(
      'bookinfo',
      'reviews',
      [
        { name: 'A', availableReplicas: 1, currentReplicas: 1, desiredReplicas: 10 },
        { name: 'B', availableReplicas: 2, currentReplicas: 2, desiredReplicas: 2 }
      ],
      { inbound: {}, outbound: {} },
      { rateInterval: 600, hasSidecar: true }
    );

    // SMALL
    let wrapper = shallow(<HealthIndicator id="svc" health={health} mode={DisplayMode.SMALL} />);
    let html = wrapper.html();
    expect(html).toContain(PFAlertColor.Warning);

    // LARGE
    wrapper = shallow(<HealthIndicator id="svc" health={health} mode={DisplayMode.LARGE} />);
    html = wrapper.html();
    expect(html).toContain(PFAlertColor.Warning);
    expect(html).toContain('1 / 10');
  });

  it('renders some scaled down workload', () => {
    const health = new AppHealth(
      'bookinfo',
      'reviews',
      [
        { name: 'A', availableReplicas: 0, currentReplicas: 0, desiredReplicas: 0 },
        { name: 'B', availableReplicas: 2, currentReplicas: 2, desiredReplicas: 2 }
      ],
      { inbound: {}, outbound: {} },
      { rateInterval: 600, hasSidecar: true }
    );

    // SMALL
    let wrapper = shallow(<HealthIndicator id="svc" health={health} mode={DisplayMode.SMALL} />);
    let html = wrapper.html();
    expect(html).toContain(PFAlertColor.InfoBackground);

    // LARGE
    wrapper = shallow(<HealthIndicator id="svc" health={health} mode={DisplayMode.LARGE} />);
    html = wrapper.html();
    expect(html).toContain(PFAlertColor.InfoBackground);
    expect(html).toContain('0 / 0');
  });

  it('renders all workloads down', () => {
    const health = new AppHealth(
      'bookinfo',
      'reviews',
      [
        { name: 'A', availableReplicas: 0, currentReplicas: 0, desiredReplicas: 0 },
        { name: 'B', availableReplicas: 0, currentReplicas: 0, desiredReplicas: 0 }
      ],
      { inbound: {}, outbound: {} },
      { rateInterval: 600, hasSidecar: true }
    );

    // SMALL
    let wrapper = shallow(<HealthIndicator id="svc" health={health} mode={DisplayMode.SMALL} />);
    let html = wrapper.html();
    expect(html).toContain(PFAlertColor.InfoBackground);

    // LARGE
    wrapper = shallow(<HealthIndicator id="svc" health={health} mode={DisplayMode.LARGE} />);
    html = wrapper.html();
    expect(html).toContain(PFAlertColor.InfoBackground);
  });

  it('renders error rate failure', () => {
    const health = new AppHealth(
      'bookinfo',
      'reviews',
      [{ name: 'A', availableReplicas: 1, currentReplicas: 1, desiredReplicas: 1 }],
      {
        inbound: { http: { '200': 1.8, '400': 0.2 } },
        outbound: { http: { '400': 0.4, '200': 1.6 } }
      },
      { rateInterval: 600, hasSidecar: true }
    );

    // SMALL
    let wrapper = shallow(<HealthIndicator id="svc" health={health} mode={DisplayMode.SMALL} />);
    let html = wrapper.html();
    expect(html).toContain(PFAlertColor.Danger);

    // LARGE
    wrapper = shallow(<HealthIndicator id="svc" health={health} mode={DisplayMode.LARGE} />);
    html = wrapper.html();
    expect(html).toContain(PFAlertColor.Danger);
    expect(html).toContain('Outbound: 20.00%');
    expect(html).toContain('Inbound: 10.00%');
  });
});
