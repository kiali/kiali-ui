import * as React from 'react';
import { Label } from '@patternfly/react-core';
import './HelpField.css';

interface Props {
  value: string;
}

const HelpField = (props: Props) => {
  return (
    <span className="label-help">
      <Label className="label-value" isCompact={true}>
        {props.value}
      </Label>
    </span>
  );
};

export default HelpField;
