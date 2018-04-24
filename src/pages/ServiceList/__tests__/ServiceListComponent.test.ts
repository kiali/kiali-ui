import { sortFields, sortServices } from '../ServiceListComponent';
import { ServiceItem } from '../../../types/ServiceListComponent';
import { RequestHealth } from '../../../types/Health';

const makeService = (name: string, reqCount: number, errCount: number): ServiceItem => {
  const reqErrs: RequestHealth = {
    requestCount: reqCount,
    requestErrorCount: errCount
  };
  return { name: name, health: { requests: reqErrs } } as ServiceItem;
};

describe('SortField#compare', () => {
  describe('sortField = error_rate, is ascending', () => {
    const sortField = sortFields.find(s => s.title === 'Error Rate')!;
    it('should return >0 when A service has more error than B', () => {
      const serviceA = makeService('A', 10, 4);
      const serviceB = makeService('B', 10, 2);
      expect(sortField.compare(serviceA, serviceB)).toBeGreaterThan(0);
    });
    it('should return <0 when A service has more error than B', () => {
      const serviceA = makeService('A', 10, 2);
      const serviceB = makeService('B', 10, 4);
      expect(sortField.compare(serviceA, serviceB)).toBeLessThan(0);
    });
    it('should return zero when A and B services has same error rate', () => {
      const serviceA = makeService('', 10, 1);
      const serviceB = makeService('', 10, 1);
      expect(sortField.compare(serviceA, serviceB)).toBe(0);
    });
  });
});

describe('ServiceListComponent#sortServices', () => {
  const sortField = sortFields.find(s => s.title === 'Service Name')!;
  const services = [makeService('A', 0, 0), makeService('B', 0, 0)];
  it('should sort ascending', () => {
    const sorted = sortServices(services, sortField, true);
    expect(sorted[0].name).toBe('A');
    expect(sorted[1].name).toBe('B');
  });
  it('should sort descending', () => {
    const sorted = sortServices(services, sortField, false);
    expect(sorted[0].name).toBe('B');
    expect(sorted[1].name).toBe('A');
  });
});
