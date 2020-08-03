import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Grid,
  GridItem,
  List,
  ListItem,
  Title,
  Tooltip
} from '@patternfly/react-core';
import { Iter8Info, SuccessCriteria } from '../../../../types/Iter8';
import {
  Table,
  TableBody,
  TableHeader,
  IRow,
  ICell,
  cellWidth,
  expandable,
  RowWrapperProps
} from '@patternfly/react-table';
import { KialiIcon } from '../../../../config/KialiIcon';
import { style } from 'typestyle';
import { css } from '@patternfly/react-styles';
import { RenderComponentScroll } from '../../../../components/Nav/Page';
import styles from '@patternfly/react-styles/css/components/Table/table';

interface ExperimentInfoDescriptionProps {
  iter8Info: Iter8Info;
  criterias: SuccessCriteria[];
}

type State = {
  criteriaExpanded: string[];
  columns: any;
  rows: any;
};

const statusIconStyle = style({
  fontSize: '2.0em'
});

class CriteriaInfoDescription extends React.Component<ExperimentInfoDescriptionProps, State> {
  constructor(props: ExperimentInfoDescriptionProps) {
    super(props);
    this.state = {
      criteriaExpanded: [],
      columns: [
        {
          title: 'Metric Name',
          cellFormatters: [expandable]
        },
        'Definitions',
        'Success Criteria Conclusions',
        'Status'
      ],
      rows: this.getRows()
    };
  }

  getRows = (): IRow[] => {
    let rows: IRow[] = [];
    this.props.criterias.map(criteria => {
      const crows: IRow[] = [
        { cells: [{ title: 'Query Template' }, { title: criteria.metric.query_template }] },
        { cells: [{ title: 'Sample Size Template' }, { title: criteria.metric.sample_size_template }] }
      ];
      let number = rows.push({
        isOpen: false,
        cells: [
          { title: <>{criteria.name}</> },
          {
            title: (
              <ul>
                <li>Threshold : {criteria.criteria.tolerance}</li>
                <li>Threshold Type: {criteria.criteria.toleranceType}</li>
                <li>Sample Size: {criteria.criteria.sampleSize}</li>
              </ul>
            )
          },
          {
            title: (
              <List>
                {criteria.status.conclusions &&
                  criteria.status.conclusions.map((c, _) => {
                    return <ListItem> {c} </ListItem>;
                  })}
              </List>
            )
          },
          {
            title: <>{this.getIcon(String(criteria.status.success_criterion_met))}</>
          }
        ]
      });
      rows.push({
        parent: number - 1,
        fullWidth: true,
        cells: [
          <>
            <Table aria-label="Simple Table" cells={this.columns()} rows={crows}>
              <TableHeader />
              <TableBody />
            </Table>
          </>
        ]
      });
      return rows;
    });
    return rows;
  };

  columns = (): ICell[] => {
    return [{ title: 'Name', transforms: [cellWidth(15) as any] }, { title: 'Template' }];
  };

  getIcon = (s: string) => {
    switch (String(s)) {
      case 'true':
        return (
          <Tooltip content={<>{s}</>}>
            <KialiIcon.Ok className={statusIconStyle} />
          </Tooltip>
        );
      case 'false':
        return (
          <Tooltip content={<>{s}</>}>
            <KialiIcon.Error className={statusIconStyle} />
          </Tooltip>
        );
      default:
        return (
          <Tooltip content={<>{s}</>}>
            <KialiIcon.Ok className={statusIconStyle} />
          </Tooltip>
        );
    }
  };

  customRowWrapper = ({ trRef, className, rowProps, row: { isExpanded, isHeightAuto }, ...props }) => {
    const dangerErrorStyle = {
      borderLeft: '3px solid var(--pf-global--primary-color--100)'
    };

    return (
      <tr
        {...props}
        ref={trRef}
        className={css(
          className,
          'custom-static-class',
          isExpanded !== undefined && styles.tableExpandableRow,
          isExpanded && styles.modifiers.expanded,
          isHeightAuto && styles.modifiers.heightAuto
        )}
        hidden={isExpanded !== undefined && !isExpanded}
        style={dangerErrorStyle}
      />
    );
  };

  onCollapse = (_, rowKey, isOpen) => {
    const { rows } = this.state;
    /**
     * Please do not use rowKey as row index for more complex tables.
     * Rather use some kind of identifier like ID passed with each row.
     */
    rows[rowKey].isOpen = isOpen;
    this.setState({
      rows
    });
  };

  render() {
    const { columns, rows } = this.state;
    return (
      <RenderComponentScroll>
        <Grid gutter="md" style={{ margin: '10px' }}>
          <GridItem span={12}>
            <Table
              aria-label="SpanTable"
              className={'spanTracingTagsTable'}
              onCollapse={this.onCollapse}
              rows={rows}
              cells={columns}
              rowWrapper={(props: RowWrapperProps) =>
                this.customRowWrapper({
                  trRef: props.trRef,
                  className: props.className,
                  rowProps: props.rowProps,
                  row: props.row as any,
                  ...props
                })
              }
            >
              <TableHeader />
              {rows.length > 0 ? (
                <TableBody />
              ) : (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState variant={EmptyStateVariant.full}>
                      <Title headingLevel="h5" size="lg">
                        No Criteria found
                      </Title>
                      <EmptyStateBody>Experiment has not been started</EmptyStateBody>
                    </EmptyState>
                  </td>
                </tr>
              )}
            </Table>
          </GridItem>
        </Grid>
      </RenderComponentScroll>
    );
  }
}

export default CriteriaInfoDescription;
