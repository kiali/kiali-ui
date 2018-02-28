import * as React from 'react';
import { MemoryRouter } from 'react-router';
import { render, mount } from 'enzyme';

import Navigation from '../Navigation';

const BROWSING_HISTORY = ['/services', '/service-graph/default', '/foo/bar'];

jest.mock('react-cytoscape');

describe('Test suite Navigation', () => {
  it('should render default (Home) view', () => {
    const app = render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );
    expect(app.text()).toMatch('Welcome to SWS UI');
  });

  it('should render Graph view', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={BROWSING_HISTORY} initialIndex={1}>
        <Navigation />
      </MemoryRouter>
    );
    expect(wrapper.text()).toMatch('Services Graph');
  });

  it('should render Services view', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={BROWSING_HISTORY} initialIndex={0}>
        <Navigation />
      </MemoryRouter>
    );
    expect(wrapper.text()).toMatch('Namespace');
  });
});
