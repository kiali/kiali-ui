import * as React from 'react';
import { GatewayServer } from '../GatewayForm';

type Props = {
  serverList: GatewayServer[];
  onRemoveServer: (index: number) => void;
};

class ServerList extends React.Component<Props> {
  render() {
    return <>The Gateway Server List</>;
  }
}

export default ServerList;
