import * as React from 'react';
import { SummaryPanelPropType } from '../../types/Graph';
import { JaegerInfo } from 'types/JaegerInfo';

type Props = SummaryPanelPropType & {
  jaegerInfo?: JaegerInfo;
};

export class SummaryPanelNodeTraces extends React.Component<Props, {}> {
  // constructor(props: Props) {
  //   super(props);
  // }

  // componentDidUpdate(prevProps: Props) {
  //   if (shouldRefreshData(prevProps, this.props)) {
  //   }
  // }

  componentWillUnmount() {
    // if (this.metricsPromise) {
    //   this.metricsPromise.cancel();
    // }
  }

  render() {
    // const node = this.props.data.summaryTarget;
    // const nodeData = decoratedNodeData(node);
    // const { nodeType, workload } = nodeData;
    // const servicesList = nodeType !== NodeType.SERVICE && renderDestServicesLinks(node);

    // const shouldRenderSvcList = servicesList && servicesList.length > 0;
    // const shouldRenderWorkload = nodeType !== NodeType.WORKLOAD && nodeType !== NodeType.UNKNOWN && workload;

    return <>HERE SHOW TRACES</>;
  }
}
