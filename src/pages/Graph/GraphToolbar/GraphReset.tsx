import React from 'react';
import { resetSettings } from './graphSettingsSlice';
import { useDispatch } from 'react-redux';
import { Tooltip, Button, ButtonVariant } from '@patternfly/react-core';
import { defaultIconStyle, KialiIcon } from 'config/KialiIcon';

const GraphReset = () => {
  const dispatch = useDispatch();
  const onReset = () => {
    dispatch(resetSettings());
  };

  return (
    <Tooltip key="factory_reset_settings" position="bottom" content="Reset to factory settings">
      <Button style={{ paddingLeft: '10px', paddingRight: '0px' }} variant={ButtonVariant.link} onClick={onReset}>
        <KialiIcon.ResetSettings className={defaultIconStyle} />
      </Button>
    </Tooltip>
  );
};

export default GraphReset;
