import * as React from 'react';
import { shallow } from 'enzyme';

import ReactCytoscapeConnected from '../ReactCytoscape';
import { CytoscapeLayout } from '../CytoscapeLayout';
import * as GRAPH_DATA from '../../../services/__mockData__/getGraphElements';
import { Duration, Layout, BadgeStatus } from '../../../types/GraphFilter';

jest.mock('../../../services/Api');

const testNamespace = 'ISTIO_SYSTEM';

const testClickHandler = () => {
  console.log('click');
};

const testReadyHandler = () => {
  console.log('ready');
};

describe('CytoscapeLayout component test', () => {
  it('should set correct elements data', () => {
    const myLayout: Layout = { name: 'breadthfirst' };
    const myDuration: Duration = { value: 300 };
    const badgeStatus: BadgeStatus = { hideCBs: false, hideRRs: false };

    const wrapper = shallow(
      <CytoscapeLayout
        namespace={{ name: testNamespace }}
        elements={GRAPH_DATA[testNamespace]}
        graphLayout={myLayout}
        graphDuration={myDuration}
        onClick={testClickHandler}
        onReady={testReadyHandler}
        refresh={testClickHandler}
        badgeStatus={badgeStatus}
        showEdgeLabels={false}
        showNodeLabels={true}
      />
    );
    const cytoscapeWrapper = wrapper.find(ReactCytoscapeConnected);
    expect(cytoscapeWrapper.prop('elements')['elements'].nodes).toEqual(GRAPH_DATA[testNamespace].elements.nodes);
    expect(cytoscapeWrapper.prop('elements')['elements'].edges).toEqual(GRAPH_DATA[testNamespace].elements.edges);
  });
});
