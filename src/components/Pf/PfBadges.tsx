import { Badge, Tooltip, TooltipPosition } from '@patternfly/react-core';
import React, { CSSProperties } from 'react';
import { style } from 'typestyle';
import { PFColors } from './PfColors';

export type PFBadge = {
  badge: string;
  tt: string;
};

// PF Badges used by Kiali, keep alphabetized
// avoid duplicate badge letters, especially if they may appear on the same page
export const PFBadges = Object.freeze({
  App: { badge: 'A', tt: 'Application' } as PFBadge,
  Adapter: { badge: 'A', tt: 'Adapter' } as PFBadge,
  AttributeManifest: { badge: 'AM', tt: 'Attribute Manifest' } as PFBadge,
  AuthorizationPolicy: { badge: 'AP', tt: 'Authorization Policy' } as PFBadge,
  Cluster: { badge: 'CL', tt: 'Cluster' } as PFBadge,
  ClusterRBACConfig: { badge: 'CRC', tt: 'Cluster RBAC Configuration' } as PFBadge,
  Container: { badge: 'C', tt: 'Container' } as PFBadge,
  DestinationRule: { badge: 'DR', tt: 'Destination Rule' } as PFBadge,
  EnvoyFilter: { badge: 'EF', tt: 'Envoy Filter' } as PFBadge,
  Gateway: { badge: 'G', tt: 'Gateway' } as PFBadge,
  Handler: { badge: 'H', tt: 'Handler' },
  Host: { badge: 'H', tt: 'Host' },
  Instance: { badge: 'I', tt: 'Instance' },
  Iter8: { badge: 'IT8', tt: 'Iter8 Experiment' },
  MeshPolicy: { badge: 'MP', tt: 'Mesh Policy' } as PFBadge,
  Namespace: { badge: 'NS', tt: 'Namespace' } as PFBadge,
  Operation: { badge: 'O', tt: 'Operation' } as PFBadge,
  PeerAuthentication: { badge: 'PA', tt: 'Peer Authentication' } as PFBadge,
  Pod: { badge: 'P', tt: 'Pod' } as PFBadge,
  Policy: { badge: 'P', tt: 'Policy' } as PFBadge,
  RBACConfig: { badge: 'RC', tt: 'RBAC Configuration' } as PFBadge,
  RequestAuthentication: { badge: 'RA', tt: 'Request Authentication' } as PFBadge,
  Rule: { badge: 'R', tt: 'Rule' } as PFBadge,
  Service: { badge: 'S', tt: 'Service' } as PFBadge,
  ServiceEntry: { badge: 'SE', tt: 'Service Entry' } as PFBadge,
  ServiceRole: { badge: 'SR', tt: 'Service Role' } as PFBadge,
  ServiceRoleBinding: { badge: 'SRB', tt: 'Service Role Binding' } as PFBadge,
  Sidecar: { badge: 'SC', tt: 'Istio Sidecar Proxy' } as PFBadge,
  Template: { badge: 'T', tt: 'Template' } as PFBadge,
  Unknown: { badge: 'U', tt: 'Unknown' } as PFBadge,
  VirtualService: { badge: 'VS', tt: 'Virtual Service' } as PFBadge,
  Workload: { badge: 'W', tt: 'Workload' } as PFBadge,
  WorkloadEntry: { badge: 'WE', tt: 'Workload Entry' } as PFBadge
});

export const kialiBadge = style({
  backgroundColor: PFColors.Blue200,
  borderRadius: '30em',
  marginRight: '10px'
});

export const pfBadge = (
  badge: PFBadge,
  position?: TooltipPosition,
  key?: string,
  style?: CSSProperties
): React.ReactFragment => {
  return (
    <Tooltip
      key={key || `pfbadge-${badge.badge}`}
      position={position || TooltipPosition.auto}
      content={<>{badge.tt}</>}
    >
      <Badge className={kialiBadge} style={style}>
        {badge.badge}
      </Badge>
    </Tooltip>
  );
};

export const pfAdHocBadge = (
  badge: string,
  tooltip?: string,
  position?: TooltipPosition,
  key?: string,
  style?: CSSProperties,
  isRead?: boolean
): React.ReactFragment => {
  const badgeElem = (
    <Badge className={kialiBadge} style={style} isRead={!!isRead}>
      {badge}
    </Badge>
  );
  return tooltip ? (
    <Tooltip key={key || `pfbadge-${badge}`} position={position || TooltipPosition.auto} content={<>{tooltip}</>}>
      {badgeElem}
    </Tooltip>
  ) : (
    badgeElem
  );
};

// convenience method: same as pfAdHocBadge with ReadOnly styling
export const pfAdHocBadgeRO = (
  badge: string,
  tooltip?: string,
  position?: TooltipPosition,
  key?: string,
  style?: CSSProperties
): React.ReactFragment => {
  return pfAdHocBadge(badge, tooltip, position, key, style, true);
};
