import {
  NodeType,
  DecoratedGraphElements,
  DecoratedGraphNodeData,
  DecoratedGraphEdgeData,
  DecoratedGraphNodeWrapper
} from '../../../types/Graph';
import { KialiIcon } from 'config/KialiIcon';
import { ScoringCriteria, scoreNodes } from '../GraphScore';

const findById = (id: string) => (node: DecoratedGraphNodeWrapper) => node.data.id === id;

describe('scoreNodes', () => {
  let nodeData: DecoratedGraphNodeData;
  let edgeData: DecoratedGraphEdgeData;

  beforeEach(() => {
    nodeData = {
      id: 'source',
      nodeType: NodeType.APP,
      cluster: 'any',
      namespace: 'any',
      grpcIn: 0,
      grpcInErr: 0,
      grpcInNoResponse: 0,
      grpcOut: 0,
      health: {
        health: {
          items: []
        },
        getGlobalStatus: () => ({
          name: 'any',
          color: 'any',
          priority: 1,
          icon: KialiIcon['warning'],
          class: 'any'
        }),
        getStatusConfig: () => undefined,
        getTrafficStatus: () => undefined,
        getWorkloadStatus: () => undefined
      },
      healthStatus: 'any',
      httpIn: 0,
      httpIn3xx: 0,
      httpIn4xx: 0,
      httpIn5xx: 0,
      httpInNoResponse: 0,
      httpOut: 0,
      tcpIn: 0,
      tcpOut: 0,

      traffic: {} as never
    };
    edgeData = {
      id: 'any',
      source: 'any',
      target: 'any',
      grpc: 0,
      grpcErr: 0,
      grpcNoResponse: 0,
      grpcPercentErr: 0,
      grpcPercentReq: 0,
      http: 0,
      http3xx: 0,
      http4xx: 0,
      http5xx: 0,
      httpNoResponse: 0,
      httpPercentErr: 0,
      httpPercentReq: 0,
      protocol: 'tcp',
      responses: {},
      tcp: 0,
      isMTLS: 0,
      responseTime: 0,
      throughput: 0
    };
  });

  it('scores inbound edges', () => {
    const input: DecoratedGraphElements = {
      nodes: [
        {
          data: { ...nodeData, id: 'source' }
        },
        {
          data: { ...nodeData, id: 'target' }
        }
      ],
      edges: [
        {
          data: { ...edgeData, protocol: 'tcp', id: 'target1', source: 'source', target: 'target' }
        },
        {
          data: { ...edgeData, protocol: 'tcp', id: 'target2', source: 'source', target: 'target' }
        }
      ]
    };
    const scoredNodes = scoreNodes(input, ScoringCriteria.InboundEdges);

    const source = scoredNodes.nodes?.find(findById('source'))!;
    const target = scoredNodes.nodes?.find(findById('target'))!;

    expect(target.data.score).toEqual(1);
    expect(target.data.rank).toEqual(1);

    expect(source.data.score).toBeUndefined();
    expect(source.data.rank).toBeUndefined();
  });

  it('scores inbound edges with multiple targets', () => {
    const input: DecoratedGraphElements = {
      nodes: [
        {
          data: { ...nodeData, id: 'source' }
        },
        {
          data: { ...nodeData, id: 'target1' }
        },
        {
          data: { ...nodeData, id: 'target2' }
        }
      ],
      edges: [
        {
          data: { ...edgeData, protocol: 'tcp', id: 'edge1', source: 'source', target: 'target1' }
        },
        {
          data: { ...edgeData, protocol: 'tcp', id: 'edge2', source: 'source', target: 'target2' }
        },
        {
          data: { ...edgeData, protocol: 'tcp', id: 'edge3', source: 'source', target: 'target2' }
        },
        {
          data: { ...edgeData, protocol: 'tcp', id: 'edge4', source: 'source', target: 'target2' }
        }
      ]
    };
    const scoredNodes = scoreNodes(input, ScoringCriteria.InboundEdges);

    const target2 = scoredNodes.nodes?.find(findById('target2'))!;
    const target1 = scoredNodes.nodes?.find(findById('target1'))!;
    const source = scoredNodes.nodes?.find(findById('source'))!;

    expect(target2.data.score).toBeGreaterThan(target1.data.score!);
    expect(target2.data.rank).toEqual(1);

    expect(target1.data.score).toBeDefined();
    expect(target1.data.rank).toEqual(2);

    expect(source.data.score).toBeUndefined();
    expect(source.data.rank).toBeUndefined();
  });

  it('does not score for a graph with no edges', () => {
    const input: DecoratedGraphElements = {
      nodes: [
        {
          data: { ...nodeData, id: 'source' }
        },
        {
          data: { ...nodeData, id: 'target1' }
        },
        {
          data: { ...nodeData, id: 'target2' }
        }
      ],
      edges: []
    };
    const scoredNodes = scoreNodes(input, ScoringCriteria.InboundEdges);

    const target2 = scoredNodes.nodes?.find(findById('target2'))!;
    const target1 = scoredNodes.nodes?.find(findById('target1'))!;
    const source = scoredNodes.nodes?.find(findById('source'))!;

    expect(target2.data.score).toBeUndefined();
    expect(target2.data.rank).toBeUndefined();

    expect(target1.data.score).toBeUndefined();
    expect(target1.data.rank).toBeUndefined();

    expect(source.data.score).toBeUndefined();
    expect(source.data.rank).toBeUndefined();
  });
});
