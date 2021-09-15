import * as React from 'react';
import { renderBadgedLink } from '../SummaryLink';
import { GraphNodeData, NodeType } from '../../../types/Graph';
import { PFBadge, PFBadges } from '../../../components/Pf/PfBadges';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

let defaultGraphData: GraphNodeData;

describe('renderBadgedLink', () => {
  beforeEach(() => {
    defaultGraphData = {
      id: 'testingID',
      nodeType: NodeType.WORKLOAD,
      cluster: 'default-cluster',
      namespace: 'bookinfo'
    };
  });

  it('should generate a link to istio config and badge for workload entries', () => {
    const node = { ...defaultGraphData, workload: 'details-v1', hasWorkloadEntry: true };
    const expectedLink = `/namespaces/${encodeURIComponent(node.namespace)}/istio/workloadentries/${encodeURIComponent(
      node.workload!
    )}`;
    const wrapper = mount(<MemoryRouter>{renderBadgedLink(node)}</MemoryRouter>);
    expect(wrapper.find('a').filter(`[href="${expectedLink}"]`).exists()).toBeTruthy();
    expect(
      wrapper
        .find(PFBadge)
        .filterWhere(badge => badge.prop('badge').badge === PFBadges.WorkloadEntry.badge)
        .exists()
    ).toBeTruthy();
  });

  it('should generate a link to workload page and badge', () => {
    const node = { ...defaultGraphData, workload: 'details-v1' };
    const expectedLink = `/namespaces/${encodeURIComponent(node.namespace)}/workloads/${encodeURIComponent(
      node.workload!
    )}`;
    const wrapper = mount(<MemoryRouter>{renderBadgedLink(node)}</MemoryRouter>);
    expect(wrapper.find('a').filter(`[href="${expectedLink}"]`).exists()).toBeTruthy();
    expect(
      wrapper
        .find(PFBadge)
        .filterWhere(badge => badge.prop('badge').badge === PFBadges.Workload.badge)
        .exists()
    ).toBeTruthy();
  });
});
