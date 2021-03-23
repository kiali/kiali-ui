import * as React from 'react';
import { Server } from '../../../types/IstioObjects';
import { cellWidth, ICell, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { style } from 'typestyle';
import { PfColors } from '../../../components/Pf/PfColors';

type Props = {
  serverList: Server[];
  onRemoveServer: (index: number) => void;
};

const noServerStyle = style({
  marginTop: 10,
  color: PfColors.Red100,
  textAlign: 'center',
  width: '100%'
});

const headerCells: ICell[] = [
  {
    title: 'Gateway Servers',
    transforms: [cellWidth(100) as any],
    props: {}
  },
  {
    title: '',
    props: {}
  }
];

class ServerList extends React.Component<Props> {
  rows = () => {
    return this.props.serverList.map((server, i) => {
      return {
        key: 'server_' + i,
        cells: [
          <>
            <div>
              <span>
                <b>Hosts:</b> [{server.hosts.join(',')}]
              </span>
            </div>
            <div>
              <span>
                <b>Port:</b> [{server.port.name}, {server.port.number}, {server.port.protocol}]
              </span>
            </div>
          </>,
          <></>
        ]
      };
    });
  };

  // @ts-ignore
  actionResolver = (rowData, { rowIndex }) => {
    const removeAction = {
      title: 'Remove Rule',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => {
        this.props.onRemoveServer(rowIndex);
      }
    };
    return [removeAction];
  };

  render() {
    return (
      <>
        <Table
          aria-label="Server List"
          cells={headerCells}
          rows={this.rows()}
          // @ts-ignore
          actionResolver={this.actionResolver}
        >
          <TableHeader />
          <TableBody />
        </Table>
        {this.props.serverList.length === 0 && <div className={noServerStyle}>No Servers defined</div>}
      </>
    );
  }
}

export default ServerList;
