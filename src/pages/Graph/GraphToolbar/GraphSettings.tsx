import { Radio, Dropdown, DropdownToggle, Checkbox, Tooltip, TooltipPosition } from '@patternfly/react-core';
import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { bindActionCreators } from 'redux';
import { HistoryManager, URLParam } from '../../../app/History';
import { GraphToolbarState, KialiAppState } from '../../../store/Store';
import { GraphToolbarActions } from '../../../actions/GraphToolbarActions';
import { GraphType, EdgeLabelMode, isResponseTimeMode, isThroughputMode, RankMode } from '../../../types/Graph';
import { KialiAppAction } from 'actions/KialiAppAction';
import * as _ from 'lodash';
import { edgeLabelsSelector } from 'store/Selectors';
import {
  BoundingClientAwareComponent,
  PropertyType
} from 'components/BoundingClientAwareComponent/BoundingClientAwareComponent';
import { KialiIcon } from 'config/KialiIcon';
import {
  containerStyle,
  infoStyle,
  itemStyleWithInfo,
  itemStyleWithoutInfo,
  menuStyle,
  menuEntryStyle,
  titleStyle
} from 'styles/DropdownStyles';
import { INITIAL_GRAPH_STATE } from 'reducers/GraphDataState';

type ReduxProps = {
  boxByCluster: boolean;
  boxByNamespace: boolean;
  compressOnHide: boolean;
  edgeLabels: EdgeLabelMode[];
  rankBy: RankMode[];
  setEdgeLabels: (edgeLabels: EdgeLabelMode[]) => void;
  setRankBy: (rankBy: RankMode[]) => void;
  showIdleEdges: boolean;
  showIdleNodes: boolean;
  showMissingSidecars: boolean;
  showOperationNodes: boolean;
  showRank: boolean;
  showSecurity: boolean;
  showServiceNodes: boolean;
  showTrafficAnimation: boolean;
  showVirtualServices: boolean;
  toggleBoxByCluster(): void;
  toggleBoxByNamespace(): void;
  toggleCompressOnHide(): void;
  toggleGraphMissingSidecars(): void;
  toggleGraphSecurity(): void;
  toggleGraphVirtualServices(): void;
  toggleIdleEdges(): void;
  toggleIdleNodes(): void;
  toggleOperationNodes(): void;
  toggleRank(): void;
  toggleServiceNodes(): void;
  toggleTrafficAnimation(): void;
};

type GraphSettingsProps = ReduxProps &
  Omit<GraphToolbarState, 'findValue' | 'hideValue' | 'showLegend' | 'showFindHelp' | 'trafficRates'> & {
    disabled: boolean;
  };

type GraphSettingsState = { isOpen: boolean };

interface DisplayOptionType {
  id: string;
  labelText: string;
  isChecked: boolean;
  isDisabled?: boolean;
  onChange?: () => void;
  tooltip?: React.ReactNode;
}

const marginBottom = 20;

class GraphSettings extends React.PureComponent<GraphSettingsProps, GraphSettingsState> {
  constructor(props: GraphSettingsProps) {
    super(props);
    this.state = {
      isOpen: false
    };

    // Let URL override current redux state at construction time. Update URL as needed.
    this.handleURLBool(
      URLParam.GRAPH_ANIMATION,
      INITIAL_GRAPH_STATE.toolbarState.showTrafficAnimation,
      props.showTrafficAnimation,
      props.toggleTrafficAnimation
    );
    this.handleURLBool(
      URLParam.GRAPH_BADGE_SECURITY,
      INITIAL_GRAPH_STATE.toolbarState.showSecurity,
      props.showSecurity,
      props.toggleGraphSecurity
    );
    this.handleURLBool(
      URLParam.GRAPH_BADGE_SIDECAR,
      INITIAL_GRAPH_STATE.toolbarState.showMissingSidecars,
      props.showMissingSidecars,
      props.toggleGraphMissingSidecars
    );
    this.handleURLBool(
      URLParam.GRAPH_BADGE_VS,
      INITIAL_GRAPH_STATE.toolbarState.showVirtualServices,
      props.showVirtualServices,
      props.toggleGraphVirtualServices
    );
    this.handleURLBool(
      URLParam.GRAPH_BOX_CLUSTER,
      INITIAL_GRAPH_STATE.toolbarState.boxByCluster,
      props.boxByCluster,
      props.toggleBoxByCluster
    );
    this.handleURLBool(
      URLParam.GRAPH_BOX_NAMESPACE,
      INITIAL_GRAPH_STATE.toolbarState.boxByNamespace,
      props.boxByNamespace,
      props.toggleBoxByNamespace
    );
    this.handleURLBool(
      URLParam.GRAPH_COMPRESS_ON_HIDE,
      INITIAL_GRAPH_STATE.toolbarState.compressOnHide,
      props.compressOnHide,
      props.toggleCompressOnHide
    );
    this.handleURLBool(
      URLParam.GRAPH_IDLE_EDGES,
      INITIAL_GRAPH_STATE.toolbarState.showIdleEdges,
      props.showIdleEdges,
      props.toggleIdleEdges
    );
    this.handleURLBool(
      URLParam.GRAPH_IDLE_NODES,
      INITIAL_GRAPH_STATE.toolbarState.showIdleNodes,
      props.showIdleNodes,
      props.toggleIdleNodes
    );
    this.handleURLBool(
      URLParam.GRAPH_OPERATION_NODES,
      INITIAL_GRAPH_STATE.toolbarState.showOperationNodes,
      props.showOperationNodes,
      props.toggleOperationNodes
    );
    this.handleURLBool(
      URLParam.GRAPH_RANK,
      INITIAL_GRAPH_STATE.toolbarState.showRank,
      props.showRank,
      props.toggleRank
    );
    this.handleURLBool(
      URLParam.GRAPH_SERVICE_NODES,
      INITIAL_GRAPH_STATE.toolbarState.showServiceNodes,
      props.showServiceNodes,
      props.toggleServiceNodes
    );
  }

  componentDidUpdate(prev: GraphSettingsProps) {
    // ensure redux state and URL are aligned
    this.alignURLBool(
      URLParam.GRAPH_ANIMATION,
      INITIAL_GRAPH_STATE.toolbarState.showTrafficAnimation,
      prev.showTrafficAnimation,
      this.props.showTrafficAnimation
    );
    this.alignURLBool(
      URLParam.GRAPH_BADGE_SECURITY,
      INITIAL_GRAPH_STATE.toolbarState.showSecurity,
      prev.showSecurity,
      this.props.showSecurity
    );
    this.alignURLBool(
      URLParam.GRAPH_BADGE_SIDECAR,
      INITIAL_GRAPH_STATE.toolbarState.showMissingSidecars,
      prev.showMissingSidecars,
      this.props.showMissingSidecars
    );
    this.alignURLBool(
      URLParam.GRAPH_BADGE_VS,
      INITIAL_GRAPH_STATE.toolbarState.showVirtualServices,
      prev.showVirtualServices,
      this.props.showVirtualServices
    );
    this.alignURLBool(
      URLParam.GRAPH_BOX_CLUSTER,
      INITIAL_GRAPH_STATE.toolbarState.boxByCluster,
      prev.boxByCluster,
      this.props.boxByCluster
    );
    this.alignURLBool(
      URLParam.GRAPH_BOX_NAMESPACE,
      INITIAL_GRAPH_STATE.toolbarState.boxByNamespace,
      prev.boxByNamespace,
      this.props.boxByNamespace
    );
    this.alignURLBool(
      URLParam.GRAPH_COMPRESS_ON_HIDE,
      INITIAL_GRAPH_STATE.toolbarState.compressOnHide,
      prev.compressOnHide,
      this.props.compressOnHide
    );
    this.alignURLBool(
      URLParam.GRAPH_IDLE_EDGES,
      INITIAL_GRAPH_STATE.toolbarState.showIdleEdges,
      prev.showIdleEdges,
      this.props.showIdleEdges
    );
    this.alignURLBool(
      URLParam.GRAPH_IDLE_NODES,
      INITIAL_GRAPH_STATE.toolbarState.showIdleNodes,
      prev.showIdleNodes,
      this.props.showIdleNodes
    );
    this.alignURLBool(
      URLParam.GRAPH_OPERATION_NODES,
      INITIAL_GRAPH_STATE.toolbarState.showOperationNodes,
      prev.showOperationNodes,
      this.props.showOperationNodes
    );
    this.alignURLBool(
      URLParam.GRAPH_RANK,
      INITIAL_GRAPH_STATE.toolbarState.showRank,
      prev.showRank,
      this.props.showRank
    );
    this.alignURLBool(
      URLParam.GRAPH_SERVICE_NODES,
      INITIAL_GRAPH_STATE.toolbarState.showServiceNodes,
      prev.showServiceNodes,
      this.props.showServiceNodes
    );
  }

  private handleURLBool = (param: URLParam, paramDefault: boolean, reduxValue: boolean, reduxToggle: () => void) => {
    const urlValue = HistoryManager.getBooleanParam(param);
    if (urlValue !== undefined) {
      if (urlValue !== reduxValue) {
        reduxToggle();
      }
    } else if (reduxValue !== paramDefault) {
      HistoryManager.setParam(param, String(reduxValue));
    }
  };

  private alignURLBool = (param: URLParam, paramDefault: boolean, prev: boolean, curr: boolean) => {
    if (prev === curr) {
      return;
    }
    if (curr === paramDefault) {
      HistoryManager.deleteParam(param, true);
    } else {
      HistoryManager.setParam(param, String(curr));
    }
  };

  render() {
    return (
      <Dropdown
        toggle={
          <DropdownToggle id="display-settings" isDisabled={this.props.disabled} onToggle={this.onToggle}>
            Display
          </DropdownToggle>
        }
        isOpen={this.state.isOpen}
      >
        {this.getPopoverContent()}
      </Dropdown>
    );
  }

  private onToggle = isOpen => {
    this.setState({
      isOpen
    });
  };

  private getPopoverContent() {
    // map our attributes from redux
    const {
      boxByCluster,
      boxByNamespace,
      compressOnHide,
      edgeLabels,
      showRank: rank,
      rankBy: rankLabels,
      showIdleEdges,
      showIdleNodes,
      showMissingSidecars,
      showOperationNodes,
      showSecurity,
      showServiceNodes,
      showTrafficAnimation,
      showVirtualServices
    } = this.props;

    // map our dispatchers for redux
    const {
      toggleBoxByCluster,
      toggleBoxByNamespace,
      toggleCompressOnHide,
      toggleGraphMissingSidecars,
      toggleGraphSecurity,
      toggleGraphVirtualServices,
      toggleIdleEdges,
      toggleIdleNodes,
      toggleOperationNodes,
      toggleRank,
      toggleServiceNodes,
      toggleTrafficAnimation
    } = this.props;

    const edgeLabelOptions: DisplayOptionType[] = [
      {
        id: EdgeLabelMode.RESPONSE_TIME_GROUP,
        isChecked: edgeLabels.includes(EdgeLabelMode.RESPONSE_TIME_GROUP),
        labelText: _.startCase(EdgeLabelMode.RESPONSE_TIME_GROUP),
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            <div>
              Displays the requested response time. The unit is milliseconds (ms) when less than 1000, otherwise seconds
              (s). Default: 95th Percentile.
            </div>
            <div>
              Response times only apply to request-based traffic (not TCP or gRPC messaging). Additionally, the
              following edges do not offer a response time label but the information is available in the side panel when
              selecting the edge:
            </div>
            <div>- edges into service nodes</div>
            <div>- edges into or out of operation nodes.</div>
          </div>
        )
      },
      {
        id: EdgeLabelMode.THROUGHPUT_GROUP,
        isChecked: edgeLabels.includes(EdgeLabelMode.THROUGHPUT_GROUP),
        labelText: _.startCase(EdgeLabelMode.THROUGHPUT_GROUP),
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            <div>
              Displays the requested HTTP Throughput. The unit is bytes-per-second (bps) when less than 1024, otherwise
              kilobytes-per-second (kps). Default: Request Throughput
            </div>
            <div>
              Throughput applies only to request-based, HTTP traffic. Additionally, the following edges do not offer a
              throughput label:
            </div>
            <div>- edges into service nodes</div>
            <div>- edges into or out of operation nodes.</div>
          </div>
        )
      },
      {
        id: EdgeLabelMode.TRAFFIC_DISTRIBUTION,
        isChecked: edgeLabels.includes(EdgeLabelMode.TRAFFIC_DISTRIBUTION),
        labelText: _.startCase(EdgeLabelMode.TRAFFIC_DISTRIBUTION),
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            HTTP and gRPC Edges display the percentage of traffic for that edge, when less than 100%. For a source node,
            the sum for outbound edges (per protocol) should be equal to or near 100%, given rounding. TCP edges are not
            included in the distribution because their rates reflect bytes.
          </div>
        )
      },
      {
        id: EdgeLabelMode.TRAFFIC_RATE,
        isChecked: edgeLabels.includes(EdgeLabelMode.TRAFFIC_RATE),
        labelText: _.startCase(EdgeLabelMode.TRAFFIC_RATE),
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            HTTP rates are in requests-per-second (rps). gRPC rates may be in requests-per-second (rps) or
            messages-per-second (mps). For request rates, the percentage of error responses is shown below the rate,
            when non-zero. TCP rates are in bytes. The unit is bytes-per-second (bps) when less than 1024, otherwise
            kilobytes-per-second (kps). Rates are rounded to 2 significant digits.
          </div>
        )
      }
    ];

    const throughputOptions: DisplayOptionType[] = [
      {
        id: EdgeLabelMode.THROUGHPUT_REQUEST,
        isChecked: edgeLabels.includes(EdgeLabelMode.THROUGHPUT_REQUEST),
        labelText: 'Request',
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            HTTP request data in bytes-per-second (bps) or kilobytes-per-second (kps)
          </div>
        )
      },
      {
        id: EdgeLabelMode.THROUGHPUT_RESPONSE,
        isChecked: edgeLabels.includes(EdgeLabelMode.THROUGHPUT_RESPONSE),
        labelText: 'Response',
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            HTTP response data in bytes per second (bps) or kilobytes-per-second (kps)
          </div>
        )
      }
    ];

    const responseTimeOptions: DisplayOptionType[] = [
      {
        id: EdgeLabelMode.RESPONSE_TIME_AVERAGE,
        labelText: 'Average',
        isChecked: edgeLabels.includes(EdgeLabelMode.RESPONSE_TIME_AVERAGE),
        tooltip: <div style={{ textAlign: 'left' }}>Average request response time</div>
      },
      {
        id: EdgeLabelMode.RESPONSE_TIME_P50,
        labelText: 'Median',
        isChecked: edgeLabels.includes(EdgeLabelMode.RESPONSE_TIME_P50),
        tooltip: <div style={{ textAlign: 'left' }}>Median request response time (50th Percentile)</div>
      },
      {
        id: EdgeLabelMode.RESPONSE_TIME_P95,
        labelText: '95th Percentile',
        isChecked: edgeLabels.includes(EdgeLabelMode.RESPONSE_TIME_P95),
        tooltip: <div style={{ textAlign: 'left' }}>Max response time for 95% of requests (95th Percentile)</div>
      },
      {
        id: EdgeLabelMode.RESPONSE_TIME_P99,
        labelText: '99th Percentile',
        isChecked: edgeLabels.includes(EdgeLabelMode.RESPONSE_TIME_P99),
        tooltip: <div style={{ textAlign: 'left' }}>Max response time for 99% of requests (99th Percentile)</div>
      }
    ];

    const visibilityOptions: DisplayOptionType[] = [
      {
        id: 'boxByCluster',
        isChecked: boxByCluster,
        labelText: 'Cluster Boxes',
        onChange: toggleBoxByCluster,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            When enabled and there are multiple clusters, the graph will box nodes in the same cluster. The "unknown"
            cluster is never boxed.
          </div>
        )
      },
      {
        id: 'boxByNamespace',
        isChecked: boxByNamespace,
        labelText: 'Namespace Boxes',
        onChange: toggleBoxByNamespace,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            When enabled and there are multiple namespaces, the graph will box nodes in the same namespace, within the
            same cluster. The "unknown" namespace is never boxed.
          </div>
        )
      },
      {
        id: 'filterHide',
        isChecked: compressOnHide,
        labelText: 'Compressed Hide',
        onChange: toggleCompressOnHide,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            Compress the graph after graph-hide removes matching elements. Otherwise the graph maintains the space
            consumed by the hidden elements.
          </div>
        )
      },
      {
        id: 'filterIdleEdges',
        isChecked: showIdleEdges,
        labelText: 'Idle Edges',
        onChange: toggleIdleEdges,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            Idle edges have no request traffic for the time period. Disabled by default to provide cleaner graphs.
            Enable to help detect unexpected traffic omissions, or to confirm expected edges with no traffic (due to
            routing, mirroring, etc).
          </div>
        )
      },
      {
        id: 'filterIdleNodes',
        isChecked: showIdleNodes,
        labelText: 'Idle Nodes',
        onChange: toggleIdleNodes,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            With "Idle Edges" enabled this displays nodes for defined services that have *never* received traffic. With
            "Idle Edges" disabled this displays nodes for defined services that have not received traffic during the
            current time period. Disabled by default to provide cleaner graphs. Enable to help locate unused,
            misconfigured or obsolete services.
          </div>
        )
      },
      {
        id: 'filterOperationNodes',
        isChecked: showOperationNodes,
        isDisabled: this.props.graphType === GraphType.SERVICE,
        labelText: 'Operation Nodes',
        onChange: toggleOperationNodes,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            <div>
              When both operation and service nodes are enabled then the operation is displayed specific to each service
              to which it applies, and therefore may be duplicated for different services. When enabled independently
              each operation will have a single node representing the total traffic for that operation.
            </div>
            <div>- Operations with no traffic are ignored.</div>
            <div>- This is not applicable to Service graphs.</div>
            <div>
              - Operation nodes require additional "Request Classification" Istio configuration for workloads in the
              selected namespaces.
            </div>
          </div>
        )
      },
      {
        id: 'rank',
        isChecked: rank,
        labelText: 'Rank',
        onChange: toggleRank,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            Rank graph nodes based on configurable criteria such as 'number of inbound edges'. These rankings can be
            used in the graph find/hide feature to help highlight the most important workloads, services, and
            applications. Rankings are normalized to fit between 1..100 and nodes may tie with each other in rank.
            Ranking starts at 1 for the top ranked nodes so when ranking nodes based on 'number of inbound edges', the
            node(s) with the most inbound edges would have rank 1. Node(s) with the second most inbound edges would have
            rank 2. Each selected criteria contributes equally to a node's ranking. Although 100 rankings are possible,
            only the required number of rankings are assigned, starting at 1.
          </div>
        )
      },
      {
        id: 'filterServiceNodes',
        isChecked: showServiceNodes,
        isDisabled: this.props.graphType === GraphType.SERVICE,
        labelText: 'Service Nodes',
        onChange: toggleServiceNodes,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            Reflect service routing by injecting the destination service nodes into the graph. This can be useful for
            grouping requests for the same service, but routed to different workloads. Edges leading into service nodes
            are logical aggregations and will not show response time labels, but if selected the side panel will provide
            a response time chart.
          </div>
        )
      },
      {
        id: 'filterTrafficAnimation',
        isChecked: showTrafficAnimation,
        labelText: 'Traffic Animation',
        onChange: toggleTrafficAnimation,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            Animate the graph to reflect traffic flow. The particle density and speed roughly reflects an edge's request
            load relevant to the other edges. Animation can be CPU intensive.
          </div>
        )
      }
    ];

    const badgeOptions: DisplayOptionType[] = [
      {
        id: 'filterSidecars',
        isChecked: showMissingSidecars,
        labelText: 'Missing Sidecars',
        onChange: toggleGraphMissingSidecars
      },
      {
        id: 'filterSecurity',
        isChecked: showSecurity,
        labelText: 'Security',
        onChange: toggleGraphSecurity,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            <div>
              Show closed or open lock icons on edges with traffic that differs from the global mTLS policy. The
              percentage of mTLS traffic can be seen in the side-panel when selecting the edge. Note that the global
              masthead will show a lock icon when global mTLS is enabled. The side-panel will also display source and
              destination principals, if available. mTLS status is not offered for gRPC-message traffic.
            </div>
          </div>
        )
      },
      {
        id: 'filterVS',
        isChecked: showVirtualServices,
        labelText: 'Virtual Services',
        onChange: toggleGraphVirtualServices,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            <div>
              Show virtual service related icons. Additional icons are displayed if a circuit breaker is present on the
              virtual service or if the virtual service was created through one of the Kiali service wizards.
            </div>
          </div>
        )
      }
    ];

    const scoringOptions: DisplayOptionType[] = [
      {
        id: RankMode.RANK_BY_INBOUND_EDGES,
        labelText: 'Inbound Edges',
        isChecked: rankLabels.includes(RankMode.RANK_BY_INBOUND_EDGES),
        onChange: () => {
          this.toggleRankByMode(RankMode.RANK_BY_INBOUND_EDGES);
        }
      },
      {
        id: RankMode.RANK_BY_OUTBOUND_EDGES,
        labelText: 'Outbound Edges',
        isChecked: rankLabels.includes(RankMode.RANK_BY_OUTBOUND_EDGES),
        onChange: () => {
          this.toggleRankByMode(RankMode.RANK_BY_OUTBOUND_EDGES);
        }
      }
    ];

    return (
      <BoundingClientAwareComponent
        className={containerStyle}
        maxHeight={{ type: PropertyType.VIEWPORT_HEIGHT_MINUS_TOP, margin: marginBottom }}
      >
        <div id="graph-display-menu" className={menuStyle} style={{ width: '15em' }}>
          <div style={{ marginTop: '10px' }}>
            <span className={titleStyle} style={{ position: 'relative', bottom: '3px', paddingRight: 0 }}>
              Show Edge Labels
            </span>
            <Tooltip
              key="tooltip_show_edge_labels"
              position={TooltipPosition.right}
              content={
                <div style={{ textAlign: 'left' }}>
                  <div>
                    Values for multiple label selections are stacked in the same order as the options below. Hover or
                    selection will always show units, an additionally show protocol.
                  </div>
                </div>
              }
            >
              <KialiIcon.Info className={infoStyle} />
            </Tooltip>
          </div>
          {edgeLabelOptions.map((edgeLabelOption: DisplayOptionType) => (
            <div key={edgeLabelOption.id} className={menuEntryStyle}>
              <label
                key={edgeLabelOption.id}
                className={!!edgeLabelOption.tooltip ? itemStyleWithInfo : itemStyleWithoutInfo}
              >
                <Checkbox
                  id={edgeLabelOption.id}
                  isChecked={edgeLabelOption.isChecked}
                  isDisabled={this.props.disabled || edgeLabelOption.isDisabled}
                  label={edgeLabelOption.labelText}
                  name="edgeLabelOptions"
                  onChange={this.toggleEdgeLabelMode}
                  value={edgeLabelOption.id}
                />
              </label>
              {!!edgeLabelOption.tooltip && (
                <Tooltip
                  key={`tooltip_${edgeLabelOption.id}`}
                  position={TooltipPosition.right}
                  content={edgeLabelOption.tooltip}
                >
                  <KialiIcon.Info className={infoStyle} />
                </Tooltip>
              )}
              {edgeLabelOption.id === EdgeLabelMode.RESPONSE_TIME_GROUP && responseTimeOptions.some(o => o.isChecked) && (
                <div>
                  {responseTimeOptions.map((rtOption: DisplayOptionType) => (
                    <div key={rtOption.id} className={menuEntryStyle}>
                      <label
                        key={rtOption.id}
                        className={!!rtOption.tooltip ? itemStyleWithInfo : itemStyleWithoutInfo}
                        style={{ paddingLeft: '35px' }}
                      >
                        <Radio
                          id={rtOption.id}
                          isChecked={rtOption.isChecked}
                          isDisabled={this.props.disabled || edgeLabelOption.isDisabled}
                          label={rtOption.labelText}
                          name="rtOptions"
                          onChange={this.toggleEdgeLabelResponseTimeMode}
                          style={{ paddingLeft: '5px' }}
                          value={rtOption.id}
                        />
                      </label>
                      {!!rtOption.tooltip && (
                        <Tooltip
                          key={`tooltip_${rtOption.id}`}
                          position={TooltipPosition.right}
                          content={rtOption.tooltip}
                        >
                          <KialiIcon.Info className={infoStyle} />
                        </Tooltip>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {edgeLabelOption.id === EdgeLabelMode.THROUGHPUT_GROUP && throughputOptions.some(o => o.isChecked) && (
                <div>
                  {throughputOptions.map((throughputOption: DisplayOptionType) => (
                    <div key={throughputOption.id} className={menuEntryStyle}>
                      <label
                        key={throughputOption.id}
                        className={!!throughputOption.tooltip ? itemStyleWithInfo : itemStyleWithoutInfo}
                        style={{ paddingLeft: '35px' }}
                      >
                        <Radio
                          id={throughputOption.id}
                          isChecked={throughputOption.isChecked}
                          isDisabled={this.props.disabled || edgeLabelOption.isDisabled}
                          label={throughputOption.labelText}
                          name="throughputOptions"
                          onChange={this.toggleEdgeLabelThroughputMode}
                          style={{ paddingLeft: '5px' }}
                          value={throughputOption.id}
                        />
                      </label>
                      {!!throughputOption.tooltip && (
                        <Tooltip
                          key={`tooltip_${throughputOption.id}`}
                          position={TooltipPosition.right}
                          content={throughputOption.tooltip}
                        >
                          <KialiIcon.Info className={infoStyle} />
                        </Tooltip>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className={titleStyle}>Show</div>
          {visibilityOptions.map((item: DisplayOptionType) => (
            <div key={item.id} style={{ display: 'inline-block' }}>
              <label key={item.id} className={!!item.tooltip ? itemStyleWithInfo : itemStyleWithoutInfo}>
                <Checkbox
                  id={item.id}
                  isChecked={item.isChecked}
                  isDisabled={this.props.disabled || item.isDisabled}
                  label={item.labelText}
                  onChange={item.onChange}
                />
              </label>
              {!!item.tooltip && (
                <Tooltip key={`tooltip_${item.id}`} position={TooltipPosition.right} content={item.tooltip}>
                  <KialiIcon.Info className={infoStyle} />
                </Tooltip>
              )}
              {item.id === 'rank' && rank && (
                <div>
                  {scoringOptions.map((scoringOption: DisplayOptionType) => (
                    <div key={scoringOption.id} className={menuEntryStyle}>
                      <label
                        key={scoringOption.id}
                        className={!!scoringOption.tooltip ? itemStyleWithInfo : itemStyleWithoutInfo}
                        style={{ paddingLeft: '35px' }}
                      >
                        <Checkbox
                          id={scoringOption.id}
                          isChecked={scoringOption.isChecked}
                          isDisabled={this.props.disabled || item.isDisabled}
                          label={scoringOption.labelText}
                          name="scoringOptions"
                          onChange={scoringOption.onChange}
                          style={{ paddingLeft: '5px' }}
                          value={scoringOption.id}
                        />
                      </label>
                      {!!scoringOption.tooltip && (
                        <Tooltip
                          key={`tooltip_${scoringOption.id}`}
                          position={TooltipPosition.right}
                          content={scoringOption.tooltip}
                        >
                          <KialiIcon.Info className={infoStyle} />
                        </Tooltip>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className={titleStyle}>Show Badges</div>
          {badgeOptions.map((item: DisplayOptionType) => (
            <div key={item.id} style={{ display: 'inline-block' }}>
              <label key={item.id} className={!!item.tooltip ? itemStyleWithInfo : itemStyleWithoutInfo}>
                <Checkbox
                  id={item.id}
                  isChecked={item.isChecked}
                  isDisabled={this.props.disabled || item.isDisabled}
                  label={item.labelText}
                  onChange={item.onChange}
                />
              </label>
              {!!item.tooltip && (
                <Tooltip key={`tooltip_${item.id}`} position={TooltipPosition.right} content={item.tooltip}>
                  <KialiIcon.Info className={infoStyle} />
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      </BoundingClientAwareComponent>
    );
  }

  private toggleEdgeLabelMode = (_, event) => {
    const mode = event.target.value as EdgeLabelMode;
    if (this.props.edgeLabels.includes(mode)) {
      let newEdgeLabels;
      switch (mode) {
        case EdgeLabelMode.RESPONSE_TIME_GROUP:
          newEdgeLabels = this.props.edgeLabels.filter(l => !isResponseTimeMode(l));
          break;
        case EdgeLabelMode.THROUGHPUT_GROUP:
          newEdgeLabels = this.props.edgeLabels.filter(l => !isThroughputMode(l));
          break;
        default:
          newEdgeLabels = this.props.edgeLabels.filter(l => l !== mode);
      }
      this.props.setEdgeLabels(newEdgeLabels);
    } else {
      switch (mode) {
        case EdgeLabelMode.RESPONSE_TIME_GROUP:
          this.props.setEdgeLabels([...this.props.edgeLabels, mode, EdgeLabelMode.RESPONSE_TIME_P95]);
          break;
        case EdgeLabelMode.THROUGHPUT_GROUP:
          this.props.setEdgeLabels([...this.props.edgeLabels, mode, EdgeLabelMode.THROUGHPUT_REQUEST]);
          break;
        default:
          this.props.setEdgeLabels([...this.props.edgeLabels, mode]);
      }
    }
  };

  private toggleEdgeLabelResponseTimeMode = (_, event) => {
    const mode = event.target.value as EdgeLabelMode;
    const newEdgeLabels = this.props.edgeLabels.filter(l => !isResponseTimeMode(l));
    this.props.setEdgeLabels([...newEdgeLabels, EdgeLabelMode.RESPONSE_TIME_GROUP, mode]);
  };

  private toggleEdgeLabelThroughputMode = (_, event) => {
    const mode = event.target.value as EdgeLabelMode;
    const newEdgeLabels = this.props.edgeLabels.filter(l => !isThroughputMode(l));
    this.props.setEdgeLabels([...newEdgeLabels, EdgeLabelMode.THROUGHPUT_GROUP, mode]);
  };

  private toggleRankByMode = (mode: RankMode) => {
    if (this.props.rankBy.includes(mode)) {
      this.props.setRankBy(this.props.rankBy.filter(r => r !== mode));
    } else {
      this.props.setRankBy([...this.props.rankBy, mode]);
    }
  };
}

// Allow Redux to map sections of our global app state to our props
const mapStateToProps = (state: KialiAppState) => ({
  boxByCluster: state.graph.toolbarState.boxByCluster,
  boxByNamespace: state.graph.toolbarState.boxByNamespace,
  compressOnHide: state.graph.toolbarState.compressOnHide,
  edgeLabels: edgeLabelsSelector(state),
  showIdleEdges: state.graph.toolbarState.showIdleEdges,
  showIdleNodes: state.graph.toolbarState.showIdleNodes,
  showMissingSidecars: state.graph.toolbarState.showMissingSidecars,
  showOperationNodes: state.graph.toolbarState.showOperationNodes,
  rankBy: state.graph.toolbarState.rankBy,
  showRank: state.graph.toolbarState.showRank,
  showSecurity: state.graph.toolbarState.showSecurity,
  showServiceNodes: state.graph.toolbarState.showServiceNodes,
  showTrafficAnimation: state.graph.toolbarState.showTrafficAnimation,
  showVirtualServices: state.graph.toolbarState.showVirtualServices
});

// Map our actions to Redux
const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    setEdgeLabels: bindActionCreators(GraphToolbarActions.setEdgeLabels, dispatch),
    setRankBy: bindActionCreators(GraphToolbarActions.setRankBy, dispatch),
    toggleBoxByCluster: bindActionCreators(GraphToolbarActions.toggleBoxByCluster, dispatch),
    toggleBoxByNamespace: bindActionCreators(GraphToolbarActions.toggleBoxByNamespace, dispatch),
    toggleCompressOnHide: bindActionCreators(GraphToolbarActions.toggleCompressOnHide, dispatch),
    toggleGraphMissingSidecars: bindActionCreators(GraphToolbarActions.toggleGraphMissingSidecars, dispatch),
    toggleGraphSecurity: bindActionCreators(GraphToolbarActions.toggleGraphSecurity, dispatch),
    toggleGraphVirtualServices: bindActionCreators(GraphToolbarActions.toggleGraphVirtualServices, dispatch),
    toggleIdleEdges: bindActionCreators(GraphToolbarActions.toggleIdleEdges, dispatch),
    toggleIdleNodes: bindActionCreators(GraphToolbarActions.toggleIdleNodes, dispatch),
    toggleOperationNodes: bindActionCreators(GraphToolbarActions.toggleOperationNodes, dispatch),
    toggleRank: bindActionCreators(GraphToolbarActions.toggleRank, dispatch),
    toggleServiceNodes: bindActionCreators(GraphToolbarActions.toggleServiceNodes, dispatch),
    toggleTrafficAnimation: bindActionCreators(GraphToolbarActions.toggleTrafficAnimation, dispatch)
  };
};

// hook up to Redux for our State to be mapped to props
const GraphSettingsContainer = connect(mapStateToProps, mapDispatchToProps)(GraphSettings);
export default GraphSettingsContainer;
