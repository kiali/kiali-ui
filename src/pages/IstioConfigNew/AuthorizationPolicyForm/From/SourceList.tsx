import * as React from 'react';
import { cellWidth, ICell, Table, TableBody, TableHeader } from '@patternfly/react-table';

type Props = {
  fromList: { [key: string]: string[] }[];
  onRemoveFrom: (index: number) => void;
};

type State = {};

const headerCells: ICell[] = [
  {
    title: 'Source Matches',
    transforms: [cellWidth(100) as any],
    props: {}
  },
  {
    title: '',
    props: {}
  }
];

class SourceList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  rows = () => {
    return this.props.fromList.map((source, i) => {
      return {
        key: 'fromSource' + i,
        cells: [
          <>
            {Object.keys(source).map(field => {
              return (
                <>
                  <b>{field}</b>: [{source[field].join(',')}]<br />
                </>
              );
            })}
          </>,
          <></>
        ]
      };
    });
  };

  // @ts-ignore
  actionResolver = (rowData, { rowIndex }) => {
    const removeAction = {
      title: 'Remove From',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => {
        this.props.onRemoveFrom(rowIndex);
      }
    };
    return [removeAction];
  };

  render() {
    return (
      <>
        <Table
          aria-label="Source Builder"
          cells={headerCells}
          rows={this.rows()}
          // @ts-ignore
          actionResolver={this.actionResolver}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </>
    );
  }
}

export default SourceList;
