import { PfColors } from '../../components/Pf/PfColors';

export const TEST = {
  elements: {
    nodes: [
      {
        data: {
          id: 'n2',
          text: 'details (v1)',
          service: 'details.istio-system.svc.cluster.local',
          version: 'v1',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bdestination_service%3D%22details.istio-system.svc.cluster.local%22%2Cdestination_version%3D%22v1%22%7D'
        }
      },
      {
        data: {
          id: 'n1',
          text: 'productpage (v1)',
          service: 'productpage.istio-system.svc.cluster.local',
          version: 'v1',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bdestination_service%3D%22productpage.istio-system.svc.cluster.local%22%2Cdestination_version%3D%22v1%22%7D'
        }
      },
      {
        data: {
          id: 'n3',
          text: 'reviews (v1)',
          service: 'reviews.istio-system.svc.cluster.local',
          version: 'v1',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bdestination_service%3D%22reviews.istio-system.svc.cluster.local%22%2Cdestination_version%3D%22v1%22%7D'
        }
      },
      {
        data: {
          id: 'n0',
          text: 'unknown',
          service: 'unknown',
          version: 'unknown',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bsource_service%3D%22unknown%22%2Csource_version%3D%22unknown%22%7D'
        }
      }
    ],
    edges: [
      {
        data: {
          id: 'e0',
          source: 'n0',
          target: 'n1',
          text: '12.54pm',
          color: PfColors.Green400
        }
      },
      {
        data: {
          id: 'e1',
          source: 'n1',
          target: 'n2',
          text: '12.54pm',
          color: PfColors.Green400
        }
      },
      {
        data: {
          id: 'e2',
          source: 'n1',
          target: 'n3',
          text: '12.54pm',
          color: PfColors.Green400
        }
      }
    ]
  }
};

export const ISTIO_SYSTEM = {
  elements: {
    nodes: [
      {
        data: {
          id: 'n2',
          text: 'details (v1)',
          service: 'details.istio-system.svc.cluster.local',
          version: 'v1',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bdestination_service%3D%22details.istio-system.svc.cluster.local%22%2Cdestination_version%3D%22v1%22%7D'
        }
      },
      {
        data: {
          id: 'n1',
          text: 'productpage (v1)',
          service: 'productpage.istio-system.svc.cluster.local',
          version: 'v1',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bdestination_service%3D%22productpage.istio-system.svc.cluster.local%22%2Cdestination_version%3D%22v1%22%7D'
        }
      },
      {
        data: {
          id: 'n5',
          text: 'ratings (v1)',
          service: 'ratings.istio-system.svc.cluster.local',
          version: 'v1',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bdestination_service%3D%22ratings.istio-system.svc.cluster.local%22%2Cdestination_version%3D%22v1%22%7D'
        }
      },
      {
        data: {
          id: 'n7',
          text: 'reviews',
          service: 'reviews.istio-system.svc.cluster.local'
        }
      },
      {
        data: {
          id: 'n3',
          text: 'reviews (v1)',
          parent: 'n7',
          service: 'reviews.istio-system.svc.cluster.local',
          version: 'v1',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bdestination_service%3D%22reviews.istio-system.svc.cluster.local%22%2Cdestination_version%3D%22v1%22%7D'
        }
      },
      {
        data: {
          id: 'n4',
          text: 'reviews (v2)',
          parent: 'n7',
          service: 'reviews.istio-system.svc.cluster.local',
          version: 'v2',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bdestination_service%3D%22reviews.istio-system.svc.cluster.local%22%2Cdestination_version%3D%22v2%22%7D'
        }
      },
      {
        data: {
          id: 'n6',
          text: 'reviews (v3)',
          parent: 'n7',
          service: 'reviews.istio-system.svc.cluster.local',
          version: 'v3',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bdestination_service%3D%22reviews.istio-system.svc.cluster.local%22%2Cdestination_version%3D%22v3%22%7D'
        }
      },
      {
        data: {
          id: 'n0',
          text: 'unknown',
          service: 'unknown',
          version: 'unknown',
          link_prom_graph:
            'http://prometheus:9090/graph?g0.range_input=1h\u0026g0.tab=0\u0026g0.expr=istio_request_count%7Bsource_service%3D%22unknown%22%2Csource_version%3D%22unknown%22%7D'
        }
      }
    ],
    edges: [
      {
        data: {
          id: 'e0',
          source: 'n0',
          target: 'n1',
          text: '0ps',
          color: PfColors.Black
        }
      },
      {
        data: {
          id: 'e1',
          source: 'n1',
          target: 'n2',
          text: '0ps',
          color: PfColors.Black
        }
      },
      {
        data: {
          id: 'e2',
          source: 'n1',
          target: 'n3',
          text: '0ps',
          color: PfColors.Black
        }
      },
      {
        data: {
          id: 'e3',
          source: 'n1',
          target: 'n4',
          text: '0ps',
          color: PfColors.Black
        }
      },
      {
        data: {
          id: 'e5',
          source: 'n1',
          target: 'n6',
          text: '0ps',
          color: PfColors.Black
        }
      },
      {
        data: {
          id: 'e4',
          source: 'n4',
          target: 'n5',
          text: '0ps',
          color: PfColors.Black
        }
      },
      {
        data: {
          id: 'e6',
          source: 'n6',
          target: 'n5',
          text: '0ps',
          color: PfColors.Black
        }
      }
    ]
  }
};
