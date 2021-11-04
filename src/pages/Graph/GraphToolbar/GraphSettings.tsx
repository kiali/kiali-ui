import { Radio, Dropdown, DropdownToggle, Checkbox, Tooltip, TooltipPosition } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import {
  boxByClusterToggled,
  boxByNamespaceToggled,
  compressOnHideToggled,
  showMissingSidecarsToggled,
  setEdgeLabels as setEdgeLabelsAction,
  showIdleEdgesToggled,
  operationNodesToggled,
  showServiceNodesToggled,
  trafficAnimationToggled,
  showSecurityToggled,
  showVirtualServicesToggled,
  showIdleNodesToggled,
  INITIAL_GRAPH_STATE
} from './graphSettingsSlice';
import { useSelector, useDispatch } from 'react-redux';
import { HistoryManager, URLParam } from '../../../app/History';
import { KialiAppState } from '../../../store/Store';
import { GraphType, EdgeLabelMode, isResponseTimeMode, isThroughputMode } from '../../../types/Graph';
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

interface DisplayOptionType {
  id: string;
  disabled?: boolean;
  labelText: string;
  isChecked: boolean;
  onChange?: () => void;
  tooltip?: React.ReactNode;
}

interface GraphSettingsProps {
  graphType: GraphType;
}

const marginBottom = 20;

const handleURLBool = (param: URLParam, paramDefault: boolean, reduxValue: boolean, reduxToggle: () => void) => {
  const urlValue = HistoryManager.getBooleanParam(param);
  if (urlValue !== undefined) {
    if (urlValue !== reduxValue) {
      reduxToggle();
    }
  } else if (reduxValue !== paramDefault) {
    HistoryManager.setParam(param, String(reduxValue));
  }
};

const alignURLBool = (param: URLParam, paramDefault: boolean, curr: boolean) => {
  const currentURLParam = HistoryManager.getParam(param);
  if (currentURLParam !== undefined && Boolean(currentURLParam) === curr) {
    return;
  }

  if (curr === paramDefault) {
    HistoryManager.deleteParam(param, true);
  } else {
    HistoryManager.setParam(param, String(curr));
  }
};

const GraphSettings = ({ graphType }: GraphSettingsProps) => {
  const {
    boxByCluster,
    boxByNamespace,
    compressOnHide,
    showIdleEdges,
    showIdleNodes,
    showMissingSidecars,
    showOperationNodes,
    showSecurity,
    showServiceNodes,
    showTrafficAnimation,
    showVirtualServices
  } = useSelector((state: KialiAppState) => state.graph.toolbar);
  const edgeLabels = useSelector(edgeLabelsSelector);

  const dispatch = useDispatch();
  const toggleBoxByCluster = () => {
    dispatch(boxByClusterToggled());
  };
  const toggleBoxByNamespace = () => {
    dispatch(boxByNamespaceToggled());
  };
  const toggleCompressOnHide = () => {
    dispatch(compressOnHideToggled());
  };
  const toggleGraphMissingSidecars = () => {
    dispatch(showMissingSidecarsToggled());
  };
  const setEdgeLabels = (edgeLabels: EdgeLabelMode[]) => {
    dispatch(setEdgeLabelsAction(edgeLabels));
  };
  const toggleIdleEdges = () => {
    dispatch(showIdleEdgesToggled());
  };
  const toggleIdleNodes = () => {
    dispatch(showIdleNodesToggled());
  };
  const toggleOperationNodes = () => {
    dispatch(operationNodesToggled());
  };
  const toggleServiceNodes = () => {
    dispatch(showServiceNodesToggled());
  };
  const toggleTrafficAnimation = () => {
    dispatch(trafficAnimationToggled());
  };
  const toggleGraphSecurity = () => {
    dispatch(showSecurityToggled());
  };
  const toggleGraphVirtualServices = () => {
    dispatch(showVirtualServicesToggled());
  };

  const [isOpen, setIsOpen] = useState(false);

  // Let URL override current redux state at construction time. Update URL as needed.
  handleURLBool(
    URLParam.GRAPH_ANIMATION,
    INITIAL_GRAPH_STATE.toolbar.showTrafficAnimation,
    showTrafficAnimation,
    toggleTrafficAnimation
  );
  handleURLBool(
    URLParam.GRAPH_BADGE_SECURITY,
    INITIAL_GRAPH_STATE.toolbar.showSecurity,
    showSecurity,
    toggleGraphSecurity
  );
  handleURLBool(
    URLParam.GRAPH_BADGE_SIDECAR,
    INITIAL_GRAPH_STATE.toolbar.showMissingSidecars,
    showMissingSidecars,
    toggleGraphMissingSidecars
  );
  handleURLBool(
    URLParam.GRAPH_BADGE_VS,
    INITIAL_GRAPH_STATE.toolbar.showVirtualServices,
    showVirtualServices,
    toggleGraphVirtualServices
  );
  handleURLBool(URLParam.GRAPH_BOX_CLUSTER, INITIAL_GRAPH_STATE.toolbar.boxByCluster, boxByCluster, toggleBoxByCluster);
  handleURLBool(
    URLParam.GRAPH_BOX_NAMESPACE,
    INITIAL_GRAPH_STATE.toolbar.boxByNamespace,
    boxByNamespace,
    toggleBoxByNamespace
  );
  handleURLBool(
    URLParam.GRAPH_COMPRESS_ON_HIDE,
    INITIAL_GRAPH_STATE.toolbar.compressOnHide,
    compressOnHide,
    toggleCompressOnHide
  );
  handleURLBool(URLParam.GRAPH_IDLE_EDGES, INITIAL_GRAPH_STATE.toolbar.showIdleEdges, showIdleEdges, toggleIdleEdges);
  handleURLBool(URLParam.GRAPH_IDLE_NODES, INITIAL_GRAPH_STATE.toolbar.showIdleNodes, showIdleNodes, toggleIdleNodes);
  handleURLBool(
    URLParam.GRAPH_OPERATION_NODES,
    INITIAL_GRAPH_STATE.toolbar.showOperationNodes,
    showOperationNodes,
    toggleOperationNodes
  );
  handleURLBool(
    URLParam.GRAPH_SERVICE_NODES,
    INITIAL_GRAPH_STATE.toolbar.showServiceNodes,
    showServiceNodes,
    toggleServiceNodes
  );

  useEffect(() => {
    // ensure redux state and URL are aligned
    alignURLBool(URLParam.GRAPH_ANIMATION, INITIAL_GRAPH_STATE.toolbar.showTrafficAnimation, showTrafficAnimation);
    alignURLBool(URLParam.GRAPH_BADGE_SECURITY, INITIAL_GRAPH_STATE.toolbar.showSecurity, showSecurity);
    alignURLBool(URLParam.GRAPH_BADGE_SIDECAR, INITIAL_GRAPH_STATE.toolbar.showMissingSidecars, showMissingSidecars);
    alignURLBool(URLParam.GRAPH_BADGE_VS, INITIAL_GRAPH_STATE.toolbar.showVirtualServices, showVirtualServices);
    alignURLBool(URLParam.GRAPH_BOX_CLUSTER, INITIAL_GRAPH_STATE.toolbar.boxByCluster, boxByCluster);
    alignURLBool(URLParam.GRAPH_BOX_NAMESPACE, INITIAL_GRAPH_STATE.toolbar.boxByNamespace, boxByNamespace);
    alignURLBool(URLParam.GRAPH_COMPRESS_ON_HIDE, INITIAL_GRAPH_STATE.toolbar.compressOnHide, compressOnHide);
    alignURLBool(URLParam.GRAPH_IDLE_EDGES, INITIAL_GRAPH_STATE.toolbar.showIdleEdges, showIdleEdges);
    alignURLBool(URLParam.GRAPH_IDLE_NODES, INITIAL_GRAPH_STATE.toolbar.showIdleNodes, showIdleNodes);
    alignURLBool(URLParam.GRAPH_OPERATION_NODES, INITIAL_GRAPH_STATE.toolbar.showOperationNodes, showOperationNodes);
    alignURLBool(URLParam.GRAPH_SERVICE_NODES, INITIAL_GRAPH_STATE.toolbar.showServiceNodes, showServiceNodes);
  });

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const toggleEdgeLabelMode = (_, event) => {
    const mode = event.target.value as EdgeLabelMode;
    if (edgeLabels.includes(mode)) {
      let newEdgeLabels;
      switch (mode) {
        case EdgeLabelMode.RESPONSE_TIME_GROUP:
          newEdgeLabels = edgeLabels.filter(l => !isResponseTimeMode(l));
          break;
        case EdgeLabelMode.THROUGHPUT_GROUP:
          newEdgeLabels = edgeLabels.filter(l => !isThroughputMode(l));
          break;
        default:
          newEdgeLabels = edgeLabels.filter(l => l !== mode);
      }
      setEdgeLabels(newEdgeLabels);
    } else {
      switch (mode) {
        case EdgeLabelMode.RESPONSE_TIME_GROUP:
          setEdgeLabels([...edgeLabels, mode, EdgeLabelMode.RESPONSE_TIME_P95]);
          break;
        case EdgeLabelMode.THROUGHPUT_GROUP:
          setEdgeLabels([...edgeLabels, mode, EdgeLabelMode.THROUGHPUT_REQUEST]);
          break;
        default:
          setEdgeLabels([...edgeLabels, mode]);
      }
    }
  };

  const toggleEdgeLabelResponseTimeMode = (_, event) => {
    const mode = event.target.value as EdgeLabelMode;
    const newEdgeLabels = edgeLabels.filter(l => !isResponseTimeMode(l));
    setEdgeLabels([...newEdgeLabels, EdgeLabelMode.RESPONSE_TIME_GROUP, mode]);
  };

  const toggleEdgeLabelThroughputMode = (_, event) => {
    const mode = event.target.value as EdgeLabelMode;
    const newEdgeLabels = edgeLabels.filter(l => !isThroughputMode(l));
    setEdgeLabels([...newEdgeLabels, EdgeLabelMode.THROUGHPUT_GROUP, mode]);
  };

  const getPopoverContent = () => {
    const edgeLabelOptions: DisplayOptionType[] = [
      {
        id: EdgeLabelMode.RESPONSE_TIME_GROUP,
        labelText: _.startCase(EdgeLabelMode.RESPONSE_TIME_GROUP),
        isChecked: edgeLabels.includes(EdgeLabelMode.RESPONSE_TIME_GROUP),
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
        labelText: _.startCase(EdgeLabelMode.THROUGHPUT_GROUP),
        isChecked: edgeLabels.includes(EdgeLabelMode.THROUGHPUT_GROUP),
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
        labelText: _.startCase(EdgeLabelMode.TRAFFIC_DISTRIBUTION),
        isChecked: edgeLabels.includes(EdgeLabelMode.TRAFFIC_DISTRIBUTION),
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
        labelText: _.startCase(EdgeLabelMode.TRAFFIC_RATE),
        isChecked: edgeLabels.includes(EdgeLabelMode.TRAFFIC_RATE),
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
        labelText: 'Request',
        isChecked: edgeLabels.includes(EdgeLabelMode.THROUGHPUT_REQUEST),
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            HTTP request data in bytes-per-second (bps) or kilobytes-per-second (kps)
          </div>
        )
      },
      {
        id: EdgeLabelMode.THROUGHPUT_RESPONSE,
        labelText: 'Response',
        isChecked: edgeLabels.includes(EdgeLabelMode.THROUGHPUT_RESPONSE),
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
        labelText: 'Cluster Boxes',
        isChecked: boxByCluster,
        onChange: toggleBoxByCluster,
        tooltip: <div style={{ textAlign: 'left' }}>When enabled the graph will box nodes in the same cluster.</div>
      },
      {
        id: 'boxByNamespace',
        labelText: 'Namespace Boxes',
        isChecked: boxByNamespace,
        onChange: toggleBoxByNamespace,
        tooltip: (
          <div style={{ textAlign: 'left' }}>
            When enabled the graph will box nodes in the same namespace, within the same cluster.
          </div>
        )
      },
      {
        id: 'filterHide',
        labelText: 'Compressed Hide',
        isChecked: compressOnHide,
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
        labelText: 'Idle Edges',
        isChecked: showIdleEdges,
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
        labelText: 'Idle Nodes',
        isChecked: showIdleNodes,
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
        disabled: graphType === GraphType.SERVICE,
        labelText: 'Operation Nodes',
        isChecked: showOperationNodes,
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
        id: 'filterServiceNodes',
        disabled: graphType === GraphType.SERVICE,
        labelText: 'Service Nodes',
        isChecked: showServiceNodes,
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
        labelText: 'Traffic Animation',
        isChecked: showTrafficAnimation,
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
        labelText: 'Missing Sidecars',
        isChecked: showMissingSidecars,
        onChange: toggleGraphMissingSidecars
      },
      {
        id: 'filterSecurity',
        labelText: 'Security',
        isChecked: showSecurity,
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
        labelText: 'Virtual Services',
        isChecked: showVirtualServices,
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
                  name="edgeLabelOptions"
                  isChecked={edgeLabelOption.isChecked}
                  label={edgeLabelOption.labelText}
                  onChange={toggleEdgeLabelMode}
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
                          style={{ paddingLeft: '5px' }}
                          name="rtOptions"
                          isChecked={rtOption.isChecked}
                          label={rtOption.labelText}
                          onChange={toggleEdgeLabelResponseTimeMode}
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
                          style={{ paddingLeft: '5px' }}
                          name="throughputOptions"
                          isChecked={throughputOption.isChecked}
                          label={throughputOption.labelText}
                          onChange={toggleEdgeLabelThroughputMode}
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
                  label={item.labelText}
                  onChange={item.onChange}
                  isDisabled={item.disabled}
                />
              </label>
              {!!item.tooltip && (
                <Tooltip key={`tooltip_${item.id}`} position={TooltipPosition.right} content={item.tooltip}>
                  <KialiIcon.Info className={infoStyle} />
                </Tooltip>
              )}
            </div>
          ))}
          <div className={titleStyle}>Show Badges</div>
          {badgeOptions.map((item: DisplayOptionType) => (
            <div key={item.id} style={{ display: 'inline-block' }}>
              <label key={item.id} className={!!item.tooltip ? itemStyleWithInfo : itemStyleWithoutInfo}>
                <Checkbox id={item.id} isChecked={item.isChecked} label={item.labelText} onChange={item.onChange} />
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
  };

  return (
    <Dropdown
      toggle={
        <DropdownToggle id="display-settings" onToggle={onToggle}>
          Display
        </DropdownToggle>
      }
      isOpen={isOpen}
    >
      {getPopoverContent()}
    </Dropdown>
  );
};

export default GraphSettings;
