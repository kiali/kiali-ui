import * as React from 'react';
import { shallow } from 'enzyme';
import ServiceInfoPods from '../ServiceInfoPods';
import { Pod } from '../../../../types/ServiceInfo';

const pods: Pod[] = [
  {
    name: 'reviews-v2-1234',
    labels: { app: 'reviews', version: 'v2' },
    createdAt: '2018-03-14T10:17:52Z',
    createdBy: []
  },
  {
    name: 'reviews-v3-1234',
    labels: { app: 'reviews', version: 'v3' },
    createdAt: '2018-03-14T10:17:52Z',
    createdBy: []
  },
  {
    name: 'reviews-v1-1234',
    labels: { app: 'reviews', version: 'v1' },
    createdAt: '2018-03-14T10:17:52Z',
    createdBy: []
  }
];

// Mocking "toLocaleString", which is used for dates display
//  since it may produce different results on CI and dev machines, breaking snapshots.
Date.prototype.toLocaleString = jest.fn(Date.prototype.toISOString);

describe('#ServiceInfoPods render correctly with data', () => {
  it('should render service pods', () => {
    const wrapper = shallow(<ServiceInfoPods pods={pods} />);
    expect(wrapper).toBeDefined();
    expect(wrapper).toMatchSnapshot();
  });
});
