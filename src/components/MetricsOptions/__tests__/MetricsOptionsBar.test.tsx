import * as React from 'react';
import { mount, shallow } from 'enzyme';

import MetricsOptionsBar from '../MetricsOptionsBar';

const optionsChanged = jest.fn();
const lastOptionsChanged = () => {
  return optionsChanged.mock.calls[optionsChanged.mock.calls.length - 1][0];
};

describe('MetricsOptionsBar', () => {
  it('renders initial layout', () => {
    const wrapper = shallow(
      <MetricsOptionsBar
        onOptionsChanged={jest.fn()}
        onPollIntervalChanged={jest.fn()}
        onManualRefresh={jest.fn()}
        onReporterChanged={jest.fn()}
        metricReporter={'destination'}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('changes trigger parent callback', () => {
    const wrapper = mount(
      <MetricsOptionsBar
        onOptionsChanged={optionsChanged}
        onPollIntervalChanged={jest.fn()}
        onManualRefresh={jest.fn()}
        onReporterChanged={jest.fn()}
        metricReporter={'destination'}
      />
    );
    expect(optionsChanged).toHaveBeenCalledTimes(1);
    const opts = lastOptionsChanged();
    // Step = duration / ticks
    expect(opts).toHaveProperty('duration', MetricsOptionsBar.DefaultDuration);

    let elt = wrapper
      .find('#metrics_filter_interval_duration')
      .find('SafeAnchor')
      .first();
    elt.simulate('click');
    expect(optionsChanged).toHaveBeenCalledTimes(2);
    const expectedDuration = Object.keys(MetricsOptionsBar.Durations)[0];
    expect(lastOptionsChanged()).toHaveProperty('duration', expectedDuration);
  });
});
