import { setServerConfig } from '../../../config/ServerConfig';
import { serverRateConfig } from '../__testData__/ErrorRateConfig';
import { getTotalRequest } from '../GraphEdgeStatus';
import { Responses } from '../../Graph';

describe('getRateHealthConfig', () => {
  beforeAll(() => {
    setServerConfig(serverRateConfig);
  });

  it('getTotalRequest', () => {
    // Check with annotation to set 400
    const resp: Responses = {
      '200': { hosts: {}, flags: { '-': '3', XX: '4', YYY: '2' } },
      '400': { hosts: {}, flags: { '-': '1', XX: '1', YYY: '6' } }
    };
    expect(getTotalRequest(resp)).toBe(17);
  });
});
