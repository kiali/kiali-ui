import { Col, Row } from 'patternfly-react';
import * as React from 'react';
import { App } from '../../types/App';
import { DurationInSeconds } from '../../types/Common';
import { getName } from '../../utils/RateIntervals';
import DetailedTrafficList, { TrafficItem } from '../../components/Details/DetailedTrafficList';
import { NodeType } from '../../types/Graph';

type AppTrafficProps = {
  app: App;
  rateInterval: DurationInSeconds;
  trafficData: any;
};

type AppTrafficState = {
  inboundTraffic: TrafficItem[];
  outboundTraffic: TrafficItem[];
};

type ServiceTraffic = {
  [key: string]: TrafficItem;
};

class AppTraffic extends React.Component<AppTrafficProps, AppTrafficState> {
  constructor(props: AppTrafficProps) {
    super(props);
    this.state = {
      inboundTraffic: [],
      outboundTraffic: []
    };
  }

  componentDidUpdate(prevProps: AppTrafficProps) {
    if (prevProps.trafficData !== this.props.trafficData) {
      this.processTrafficData(this.props.trafficData);
    }
  }

  render() {
    const rateIntervalName = getName(this.props.rateInterval).toLowerCase();

    return (
      <Row className="card-pf-body">
        <Col xs={12}>
          <div>
            <strong>Inbound ({rateIntervalName})</strong>
          </div>
          <DetailedTrafficList direction="inbound" traffic={this.state.inboundTraffic} />
          <div style={{ marginTop: '2em' }}>
            <strong>Outbound ({rateIntervalName})</strong>
          </div>
          <DetailedTrafficList direction="outbound" traffic={this.state.outboundTraffic} />
        </Col>
      </Row>
    );
  }

  private indexTrafficByProtocol = edge => {
    const traffic = {};

    if (edge.data.traffic && edge.data.traffic.length > 0) {
      edge.data.traffic.forEach(trafficItem => {
        traffic[trafficItem.protocol] = trafficItem.rates;
      });
    }

    return traffic;
  };

  private processWorkloadsTraffic = (edges, serviceTraffic: ServiceTraffic, nodes, myNode) => {
    const inboundTraffic: TrafficItem[] = [];
    const outboundTraffic: TrafficItem[] = [];

    edges.forEach(edge => {
      const sourceNode = nodes['id-' + edge.data.source];
      const targetNode = nodes['id-' + edge.data.target];

      if (myNode.id === edge.data.source || myNode.id === edge.data.target) {
        return;
      }

      if (targetNode.nodeType === NodeType.SERVICE) {
        const svcId = `in-${targetNode.namespace}-${targetNode.service}`;
        if (serviceTraffic[svcId]) {
          inboundTraffic.push({
            traffic: this.indexTrafficByProtocol(edge),
            proxy: serviceTraffic[svcId],
            node: {
              id: `in-${sourceNode.id}`,
              type: sourceNode.nodeType,
              namespace: sourceNode.namespace,
              name: sourceNode.app,
              version: sourceNode.version
            }
          });
        }
      } else if (sourceNode.nodeType === NodeType.SERVICE) {
        const svcId = `out-${sourceNode.namespace}-${sourceNode.service}`;
        if (serviceTraffic[svcId]) {
          outboundTraffic.push({
            traffic: this.indexTrafficByProtocol(edge),
            proxy: serviceTraffic[svcId],
            node: {
              id: `out-${targetNode.id}`,
              type: targetNode.nodeType,
              namespace: targetNode.namespace,
              name: targetNode.app,
              version: targetNode.version
            }
          });
        }
      }
    });

    return { inboundTraffic, outboundTraffic };
  };

  private processServicesTraffic = (edges, nodes, myNode) => {
    const serviceTraffic: ServiceTraffic = {};
    const inboundTraffic: TrafficItem[] = [];
    const outboundTraffic: TrafficItem[] = [];

    edges.forEach(edge => {
      const sourceNode = nodes['id-' + edge.data.source];
      const targetNode = nodes['id-' + edge.data.target];
      if (myNode.id === edge.data.source && targetNode.nodeType === 'service') {
        const svcId = `out-${targetNode.namespace}-${targetNode.service}`;
        if (!serviceTraffic[svcId]) {
          serviceTraffic[svcId] = {
            traffic: this.indexTrafficByProtocol(edge),
            node: {
              id: `out-${targetNode.id}`,
              type: targetNode.nodeType,
              namespace: targetNode.namespace,
              name: targetNode.service
            }
          };
          outboundTraffic.push(serviceTraffic[svcId]);
        }
      } else if (myNode.id === edge.data.target && sourceNode.nodeType === 'service') {
        const svcId = `in-${sourceNode.namespace}-${sourceNode.service}`;
        if (!serviceTraffic[svcId]) {
          serviceTraffic[svcId] = {
            traffic: this.indexTrafficByProtocol(edge),
            node: {
              id: `in-${sourceNode.id}`,
              type: sourceNode.nodeType,
              namespace: sourceNode.namespace,
              name: sourceNode.service
            }
          };
          inboundTraffic.push(serviceTraffic[svcId]);
        }
      }
    });

    return { serviceTraffic, inboundTraffic, outboundTraffic };
  };

  private processTrafficData = (traffic: any) => {
    if (!traffic) {
      console.log('Not processing');
      this.setState({ inboundTraffic: [], outboundTraffic: [] });
    }

    // Index nodes by id and find the node of the queried workload
    const nodes: any = {};
    let myNode: any = {};

    traffic.elements.nodes.forEach(element => {
      nodes['id-' + element.data.id] = element.data;
      if (element.data.app === this.props.app.name && element.data.namespace === this.props.app.namespace.name) {
        myNode = element.data;
      }
    });

    console.log('appProp', this.props.app);
    console.log('myNode', myNode);
    console.log('indexed', nodes);

    // It's assumed that traffic is sent/received through services.
    // So, process traffic to/from services first.
    const {
      serviceTraffic,
      inboundTraffic: servicesInbound,
      outboundTraffic: servicesOutbound
    } = this.processServicesTraffic(traffic.elements.edges, nodes, myNode);

    // Then, process traffic going/originating to/from workloads
    const { inboundTraffic: workloadsInbound, outboundTraffic: workloadsOutbound } = this.processWorkloadsTraffic(
      traffic.elements.edges,
      serviceTraffic,
      nodes,
      myNode
    );

    // Merge and set resolved traffic
    const inboundTraffic = servicesInbound.concat(workloadsInbound);
    const outboundTraffic = servicesOutbound.concat(workloadsOutbound);
    this.setState({ inboundTraffic, outboundTraffic });

    console.log('inbound', inboundTraffic);
    console.log('outbound', outboundTraffic);
  };
}

export default AppTraffic;
