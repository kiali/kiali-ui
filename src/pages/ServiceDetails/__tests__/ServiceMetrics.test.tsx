import * as React from 'react';
import { shallow } from 'enzyme';
import camelcase from 'lodash/camelCase';
import * as assert from 'assert';

import ServiceMetrics from '../ServiceMetrics';

const EXPECTED_SERVICE_ID = {
  namespace: 'system',
  service: 'pinger'
};

const HISTOGRAM = {
  average: 4.5,
  median: 4.2,
  percentile95: 4,
  percentile99: 4.25
};

/**
 * Shifting histogram data by 'offset' to make expected data unique
 * @param offset
 */
const genHistogram = (offset: number) => {
  const hist = {};
  for (let property in HISTOGRAM) {
    if (HISTOGRAM.hasOwnProperty(property)) {
      hist[property] = HISTOGRAM[property] + offset;
    }
  }
  return hist;
};

const EXPECTED_METRICS = {
  request_count_in: { value: 11 },
  request_count_out: { value: 12 },
  request_size_in: genHistogram(0),
  request_size_out: genHistogram(1),
  request_duration_in: genHistogram(2),
  request_duration_out: genHistogram(3),
  response_size_in: genHistogram(4),
  response_size_out: genHistogram(5),
  healthy_replicas: { value: 16 },
  total_replicas: { value: 32 }
};

jest.mock('../../../services/Api');
require('../../../services/Api').__setMockMetricsData(EXPECTED_METRICS);

describe('Test suite "ServiceMetrics"', () => {
  it('should receive metric data', async () => {
    const wrapper = await shallow(<ServiceMetrics {...EXPECTED_SERVICE_ID} />);

    const actual = wrapper.update();
    console.log(actual.debug());

    expect(actual.render().html()).toMatch(/Health: 50 %/);

    // Verify internal states
    for (let s in EXPECTED_METRICS) {
      if (EXPECTED_METRICS.hasOwnProperty(s)) {
        assert.deepEqual(actual.state()[camelcase(s)], EXPECTED_METRICS[s], s);
      }
    }
  });
});
