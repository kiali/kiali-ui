import * as React from 'react';
import { shallow } from 'enzyme';
import ProxyStatusList from '../ProxyStatusList';
import { ProxyStatus } from '../../../../types/Health';
import { StackItem, Tooltip } from '@patternfly/react-core';
import { shallowToJson } from 'enzyme-to-json';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

const syncedProxyStatus: ProxyStatus = {
  CDS: 'Synced',
  EDS: 'Synced',
  LDS: 'Synced',
  RDS: 'Synced'
};

const shallowComponent = (statuses: ProxyStatus) => {
  return shallow(<ProxyStatusList status={statuses} />);
};

describe('ProxyStatusList', () => {
  describe('when status is synced', () => {
    const subject = shallowComponent(syncedProxyStatus);

    it('renders the sync icon', () => {
      expect(subject.find(Tooltip)).toHaveLength(0);
    });

    it('does not render the tooltip', () => {
      expect(subject.find(Tooltip)).toHaveLength(0);
    });

    it('match the snapshot', () => {
      expect(shallowToJson(subject)).toMatchSnapshot();
    });
  });

  describe('when there are unsyced components', () => {
    const statuses: ProxyStatus = syncedProxyStatus;
    syncedProxyStatus.RDS = 'STALE';
    syncedProxyStatus.CDS = 'NOT_SENT';

    const subject = shallowComponent(statuses);

    it('match the snapshot', () => {
      expect(shallowToJson(subject)).toMatchSnapshot();
    });

    it('renders the tooltip', () => {
      const tooltip = subject.find(Tooltip);
      expect(tooltip).toHaveLength(1);
    });

    it('renders a degraded icon', () => {
      expect(subject.find(ExclamationTriangleIcon)).toBeDefined();
    });

    it('renders all unsynced statuses', () => {
      const stack = shallow(subject.props().content);
      expect(stack).toHaveLength(1);

      const statusList = stack.children();
      expect(statusList).toHaveLength(2);

      const statusItems = statusList.find(StackItem);
      expect(statusItems.at(0).html()).toContain('CDS: NOT_SENT');
      expect(statusItems.at(1).html()).toContain('RDS: STALE');
    });
  });

  describe('when there are components without value', () => {
    const statuses: ProxyStatus = syncedProxyStatus;
    syncedProxyStatus.RDS = '';
    syncedProxyStatus.CDS = '';

    const subject = shallowComponent(statuses);

    it('match the snapshot', () => {
      expect(shallowToJson(subject)).toMatchSnapshot();
    });

    it('renders the tooltip', () => {
      const tooltip = subject.find(Tooltip);
      expect(tooltip).toHaveLength(1);
    });

    it('renders a degraded icon', () => {
      expect(subject.find(ExclamationTriangleIcon)).toBeDefined();
    });

    it('renders all unsynced statuses', () => {
      const stack = shallow(subject.props().content);
      expect(stack).toHaveLength(1);

      const statusList = stack.children();
      expect(statusList).toHaveLength(2);

      const statusItems = statusList.find(StackItem);
      expect(statusItems.at(0).html()).toContain('CDS: -');
      expect(statusItems.at(1).html()).toContain('RDS: -');
    });
  });
});
