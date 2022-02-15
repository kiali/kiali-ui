import * as React from 'react';
import { Label } from '@patternfly/react-core';

interface Props {
  value: string;
}

const HelpField = (props: Props) => {
  return (
    <span className="label-pair">
      <Label className="label-key" isCompact={true}>
        {props.value}
      </Label>
    </span>
  );
};

export default HelpField;
