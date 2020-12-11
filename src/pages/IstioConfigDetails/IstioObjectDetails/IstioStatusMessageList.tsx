import * as React from 'react';
import { IstioLevelToSeverity, ValidationMessage, ValidationTypes } from '../../../types/IstioObjects';
import {
  Card,
  CardBody,
  CardHeader,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Text,
  TextVariants,
  Title,
  TitleLevel,
  TitleSize
} from '@patternfly/react-core';
import Validation from '../../../components/Validations/Validation';

interface Props {
  messages: ValidationMessage[];
}

class IstioStatusMessageList extends React.Component<Props> {
  render() {
    return (
      <Card key={'istioMessagesCard'}>
        <CardHeader>
          <Title headingLevel={TitleLevel.h3} size={TitleSize.xl}>
            Analyzer Messages
          </Title>
        </CardHeader>
        <CardBody>
          <Stack gutter="lg">
            {this.props.messages.map((msg: ValidationMessage, i: number) => {
              let severity: ValidationTypes = IstioLevelToSeverity[msg.level || 'info'] || ValidationTypes.Info;
              return (
                <StackItem id={'msg-' + i}>
                  <Split gutter="sm">
                    <SplitItem>
                      <Validation severity={severity} />
                    </SplitItem>
                    <SplitItem>
                      <Text component={TextVariants.h5}>
                        <a href={msg.documentation_url} target="_blank" rel="noopener noreferrer">
                          {msg.type.code}
                        </a>
                        {msg.description ? ': ' + msg.description : undefined}
                      </Text>
                    </SplitItem>
                  </Split>
                </StackItem>
              );
            })}
          </Stack>
        </CardBody>
      </Card>
    );
  }
}

export default IstioStatusMessageList;
