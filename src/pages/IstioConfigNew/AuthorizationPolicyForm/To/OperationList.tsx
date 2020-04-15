import * as React from 'react';
import { cellWidth, ICell, Table, TableBody, TableHeader } from '@patternfly/react-table';

type Props = {
  toList: { [key: string]: string[] }[];
  onRemoveTo: (index: number) => void;
};

type State = {};

const headerCells: ICell[] = [
  {
    title: 'Operations of a Request',
    transforms: [cellWidth(100) as any],
    props: {}
  },
  {
    title: '',
    props: {}
  }
];

class OperationList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  rows = () => {
    return this.props.toList.map((operation, i) => {
      return {
        key: 'toOperation' + i,
        cells: [
          <>
            {Object.keys(operation).map((field, j) => {
              return (
                <div key={'operationField_' + i + '_' + j}>
                  <b>{field}</b>: [{operation[field].join(',')}]<br />
                </div>
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
      title: 'Remove To',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => {
        this.props.onRemoveTo(rowIndex);
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

export default OperationList;
