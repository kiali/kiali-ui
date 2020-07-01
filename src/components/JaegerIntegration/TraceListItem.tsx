import * as React from 'react';
import { style } from 'typestyle';
import { Text, TextVariants } from '@patternfly/react-core';

import { JaegerTrace } from '../../types/JaegerInfo';
import { getFormattedTraceInfo } from './JaegerResults/FormattedTraceInfo';
import { PFAlertColor, PfColors } from 'components/Pf/PfColors';

interface Props {
  trace: JaegerTrace;
}

const mainStyle = style({
  display: 'inline-block',
  maxWidth: 160
});

const errorStyle = style({
  display: 'inline-block',
  maxWidth: 160,
  color: PFAlertColor.Danger
});

const secondaryLeftStyle = style({
  color: PfColors.Black600
});

const secondaryRightStyle = style({
  color: PfColors.Black600,
  float: 'right'
});

export const TraceListItem: React.SFC<Props> = props => {
  const formattedTrace = getFormattedTraceInfo(props.trace);
  return (
    <Text component={TextVariants.h3}>
      <span className={formattedTrace.errors ? errorStyle : mainStyle}>{formattedTrace.name}</span>
      {formattedTrace.duration ? <span className={secondaryRightStyle}>{formattedTrace.duration}</span> : ''}
      <br />
      <span className={secondaryLeftStyle}>{formattedTrace.spans}</span>
      <span className={secondaryRightStyle}>{formattedTrace.fromNow}</span>
    </Text>
  );
};
