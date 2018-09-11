import * as React from 'react';
import { shallow } from 'enzyme';
import OverviewPage from '../OverviewPage';
import { FilterSelected } from '../../../components/Filters/StatefulFilters';

describe('Overview page', () => {
  it('renders initial layout', () => {
    const mock: any = jest.fn();
    const wrapper = shallow(<OverviewPage match={mock} location={mock} history={mock} staticContext={mock} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('filters namespaces info health', () => {
    FilterSelected.setSelected([
      {
        category: 'Health',
        value: 'Failure'
      }
    ]);
    let passing = OverviewPage.isPassingFilters({
      name: 'test-ns',
      appsInError: [],
      appsInWarning: [],
      appsInSuccess: ['app1', 'app2']
    });
    expect(passing).toBe(false);

    passing = OverviewPage.isPassingFilters({
      name: 'test-ns',
      appsInError: ['app1'],
      appsInWarning: [],
      appsInSuccess: ['app2']
    });
    expect(passing).toBe(true);

    FilterSelected.setSelected([
      {
        category: 'Health',
        value: 'Degraded'
      },
      {
        category: 'Health',
        value: 'Healthy'
      }
    ]);
    passing = OverviewPage.isPassingFilters({
      name: 'test-ns',
      appsInError: ['app1'],
      appsInWarning: [],
      appsInSuccess: ['app2']
    });
    expect(passing).toBe(true);

    passing = OverviewPage.isPassingFilters({
      name: 'test-ns',
      appsInError: ['app1', 'app2'],
      appsInWarning: ['app3', 'app4'],
      appsInSuccess: []
    });
    expect(passing).toBe(true);

    passing = OverviewPage.isPassingFilters({
      name: 'test-ns',
      appsInError: ['app1'],
      appsInWarning: [],
      appsInSuccess: []
    });
    expect(passing).toBe(false);
  });

  it('filters namespaces info name', () => {
    FilterSelected.setSelected([
      {
        category: 'Health',
        value: 'Degraded'
      },
      {
        category: 'Name',
        value: 'test'
      }
    ]);
    let passing = OverviewPage.isPassingFilters({
      name: 'test-ns',
      appsInError: [],
      appsInWarning: [],
      appsInSuccess: ['app1', 'app2']
    });
    expect(passing).toBe(false);

    passing = OverviewPage.isPassingFilters({
      name: 'test-ns',
      appsInError: [],
      appsInWarning: ['app1', 'app2'],
      appsInSuccess: []
    });
    expect(passing).toBe(true);

    passing = OverviewPage.isPassingFilters({
      name: 'ns',
      appsInError: [],
      appsInWarning: ['app1', 'app2'],
      appsInSuccess: []
    });
    expect(passing).toBe(false);
  });
});
