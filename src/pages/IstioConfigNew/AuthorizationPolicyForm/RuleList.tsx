import * as React from 'react';
import { Rule } from './RuleBuilder';
import { cellWidth, ICell, Table, TableBody, TableHeader } from '@patternfly/react-table';

type Props = {
  ruleList: Rule[];
  onRemoveRule: (index: number) => void;
};

type State = {};

const headerCells: ICell[] = [
  {
    title: 'Rules to match the request',
    transforms: [cellWidth(100) as any],
    props: {}
  },
  {
    title: '',
    props: {}
  }
];

export class RuleList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  rows = () => {
    return this.props.ruleList.map((_rule, i) => {
      return {
        key: 'rule' + i,
        cells: [<>Here to print the rule</>, <></>]
      };
    });
  };

  // @ts-ignore
  actionResolver = (rowData, { rowIndex }) => {
    const removeAction = {
      title: 'Remove Rule',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => {
        this.props.onRemoveRule(rowIndex);
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
