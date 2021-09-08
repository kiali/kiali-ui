import * as React from 'react';
import { mount, shallow } from 'enzyme';
import screenfull, { Screenfull } from 'screenfull';
import { setPodEnvoyProxyLogLevel } from '../../../services/Api';
import { WorkloadPodLogs } from '../WorkloadPodLogs';
import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';

jest.mock('screenfull');
jest.mock('../../../services/Api', () => {
  const originalModule = (jest as any).requireActual('../../../services/Api');

  return {
    __esModule: true,
    ...originalModule,
    setPodEnvoyProxyLogLevel: jest.fn(() => Promise.resolve(undefined))
  };
});

let defaultProps = {
  lastRefreshAt: 200,
  timeRange: {},
  namespace: 'namespace',
  pods: [],
  workload: 'workload'
};

describe('WorkloadPodLogs', () => {
  beforeEach(() => {
    (screenfull as Screenfull).onchange = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallow(<WorkloadPodLogs {...defaultProps} />);
    expect(wrapper.exists()).toBeTruthy();
  });

  const props = {
    ...defaultProps,
    pods: [
      { name: 'testingpod', createdAt: 'anytime', createdBy: [], status: 'any', appLabel: false, versionLabel: false }
    ]
  };
  it('renders a kebab toggle dropdown', () => {
    const wrapper = shallow(<WorkloadPodLogs {...props} />);
    const kebabDropdownWrapper = wrapper
      .find(Dropdown)
      .findWhere(n => n.prop('toggle') && n.prop('toggle').type === KebabToggle);
    expect(wrapper.find(Dropdown).exists()).toBeTruthy();
    expect(kebabDropdownWrapper.exists()).toBeTruthy();
  });

  it('renders a log level action in the kebab', () => {
    // using 'mount' since the dropdowns are children of the kebab
    const wrapper = mount(<WorkloadPodLogs {...props} />);
    wrapper.setState({ kebabOpen: true });
    expect(
      wrapper
        .find(DropdownItem)
        .findWhere(n => n.key() === 'setLogLevelDebug')
        .exists()
    ).toBeTruthy();
  });

  it('calls set log level when action selected', () => {
    const wrapper = mount(<WorkloadPodLogs {...props} />);
    wrapper.setState({ kebabOpen: true });
    wrapper
      .find(DropdownItem)
      .findWhere(n => n.key() === 'setLogLevelDebug')
      .simulate('click');
    expect(setPodEnvoyProxyLogLevel as jest.Mock).toHaveBeenCalled();
  });
});
