import * as React from 'react';
import { Condition } from './ConditionBuilder';
import { cellWidth, ICell, Table, TableBody, TableHeader } from '@patternfly/react-table';

type Props = {
  conditionList: Condition[];
  onRemoveCondition: (index: number) => void;
};

const headerCells: ICell[] = [
  {
    title: 'Additional Conditions of a Request',
    transforms: [cellWidth(100) as any],
    props: {}
  },
  {
    title: '',
    props: {}
  }
];

class ConditionList extends React.Component<Props> {
  rows = () => {
    return this.props.conditionList.map((condition, i) => {
      return {
        key: 'condition' + i,
        cells: [
          <>
            <b>key: </b> [{condition.key}]<br />
            {condition.values && (
              <>
                <b>values: </b> [{condition.values}]<br />
              </>
            )}
            , State
            {condition.notValues && (
              <>
                <b>notValues: </b> [{condition.notValues}]<br />
              </>
            )}
          </>,
          <></>
        ]
      };
    });
  };

  // @ts-ignore
  actionResolver = (rowData, { rowIndex }) => {
    const removeAction = {
      title: 'Remove Condition',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => {
        this.props.onRemoveCondition(rowIndex);
      }
    };
    return [removeAction];
  };

  render() {
    return (
      <>
        <Table
          aria-label="Condition Builder"
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

export default ConditionList;
