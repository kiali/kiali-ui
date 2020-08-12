import * as React from 'react';
import { shallow } from 'enzyme';
import ProxyStatusList from '../ProxyStatusList';
import { ProxyStatus } from '../../../types/Health';
import { FlexItem, Split } from '@patternfly/react-core';
import { shallowToJson } from 'enzyme-to-json';

const workloadName = 'reviews-v1-12gaas-2as';
const shallowComponent = (statuses: ProxyStatus[]) => {
  return shallow(<ProxyStatusList workloadName={workloadName} statuses={statuses} />);
};

describe('ProxyStatusList', () => {
  describe('when status is empty', () => {
    const statuses: ProxyStatus[] = [];
    const subject = shallowComponent(statuses);

    it("doesn't render any component", () => {
      expect(subject).toHaveLength(0);
    });

    it('match the snapshot', () => {
      expect(shallowToJson(subject)).toMatchSnapshot();
    });
  });

  describe('when there are statuses', () => {
    const statuses: ProxyStatus[] = [
      { component: 'RDS', status: 'STALE' },
      { component: 'CDS', status: 'NOT_SENT' }
    ];

    const subject = shallowComponent(statuses);

    it('match the snapshot', () => {
      expect(shallowToJson(subject)).toMatchSnapshot();
    });

    it('renders an split component', () => {
      expect(subject.find(Split)).toHaveLength(1);
    });

    it('has the workload names in the first item', () => {
      const split = subject.find(Split);
      expect(split.childAt(0).html()).toContain(workloadName);
    });

    it('renders all statuses sorted alphabetically', () => {
      const split = subject.find(Split);
      expect(split.children()).toHaveLength(2);

      const statusList = split.childAt(1);
      expect(statusList).toBeDefined();

      const statusItems = statusList.find(FlexItem);
      expect(statusItems).toHaveLength(2);
      expect(statusItems.at(0).html()).toContain('CDS: NOT_SENT');
      expect(statusItems.at(1).html()).toContain('RDS: STALE');
    });
  });
});
