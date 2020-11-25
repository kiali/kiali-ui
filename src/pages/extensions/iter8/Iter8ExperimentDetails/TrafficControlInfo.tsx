import * as React from 'react';
import { TrafficControl } from '../../../../types/Iter8';
import { compoundExpand, IRow, Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';
import {
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  FlexModifiers,
  PopoverPosition,
  Text,
  Title,
  Tooltip
} from '@patternfly/react-core';
import equal from 'fast-deep-equal';
import CodeBranchIcon from '@patternfly/react-icons/dist/js/icons/code-branch-icon';
import { style } from 'typestyle';
import { KialiIcon } from '../../../../config/KialiIcon';

const infoStyle = style({
  margin: '0px 16px 2px 4px'
});
const containerPadding = style({ padding: '20px' });

interface TrafficControlInfoProps {
  trafficControl: TrafficControl;
}

type State = {
  columns: any;
  childColumns: any;
  rows: any;
};

class TrafficControlInfo extends React.Component<TrafficControlInfoProps, State> {
  constructor(props: TrafficControlInfoProps) {
    super(props);
    this.state = {
      columns: [
        'URL Match Policy',
        'Match String',
        {
          title: 'Headers',
          cellTransforms: [compoundExpand]
        }
      ],
      childColumns: ['Header Key', 'Match Policy', 'Match String'],
      rows: []
    };
  }

  componentDidMount() {
    this.setState(() => {
      return {
        rows: this.getRows()
      };
    });
  }

  componentDidUpdate(prevProps) {
    if (!equal(this.props.trafficControl, prevProps.trafficControl)) {
      this.setState(() => {
        return {
          rows: this.getRows()
        };
      });
    }
  }

  getRows = (): IRow[] => {
    let rows: IRow[] = [];
    this.props.trafficControl?.match.http?.map((matchRule, idx) => {
      const parentCount = idx * 2;
      const childRows: IRow[] = matchRule.headers.map(h => {
        return {
          isOpen: false,
          cells: [{ title: <>{h.key}</> }, { title: <>{h.match}</> }, { title: <>{h.stringMatch}</> }]
        };
      });

      rows.push({
        cells: [
          { title: <> {matchRule.uri.match}</>, props: { component: 'th' } },
          { title: <> {matchRule.uri.stringMatch}</>, props: { component: 'th' } },
          {
            title: (
              <React.Fragment>
                <CodeBranchIcon key="icon" /> {matchRule.headers.length}
              </React.Fragment>
            ),
            props: { isOpen: false, ariaControls: 'childTable' + parentCount }
          }
        ]
      });
      rows.push({
        isOpen: false,
        parent: parentCount,
        compoundParent: 2,
        cells: [
          {
            title: (
              <Table
                cells={this.state.childColumns}
                variant={TableVariant.compact}
                rows={childRows}
                className="pf-m-no-border-rows"
              >
                <TableHeader />
                <TableBody />
              </Table>
            ),
            props: { isOpen: false, className: 'pf-m-no-padding', colSpan: 3 }
          }
        ]
      });
    });
    return rows;
  };

  onExpand = (_, rowIndex, colIndex, isOpen) => {
    const { rows } = this.state;
    rows[rowIndex].cells[colIndex].props.isOpen = !isOpen;

    this.setState({
      rows
    });
  };

  render() {
    const { columns, rows } = this.state;
    return (
      <Flex breakpointMods={[{ modifier: FlexModifiers.column }]}>
        <FlexItem>
          <DataList aria-label="detailTraffic">
            <DataListItem aria-labelledby="altorighm">
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={
                    <DataListCell key="strategy">
                      <Text>
                        <b>Traffic Strategy</b>
                        <Tooltip
                          key={'winnerTooltip'}
                          aria-label={'Winner Tooltip'}
                          position={PopoverPosition.auto}
                          maxWidth="30rem"
                          content={
                            <table>
                              <tr className={'tr'}>
                                <td style={{ verticalAlign: 'top' }}>
                                  <div style={{ width: '100px' }}>progressive:</div>
                                </td>
                                <td>Progressively shift all traffic to the winner.</td>
                              </tr>
                              <tr>
                                <td>top_2:&nbsp;</td>
                                <td>Converge towards a 50-50 traffic split between the best two versions</td>
                              </tr>
                              <tr>
                                <td>uniform:&nbsp;</td>
                                <td>Converge towards a uniform traffic split across all versions.</td>
                              </tr>
                            </table>
                          }
                        >
                          <KialiIcon.Info className={infoStyle} />
                        </Tooltip>
                        : {this.props.trafficControl.strategy ? this.props.trafficControl.strategy : 'progressive'}
                      </Text>
                    </DataListCell>
                  }
                />
                <DataListItemCells
                  dataListCells={
                    <DataListCell key="strategy">
                      <Text>
                        <b>Max Increment </b>
                        <Tooltip
                          key={'winnerTooltip'}
                          aria-label={'Winner Tooltip'}
                          position={PopoverPosition.auto}
                          content={
                            <>
                              Specifies the maximum percentage by which traffic routed to a candidate can increase
                              during a single iteration of the experiment. Default value: 2 (percent)
                            </>
                          }
                        >
                          <KialiIcon.Info className={infoStyle} />
                        </Tooltip>
                        : {this.props.trafficControl.maxIncrement} {'%'}
                      </Text>
                    </DataListCell>
                  }
                />
                <DataListItemCells
                  dataListCells={
                    <DataListCell key="strategy">
                      <Text>
                        <b>On Termination </b>
                        <Tooltip
                          key={'winnerTooltip'}
                          aria-label={'Winner Tooltip'}
                          position={PopoverPosition.auto}
                          maxWidth="30rem"
                          content={
                            <table>
                              <tr className={'tr'}>
                                <td style={{ verticalAlign: 'top' }}>
                                  <div style={{ width: '100px' }}>to_winner:</div>
                                </td>
                                <td>
                                  ensures that, if a winning version is found at the end of the experiment, all traffic
                                  will flow to this version after the experiment terminates.
                                </td>
                              </tr>
                              <tr>
                                <td>to_baseline:</td>
                                <td>
                                  {' '}
                                  F ensure that all traffic will flow to the baseline version, after the experiment
                                  terminates
                                </td>
                              </tr>
                              <tr>
                                <td>keep_last:</td>
                                <td>
                                  ensure that the traffic split used during the final iteration of the experiment
                                  continues even after the experiment has terminated.
                                </td>
                              </tr>
                            </table>
                          }
                        >
                          <KialiIcon.Info className={infoStyle} />
                        </Tooltip>
                        :{' '}
                        {this.props.trafficControl.onTermination
                          ? this.props.trafficControl.onTermination
                          : 'to_winner'}
                      </Text>
                    </DataListCell>
                  }
                />
              </DataListItemRow>
            </DataListItem>
          </DataList>
        </FlexItem>
        <FlexItem>
          <div className={containerPadding}>
            <Title headingLevel="h6" size="lg">
              Match Rules
              <Tooltip
                key={'winnerTooltip'}
                aria-label={'Winner Tooltip'}
                position={PopoverPosition.auto}
                content={
                  <>
                    Match rules used to filter out incoming traffic. With protocol name as a key, its value is an array
                    of Istio matching clauses. Currently, only http is supported
                  </>
                }
              >
                <KialiIcon.Info className={infoStyle} />
              </Tooltip>
            </Title>

            <Table aria-label="Compound expandable table" onExpand={this.onExpand} rows={rows} cells={columns}>
              <TableHeader />
              {rows.length > 0 ? (
                <TableBody />
              ) : (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState variant={EmptyStateVariant.full}>
                      <Title headingLevel="h5" size="lg">
                        No Match Rule found
                      </Title>
                      <EmptyStateBody>No Match Rules is defined in Experiment</EmptyStateBody>
                    </EmptyState>
                  </td>
                </tr>
              )}
            </Table>
          </div>
        </FlexItem>
      </Flex>
    );
  }
}

export default TrafficControlInfo;
