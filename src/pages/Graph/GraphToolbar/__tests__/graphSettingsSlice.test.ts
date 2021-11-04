import { SummaryType } from 'types/Graph';
import reducer, { INITIAL_GRAPH_STATE, boxByClusterToggled, summaryDataUpdated } from '../graphSettingsSlice';

describe('graph settings slice reducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual(INITIAL_GRAPH_STATE);
  });

  it('toggles boxByCluster', () => {
    expect(reducer(INITIAL_GRAPH_STATE, boxByClusterToggled).toolbar.boxByCluster).not.toEqual(
      INITIAL_GRAPH_STATE.toolbar.boxByCluster
    );
  });

  it('should handle UPDATE_SUMMARY', () => {
    const updatedSummary = { summaryType: 'node' as SummaryType, summaryTarget: 'mynode' };
    expect(reducer(INITIAL_GRAPH_STATE, summaryDataUpdated(updatedSummary)).summaryData).toEqual(updatedSummary);
  });
});
