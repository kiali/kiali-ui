import * as React from 'react';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { KialiIcon } from '../../config/KialiIcon';
import { style } from 'typestyle';

const infoStyle = style({
  margin: '0px 0px 2px 10px',
  verticalAlign: '-5px !important'
});

export const wizardTooltip = (tooltipContent: React.ReactFragment) => {
  return (
    <Tooltip position={TooltipPosition.right} content={<div style={{ textAlign: 'left' }}>{tooltipContent}</div>}>
      <KialiIcon.Info className={infoStyle} />
    </Tooltip>
  );
};

export const CONNECTION_POOL_TOOLTIP = (
  <>
    Connection Pool tooltip
    <div>Another paragraph</div>
  </>
);

export const GATEWAY_TOOLTIP = (
  <>
    Gateway tooltip
    <div>Another paragraph</div>
  </>
);

export const HTTP_ABORT_TOOLTIP = (
  <>
    Http Abort tooltip
    <div>Another paragraph</div>
  </>
);

export const HTTP_DELAY_TOOLTIP = (
  <>
    Http Delay tooltip
    <div>Another paragraph</div>
  </>
);

export const HTTP_RETRY_TOOLTIP = (
  <>
    HTTP Retru tooltip
    <div>Another paragraph</div>
  </>
);

export const HTTP_TIMEOUT_TOOLTIP = (
  <>
    Http Timeout tooltip
    <div>Another paragraph</div>
  </>
);

export const LOAD_BALANCER_TOOLTIP = (
  <>
    Load Balancer tooltip
    <div>Another paragraph</div>
  </>
);

export const MATCHING_SELECTED_TOOLTIP = (
  <>
    Matching selected tooltip
    <div>Another paragraph</div>
  </>
);

export const OUTLIER_DETECTION_TOOLTIP = (
  <>
    Connection Pool tooltip
    <div>Another paragraph</div>
  </>
);

export const PEER_AUTHENTICATION_TOOLTIP = (
  <>
    Peer Authentication tooltip
    <div>Another paragraph</div>
  </>
);

export const ROUTE_RULES_TOOLTIP = (
  <>
    Route rules tooltip
    <div>Another paragraph</div>
  </>
);
