import * as React from 'react';
import { shallow } from 'enzyme';
import ServiceInfoWorkload from '../ServiceInfoWorkload';
import { WorkloadOverview } from '../../../../types/ServiceInfo';

const workloads: WorkloadOverview[] = [
  {
    name: 'reviews-v2',
    labels: { app: 'reviews', version: 'v2' },
    namespace: {
      name: 'bookinfo'
    }
  },
  {
    name: 'reviews-v3',
    labels: { app: 'reviews', version: 'v3' },
    namespace: {
      name: 'bookinfo'
    }
  },
  {
    name: 'reviews-v1',
    labels: { app: 'reviews', version: 'v1' },
    namespace: {
      name: 'bookinfo'
    }
  }
];

describe('#ServiceInfoWorkload render correctly with data', () => {
  it('should render service pods', () => {
    const wrapper = shallow(<ServiceInfoWorkload workloads={workloads} />);
    expect(wrapper).toBeDefined();
    expect(wrapper).toMatchSnapshot();
  });
});
