import * as React from 'react';
import { cellWidth, ICell, IRow, Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';
import {
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  // Grid,
  // GridItem,
  Title
} from '@patternfly/react-core';
import { CogsIcon } from '@patternfly/react-icons';
import { SuccessCriteria } from '../../../../types/Iter8';

type CriteriaTableProps = {
  criterias: SuccessCriteria[];
};

class CriteriaTable extends React.Component<CriteriaTableProps> {
  columns(): ICell[] {
    // TODO: Casting 'as any' because @patternfly/react-table@2.22.19 has a typing bug. Remove the casting when PF fixes it.
    // https://github.com/patternfly/patternfly-next/issues/2373
    return [
      { title: '#', transforms: [cellWidth(10) as any] },
      { title: 'Metric Name', transforms: [cellWidth(40) as any] },
      { title: 'Sample Size', transforms: [cellWidth(20) as any] },
      { title: 'Tolerance', transforms: [cellWidth(20) as any] },
      { title: 'ToleranceType', transforms: [cellWidth(20) as any] }
    ];
  }

  noPods(): IRow[] {
    return [
      {
        cells: [
          {
            title: (
              <EmptyState variant={EmptyStateVariant.full}>
                <EmptyStateIcon icon={CogsIcon} />
                <Title headingLevel="h5" size="lg">
                  No Success Criteria found
                </Title>
                <EmptyStateBody>No success criteria in experiment {this.props.criterias}</EmptyStateBody>
              </EmptyState>
            ),
            props: { colSpan: 5 }
          }
        ]
      }
    ];
  }

  rows(): IRow[] {
    let rows: IRow[] = [];
    (this.props.criterias || []).map((criteria, cIdx) => {
      rows.push({
        cells: [
          { title: <> {cIdx + 1}</> },
          { title: <>{criteria.name}</> },
          { title: <>{criteria.criteria.tolerance}</> },
          { title: <>{criteria.criteria.toleranceType}</> }
        ]
      });
      return rows;
    });

    return rows;
  }

  render() {
    return (
      <Card>
        <CardBody>
          <Table
            variant={TableVariant.compact}
            aria-label={'list_workloads_pods'}
            cells={this.columns()}
            rows={this.rows()}
          >
            <TableHeader />
            <TableBody />
          </Table>
        </CardBody>
      </Card>
    );
  }
}

export default CriteriaTable;
