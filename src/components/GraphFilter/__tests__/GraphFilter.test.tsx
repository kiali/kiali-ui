import * as React from 'react';
import { mount } from 'enzyme';

import { GraphFilter, DropdownList } from '../GraphFilter';
import { DropdownButton } from 'patternfly-react';
import { GraphFilterProps } from '../../../types/GraphFilter';
import * as MOCK_NS from '../../../services/__mockData__/getNamespaces';

jest.mock('../../../services/Api');

const TEST_NS1 = 'kube-public';

const mockProps: GraphFilterProps = {
  onError: jest.fn(),
  onFilterChange: jest.fn(),
  onLayoutChange: jest.fn(),
  onNamespaceChange: jest.fn(),
  activeDuration: { value: '60' },
  activeNamespace: { name: TEST_NS1 },
  activeLayout: { name: 'cola' }
};

describe('GraphFilter test', () => {
  it('generates dropdown list correctly', async () => {
    const wrapper = await mount(<GraphFilter {...mockProps} />);
    const dropdown = wrapper.find(DropdownButton);
    dropdown.simulate('click');

    // the dropdown list be generated from 'backend' data at this point
    const nsListWrapper = wrapper.find(DropdownList);

    // use slice() to convert mobx psuedo array to real array
    const actualList = nsListWrapper.props().list.slice();

    expect(actualList.length).toBeGreaterThan(0);
    expect(actualList).toEqual(MOCK_NS.TEST_LIST);
  });
});
