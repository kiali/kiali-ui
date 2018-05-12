import serviceGraphDataState, { SERVICE_GRAPH_DATA_INITIAL_STATE } from '../ServiceGraphDataState';
import { ServiceGraphDataActionKeys } from '../../actions/ServiceGraphDataActions';

describe('ServiceGraphDataState reducer', () => {
  it('should return the initial state', () => {
    expect(serviceGraphDataState(undefined, {})).toEqual(SERVICE_GRAPH_DATA_INITIAL_STATE);
  });

  it('should handle CHANGE_GRAPH_LAYOUT', () => {
    expect(
      serviceGraphDataState(
        {
          isLoading: false,
          timestamp: 0,
          graphType: 'cola',
          duration: 60,
          graphData: {}
        },
        {
          type: ServiceGraphDataActionKeys.CHANGE_GRAPH_LAYOUT,
          graphType: 'cose'
        }
      )
    ).toEqual({
      isLoading: false,
      timestamp: 0,
      graphType: 'cose',
      duration: 60,
      graphData: {}
    });
  });

  it('should handle CHANGE_DURATION', () => {
    expect(
      serviceGraphDataState(
        {
          isLoading: false,
          timestamp: 0,
          graphType: 'cola',
          duration: 60,
          graphData: {}
        },
        {
          type: ServiceGraphDataActionKeys.CHANGE_GRAPH_LAYOUT,
          duration: 120
        }
      )
    ).toEqual({
      isLoading: false,
      timestamp: 0,
      graphType: 'cola',
      duration: 120,
      graphData: {}
    });
  });
});
