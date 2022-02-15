import { Stack, StackItem, Title, TitleLevel, TitleSize, Tooltip, TooltipPosition } from '@patternfly/react-core';
import * as React from 'react';
import HelpField from './HelpField';

interface IstioConfigHelpProps {}

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
          <Tooltip
            position={TooltipPosition.right}
            content={
              <div style={{ textAlign: 'left' }}>
                The destination hosts to which traffic is being sent. Could be a DNS name with wildcard prefix or an IP
                address. Depending on the platform, short-names can also be used instead of a FQDN (i.e. has no dots in
                the name). In such a scenario, the FQDN of the host would be derived based on the underlying platform.
              </div>
            }
          >
            <HelpField value="/spec/hosts"></HelpField>
          </Tooltip>
          <Tooltip position={TooltipPosition.right} content={<div style={{ textAlign: 'left' }}>asd</div>}>
            <HelpField value="/spec/gateways"></HelpField>
          </Tooltip>

          <Tooltip position={TooltipPosition.right} content={<div style={{ textAlign: 'left' }}>asd</div>}>
            <HelpField value="/spec/http/match"></HelpField>
          </Tooltip>

          <Tooltip position={TooltipPosition.right} content={<div style={{ textAlign: 'left' }}>asd</div>}>
            <HelpField value="/spec/http/destination"></HelpField>
          </Tooltip>
        </StackItem>
      </Stack>
    );
  }
}

export default IstioConfigHelp;
