import * as React from 'react';
import { GatewayServer } from '../GatewayForm';
import { Button, FormGroup, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { TextInputBase as TextInput } from '@patternfly/react-core/dist/js/components/TextInput/TextInput';
import { cellWidth, ICell, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { style } from 'typestyle';
import { PfColors } from '../../../components/Pf/PfColors';
import { PlusCircleIcon } from '@patternfly/react-icons';

type Props = {
  onAddServer: (server: GatewayServer) => void;
};

type State = {
  newHosts: string[];
  isHostsValid: boolean;
  newPortNumber: string;
  newPortName: string;
  newPortProtocol: string;
};

const warningStyle = style({
  marginLeft: 25,
  color: PfColors.Red100,
  textAlign: 'center'
});

const addServerStyle = style({
  marginLeft: 0,
  paddingLeft: 0
});

const portHeader: ICell[] = [
  {
    title: 'Port Number',
    transforms: [cellWidth(20) as any],
    props: {}
  },
  {
    title: 'Port Name',
    transforms: [cellWidth(20) as any],
    props: {}
  },
  {
    title: 'Protocol',
    transforms: [cellWidth(20) as any],
    props: {}
  }
];

const protocols = ['HTTP', 'HTTPS', 'GRPC', 'HTTP2', 'MONGO', 'TCP', 'TLS'];

class ServerBuilder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      newHosts: [],
      isHostsValid: false,
      newPortNumber: '',
      newPortName: '',
      newPortProtocol: protocols[0]
    };
  }

  canAddServer = (): boolean => {
    console.log('TODELETE canAddServer');
    return false;
  };

  onAddHosts = (value: string, _) => {
    console.log('TODELETE onAddHosts ' + value);
  };

  onAddPortNumber = (value: string, _) => {
    console.log('TODELETE onAddPortNumber ' + value);
  };

  onAddPortName = (value: string, _) => {
    console.log('TODELETE onAddPortName ' + value);
  };

  onAddPortProtocol = (value: string, _) => {
    console.log('TODELETE onAddPortProtocol ' + value);
  };

  onAddServer = () => {
    console.log('TODELETE onAddServer');
  };

  portRows() {
    return [
      {
        keys: 'gatewayPortNew',
        cells: [
          <>
            <TextInput
              value={this.state.newPortNumber}
              type="number"
              id="addPortNumber"
              aria-describedby="add port number"
              name="addPortNumber"
              onChange={this.onAddPortNumber}
              isValid={this.state.newPortNumber.length > 0 && !isNaN(Number(this.state.newPortNumber))}
            />
          </>,
          <>
            <TextInput
              value={this.state.newPortName}
              type="text"
              id="addPortName"
              aria-describedby="add port name"
              name="addPortName"
              onChange={this.onAddPortName}
              isValid={this.state.newPortName.length > 0}
            />
          </>,
          <>
            <FormSelect
              value={this.state.newPortProtocol}
              id="addPortProtocol"
              name="addPortProtocol"
              onChange={this.onAddPortProtocol}
            >
              {protocols.map((option, index) => (
                <FormSelectOption isDisabled={false} key={'p' + index} value={option} label={option} />
              ))}
            </FormSelect>
          </>
        ]
      }
    ];
  }

  render() {
    return (
      <>
        <FormGroup
          label="Hosts"
          isRequired={true}
          fieldId="gateway-selector"
          helperText="One or more hosts exposed by this gateway. Enter one or hosts separated by comma."
          helperTextInvalid="Invalid hosts for this gateway. Enter one or hosts separated by comma."
          isValid={this.state.isHostsValid}
        >
          <TextInput
            value={this.state.newHosts.join(',')}
            isRequired={true}
            type="text"
            id="hosts"
            aria-describedby="hosts"
            name="hosts"
            onChange={this.onAddHosts}
            isValid={this.state.isHostsValid}
          />
        </FormGroup>
        <FormGroup label="Port" isRequired={true} fieldId="server-port">
          <Table aria-label="Port Level MTLS" cells={portHeader} rows={this.portRows()}>
            <TableHeader />
            <TableBody />
          </Table>
        </FormGroup>
        <FormGroup fieldId="addRule">
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            onClick={this.onAddServer}
            isDisabled={!this.canAddServer()}
            className={addServerStyle}
          >
            Add Server to Server List
          </Button>
          {!this.canAddServer() && <span className={warningStyle}>A Server needs Hosts and Port sections defined</span>}
        </FormGroup>
      </>
    );
  }
}

export default ServerBuilder;
