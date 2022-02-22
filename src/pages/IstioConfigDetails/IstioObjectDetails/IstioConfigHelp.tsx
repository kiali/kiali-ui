import { Label, Stack, StackItem, Title, TitleLevel, TitleSize } from '@patternfly/react-core';
import * as React from 'react';
import { HelpMessage } from 'types/IstioObjects';
import './HelpField.css';

interface IstioConfigHelpProps {
  helpMessages?: HelpMessage[];
  selectedLine?: string;
}

class IstioConfigHelp extends React.Component<IstioConfigHelpProps> {
  render() {
    const helpMessage = this.props.helpMessages?.find(helpMessage =>
      this.props.selectedLine?.includes(helpMessage.objectField.substring(helpMessage.objectField.lastIndexOf('.') + 1))
    );

    return (
      <Stack>
        <StackItem>
          <Title headingLevel={TitleLevel.h5} size={TitleSize.lg} style={{ paddingBottom: '10px' }}>
            Help
          </Title>
        </StackItem>

        {helpMessage && (
          <>
            <StackItem>
              <div className="label-help">
                <Label className="label-value" isCompact={true}>
                  {helpMessage.objectField}
                </Label>
              </div>
            </StackItem>
            <StackItem style={{ marginTop: '10px' }}>
              <h6>{helpMessage.message}</h6>
            </StackItem>
          </>
        )}
        {!helpMessage && <p>Help messages will appear when editing around important key fields.</p>}
      </Stack>
    );
  }
}

export default IstioConfigHelp;
