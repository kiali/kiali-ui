import { Stack, StackItem, Title, TitleLevel, TitleSize, Tooltip, TooltipPosition } from '@patternfly/react-core';
import * as React from 'react';
import { HelpMessage } from 'types/IstioObjects';
import HelpField from './HelpField';

interface IstioConfigHelpProps {
  helpMessages?: HelpMessage[];
}

class IstioConfigHelp extends React.Component<IstioConfigHelpProps> {
  render() {
    return (
      <Stack>
        <StackItem>
          <Title headingLevel={TitleLevel.h5} size={TitleSize.lg} style={{ paddingBottom: '10px' }}>
            Help
          </Title>
        </StackItem>
        <StackItem>
          {this.props.helpMessages &&
            this.props.helpMessages.map(helpMessage => {
              return (
                <Tooltip
                  position={TooltipPosition.right}
                  content={<div style={{ textAlign: 'left' }}>{helpMessage.message}</div>}
                >
                  <HelpField value={helpMessage.objectField}></HelpField>
                </Tooltip>
              );
            })}
        </StackItem>
      </Stack>
    );
  }
}

export default IstioConfigHelp;
