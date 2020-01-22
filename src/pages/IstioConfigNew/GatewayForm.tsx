import * as React from 'react';
import { ICell, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { Button, FormSelect, FormSelectOption, TextInput } from '@patternfly/react-core';
import { style } from 'typestyle';
import { PfColors } from '../../components/Pf/PfColors';

const headerCells: ICell[] = [
  {
    title: 'Hosts',
    props: {}
  },
  {
    title: 'Port Number',
    props: {}
  },
  {
    title: 'Port Name',
    props: {}
  },
  {
    title: 'Port Protocol',
    props: {}
  },
  {
    title: '',
    props: {}
  }
];

const protocols = ['HTTP', 'HTTPS', 'GRPC', 'HTTP2', 'MONGO', 'TCP', 'TLS'];

const noGatewayServerStyle = style({
  marginTop: 15,
  color: PfColors.Red100
});

type Props = {
  gatewayServers: GatewayServer[];
  onAdd: (server: GatewayServer) => void;
  onRemove: (index: number) => void;
};

export type GatewayServer = {
  hosts: string[];
  portNumber: string;
  portName: string;
  portProtocol: string;
};

// Gateway and Sidecar states are consolidated in the parent page
export type GatewayState = {
  gatewayServers: GatewayServer[];
};

type State = {
  addGatewayServer: GatewayServer;
};

class GatewayForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      addGatewayServer: {
        hosts: [],
        portNumber: '80',
        portName: 'http',
        portProtocol: 'HTTP'
      }
    };
  }

  // @ts-ignore
  actionResolver = (rowData, { rowIndex }) => {
    const removeAction = {
      title: 'Remove Server',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => {
        this.props.onRemove(rowIndex);
      }
    };
    if (rowIndex < this.props.gatewayServers.length) {
      return [removeAction];
    }
    return [];
  };

  onAddHosts = (value: string, _) => {
    this.setState(prevState => ({
      addGatewayServer: {
        hosts: value.trim().length === 0 ? [] : value.split(',').map(host => host.trim()),
        portNumber: prevState.addGatewayServer.portNumber,
        portName: prevState.addGatewayServer.portName,
        portProtocol: prevState.addGatewayServer.portProtocol
      }
    }));
  };

  onAddPortNumber = (value: string, _) => {
    this.setState(prevState => ({
      addGatewayServer: {
        hosts: prevState.addGatewayServer.hosts,
        portNumber: value.trim(),
        portName: prevState.addGatewayServer.portName,
        portProtocol: prevState.addGatewayServer.portProtocol
      }
    }));
  };

  onAddPortName = (value: string, _) => {
    this.setState(prevState => ({
      addGatewayServer: {
        hosts: prevState.addGatewayServer.hosts,
        portNumber: prevState.addGatewayServer.portNumber,
        portName: value.trim(),
        portProtocol: prevState.addGatewayServer.portProtocol
      }
    }));
  };

  onAddPortProtocol = (value: string, _) => {
    this.setState(prevState => ({
      addGatewayServer: {
        hosts: prevState.addGatewayServer.hosts,
        portNumber: prevState.addGatewayServer.portNumber,
        portName: prevState.addGatewayServer.portName,
        portProtocol: value.trim()
      }
    }));
  };

  onAddServer = () => {
    this.props.onAdd(this.state.addGatewayServer);
    this.setState({
      addGatewayServer: {
        hosts: [],
        portNumber: '80',
        portName: 'http',
        portProtocol: 'HTTP'
      }
    });
  };

  rows() {
    return this.props.gatewayServers
      .map((gw, i) => ({
        key: 'gw' + i,
        cells: [
          <>
            {gw.hosts.map(host => (
              <div>{host}</div>
            ))}
          </>,
          <>{gw.portNumber}</>,
          <>{gw.portName}</>,
          <>{gw.portProtocol}</>,
          ''
        ]
      }))
      .concat([
        {
          key: 'gwNew',
          cells: [
            <>
              <TextInput
                value={this.state.addGatewayServer.hosts.join(',')}
                type="text"
                id="addHosts"
                aria-describedby="add hosts"
                name="addHosts"
                onChange={this.onAddHosts}
                isValid={this.state.addGatewayServer.hosts.length > 0}
              />
            </>,
            <>
              <TextInput
                value={this.state.addGatewayServer.portNumber}
                type="number"
                id="addPortNumber"
                aria-describedby="add port number"
                name="addPortNumber"
                onChange={this.onAddPortNumber}
                isValid={
                  this.state.addGatewayServer.portNumber.length > 0 &&
                  !isNaN(Number(this.state.addGatewayServer.portNumber))
                }
              />
            </>,
            <>
              <TextInput
                value={this.state.addGatewayServer.portName}
                type="text"
                id="addPortName"
                aria-describedby="add port name"
                name="addPortName"
                onChange={this.onAddPortName}
                isValid={this.state.addGatewayServer.portName.length > 0}
              />
            </>,
            <>
              <FormSelect
                value={this.state.addGatewayServer.portProtocol}
                id="addPortProtocol"
                name="addPortProtocol"
                onChange={this.onAddPortProtocol}
              >
                {protocols.map((option, index) => (
                  <FormSelectOption isDisabled={false} key={index} value={option} label={option} />
                ))}
              </FormSelect>
            </>,
            <>
              <Button
                variant="secondary"
                isDisabled={
                  this.state.addGatewayServer.hosts.length === 0 ||
                  this.state.addGatewayServer.portNumber.length === 0 ||
                  this.state.addGatewayServer.portName.length === 0 ||
                  isNaN(Number(this.state.addGatewayServer.portNumber))
                }
                onClick={this.onAddServer}
              >
                Add Server
              </Button>
            </>
          ]
        }
      ]);
  }

  render() {
    return (
      <>
        Servers defined:
        <Table
          aria-label="Gateway Servers"
          cells={headerCells}
          rows={this.rows()}
          // @ts-ignore
          actionResolver={this.actionResolver}
        >
          <TableHeader />
          <TableBody />
        </Table>
        {this.props.gatewayServers.length === 0 && (
          <div className={noGatewayServerStyle}>Gateway has no Servers Defined</div>
        )}
      </>
    );
  }
}

export default GatewayForm;
