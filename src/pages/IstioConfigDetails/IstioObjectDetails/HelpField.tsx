import * as React from 'react';
import { Label } from '@patternfly/react-core';
import './HelpField.css';

interface Props {
  value: string;
  message: string;
}

const HelpField = (props: Props) => {
  return (
    <>
      <div className="label-help">
        <Label className="label-value" isCompact={true}>
          {props.value}
        </Label>
      </div>
      <div>{props.message}</div>
    </>
  );
};

export default HelpField;
