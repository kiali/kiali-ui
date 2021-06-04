import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { TooltipProps } from '@patternfly/react-core/dist/js/components/Tooltip/Tooltip';

export function IconTooltip(props: TooltipProps) {
  const { children, ...rest } = props;
  return (
    <Tooltip {...rest}>
      <span>{children}</span>
    </Tooltip>
  );
}
