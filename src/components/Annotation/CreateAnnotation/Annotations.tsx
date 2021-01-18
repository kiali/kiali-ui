import * as React from 'react';
import './CreateAnnotation.css';
import { cellWidth, ICell, IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { Button, EmptyState, EmptyStateBody, EmptyStateVariant, Title } from '@patternfly/react-core';
import { Remove2Icon } from '@patternfly/react-icons';
import { style } from 'typestyle';
import { PfColors } from '../../Pf/PfColors';

interface Props {
  annotation: string;
  onRemove: (index: number) => void;
}

const noRulesStyle = style({
  marginTop: 15,
  color: PfColors.Red100,
  textAlign: 'center',
  width: '100%'
});

class Annotations extends React.Component<Props> {
  renderRowAnnotation = (): IRow[] => {
    if (this.props.annotation.length === 0) {
      return this.renderEmpty();
    }
    var rows: IRow[] = [];
    this.props.annotation.split(';').forEach((annotation, index) => {
      const splits = annotation.split(',');
      rows.push({
        cells: [
          <>{splits[0]}</>,
          <>{splits[3]}</>,
          <>{splits[4]}</>,
          <>>= {splits[1]}</>,
          <>>= {splits[2]}</>,
          <Button variant="secondary" onClick={() => this.props.onRemove(index)}>
            <Remove2Icon />
          </Button>
        ]
      });
    });
    return rows;
  };

  renderEmpty = (): IRow[] => {
    return [
      {
        key: 'rowEmpty',
        cells: [
          {
            title: (
              <EmptyState variant={EmptyStateVariant.full}>
                <Title headingLevel="h5" size="lg">
                  No Annotations Defined
                </Title>
                <EmptyStateBody className={noRulesStyle}>Annotation needs at least a Definition</EmptyStateBody>
              </EmptyState>
            ),
            props: { colSpan: 6 }
          }
        ]
      }
    ];
  };

  render() {
    const headerCells: ICell[] = [
      {
        title: 'Code Regex',
        transforms: [cellWidth(10) as any],
        props: {}
      },
      {
        title: 'Protocol',
        props: {}
      },
      {
        title: 'Direction',
        props: {}
      },
      {
        title: 'Degraded',
        props: {}
      },
      {
        title: 'Failure',
        props: {}
      },
      {
        title: '',
        props: {}
      }
    ];

    return (
      <div style={{ marginTop: '60px' }}>
        <Table
          header={'Annotations'}
          aria-label="Annotations"
          cells={headerCells}
          rows={this.renderRowAnnotation()}
          // @ts-ignore
          actionResolver={this.actionResolver}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </div>
    );
  }
}

export default Annotations;
