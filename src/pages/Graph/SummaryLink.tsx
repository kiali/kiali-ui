import * as React from 'react';
import { NodeType, GraphNodeData, DestService, BoxByType } from '../../types/Graph';
import { CyNode, decoratedNodeData } from '../../components/CytoscapeGraph/CytoscapeGraphUtils';
import { KialiIcon } from 'config/KialiIcon';
import { Badge, PopoverPosition } from '@patternfly/react-core';
import { Health } from 'types/Health';
import { HealthIndicator, DisplayMode } from 'components/Health/HealthIndicator';
import { pfAdHocBadge, pfBadge, PFBadges } from 'components/Pf/PfBadges';
import KialiPageLink from 'components/Link/KialiPageLink';

const getBadge = (nodeData: GraphNodeData, nodeType?: NodeType) => {
  switch (nodeType || nodeData.nodeType) {
    case NodeType.AGGREGATE:
      return pfAdHocBadge(PFBadges.Operation.badge, `Operation: ${nodeData.aggregate!}`);
    case NodeType.APP:
      return pfBadge(PFBadges.App);
    case NodeType.BOX:
      switch (nodeData.isBox) {
        case BoxByType.APP:
          return pfBadge(PFBadges.App);
        case BoxByType.CLUSTER:
          return pfBadge(PFBadges.Cluster);
        case BoxByType.NAMESPACE:
          return pfBadge(PFBadges.Namespace);
        default:
          return pfBadge(PFBadges.Unknown);
      }
    case NodeType.SERVICE:
      return !!nodeData.isServiceEntry
        ? pfAdHocBadge(
            PFBadges.ServiceEntry.badge,
            nodeData.isServiceEntry.location === 'MESH_EXTERNAL' ? 'External Service Entry' : 'Internal Service Entry'
          )
        : pfBadge(PFBadges.Service);
    case NodeType.WORKLOAD:
      return pfBadge(PFBadges.Workload);
    default:
      return pfBadge(PFBadges.Unknown);
  }
};

const getLink = (nodeData: GraphNodeData, nodeType?: NodeType) => {
  const { app, cluster, namespace, service, workload } = nodeData;
  if (!nodeType || nodeData.nodeType === NodeType.UNKNOWN) {
    nodeType = nodeData.nodeType;
  }
  let displayName: string = 'unknown';
  let link: string | undefined;
  let key: string | undefined;

  switch (nodeType) {
    case NodeType.AGGREGATE:
      displayName = nodeData.aggregateValue!;
      break;
    case NodeType.APP:
      link = `/namespaces/${encodeURIComponent(namespace)}/applications/${encodeURIComponent(app!)}`;
      key = `${namespace}.app.${app}`;
      displayName = app!;
      break;
    case NodeType.BOX:
      switch (nodeData.isBox) {
        case BoxByType.APP:
          link = `/namespaces/${encodeURIComponent(namespace)}/applications/${encodeURIComponent(app!)}`;
          key = `${namespace}.app.${app}`;
          displayName = app!;
          break;
        case BoxByType.CLUSTER:
          displayName = cluster;
          break;
        case BoxByType.NAMESPACE:
          displayName = namespace;
          break;
      }
      break;
    case NodeType.SERVICE:
      if (nodeData.isServiceEntry) {
        link = `/namespaces/${encodeURIComponent(namespace)}/istio/serviceentries/${encodeURIComponent(service!)}`;
      } else {
        link = `/namespaces/${encodeURIComponent(namespace)}/services/${encodeURIComponent(service!)}`;
      }
      key = `${namespace}.svc.${service}`;
      displayName = service!;
      break;
    case NodeType.WORKLOAD:
      link = `/namespaces/${encodeURIComponent(namespace)}/workloads/${encodeURIComponent(workload!)}`;
      key = `${namespace}.wl.${workload}`;
      displayName = workload!;
      break;
    default:
      // NOOP
      break;
  }

  if (link && !nodeData.isInaccessible) {
    return (
      <KialiPageLink key={key} href={link} cluster={cluster}>
        {displayName}
      </KialiPageLink>
    );
  }

  return <span key={key}>{displayName}</span>;
};

export const renderBadgedHost = (host: string) => {
  return (
    <span>
      {pfBadge(PFBadges.Host)}
      {host}
    </span>
  );
};

export const renderBadgedLink = (nodeData: GraphNodeData, nodeType?: NodeType, label?: string) => {
  const link = getLink(nodeData, nodeType);

  return (
    <>
      <span style={{ marginRight: '1em', marginBottom: '3px', display: 'inline-block' }}>
        {label && (
          <span style={{ whiteSpace: 'pre' }}>
            <b>{label}</b>
          </span>
        )}
        {getBadge(nodeData, nodeType)}
        {link}
      </span>
      {nodeData.isInaccessible && <KialiIcon.MtlsLock />}
    </>
  );
};

export const renderHealth = (health?: Health) => {
  return (
    <>
      <Badge style={{ fontWeight: 'normal', marginTop: '4px', marginBottom: '4px' }} isRead={true}>
        <span style={{ margin: '3px 3px 1px 0' }}>
          {health ? (
            <HealthIndicator
              id="graph-health-indicator"
              mode={DisplayMode.SMALL}
              health={health}
              tooltipPlacement={PopoverPosition.left}
            />
          ) : (
            'n/a'
          )}
        </span>
        health
      </Badge>
    </>
  );
};

export const renderDestServicesLinks = (node: any) => {
  const nodeData = decoratedNodeData(node);
  const destServices: DestService[] = node.data(CyNode.destServices);

  const links: any[] = [];
  if (!destServices) {
    return links;
  }

  destServices.forEach(ds => {
    const serviceNodeData: GraphNodeData = {
      id: nodeData.id,
      app: '',
      cluster: ds.cluster,
      isInaccessible: nodeData.isInaccessible,
      isOutside: nodeData.isOutside,
      isRoot: nodeData.isRoot,
      isServiceEntry: nodeData.isServiceEntry,
      namespace: ds.namespace,
      nodeType: NodeType.SERVICE,
      service: ds.name,
      version: '',
      workload: ''
    };
    links.push(renderBadgedLink(serviceNodeData));
  });

  return links;
};
