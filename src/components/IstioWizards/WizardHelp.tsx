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

export const RULE_BUILDER_TOOLTIP = (
  <>
    Rule builder tooltip
    <div>Another paragraph</div>
  </>
);

export const RULES_DEFINED_TOOLTIP = (
  <>
    Rules defined tooltip
    <div>Another paragraph</div>
  </>
);
