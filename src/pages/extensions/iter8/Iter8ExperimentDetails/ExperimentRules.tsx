// Modified copy of src/components/IstioWizards/RequestRouting/Rules.tsx

import * as React from 'react';
import { cellWidth, ICell, Table, TableHeader, TableBody } from '@patternfly/react-table';
import { style } from 'typestyle';
import { PFColors } from './../../../../components/Pf/PfColors';
import { Badge, EmptyState, EmptyStateVariant, Title, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { WorkloadWeight } from './../../../../components/IstioWizards/TrafficShifting';
import { Abort, Delay, HTTPRetry } from './../../../../types/IstioObjects';
import { PFBadge, PFBadges } from 'components/Pf/PfBadges';

export enum MOVE_TYPE {
  UP,
  DOWN
}

export type Rule = {
  matches: string[];
  workloadWeights: WorkloadWeight[];
  delay?: Delay;
  abort?: Abort;
  timeout?: string;
  retries?: HTTPRetry;
};

type Props = {
  rules: Rule[];
  onRemoveRule: (index: number) => void;
  onMoveRule: (index: number, move: MOVE_TYPE) => void;
};

const validationStyle = style({
  marginTop: 15,
  color: PFColors.Red100
});

class ExperimentRules extends React.Component<Props> {
  matchAllIndex = (rules: Rule[]): number => {
    let matchAll: number = -1;
    for (let index = 0; index < rules.length; index++) {
      const rule = rules[index];
      if (rule.matches.length === 0) {
        matchAll = index;
        break;
      }
    }
    return matchAll;
  };

  // @ts-ignore
  actionResolver = (rowData, { rowIndex }) => {
    const removeAction = {
      title: 'Remove Rule',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => this.props.onRemoveRule(rowIndex)
    };
    const moveUpAction = {
      title: 'Move Up',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => this.props.onMoveRule(rowIndex, MOVE_TYPE.UP)
    };
    const moveDownAction = {
      title: 'Move Down',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => this.props.onMoveRule(rowIndex, MOVE_TYPE.DOWN)
    };

    const actions: any[] = [];
    if (this.props.rules.length > 0) {
      actions.push(removeAction);
    }
    if (rowIndex > 0) {
      actions.push(moveUpAction);
    }
    if (rowIndex + 1 < this.props.rules.length) {
      actions.push(moveDownAction);
    }
    return actions;
  };

  render() {
    // TODO: Casting 'as any' because @patternfly/react-table@2.22.19 has a typing bug. Remove the casting when PF fixes it.
    // https://github.com/patternfly/patternfly-next/issues/2373
    const headerCells: ICell[] = [
      {
        title: 'Rule order',
        transforms: [cellWidth(10) as any],
        props: {}
      },
      {
        title: 'Request Matching',
        props: {}
      },
      {
        title: 'Route To',
        props: {}
      }
    ];

    let isValid: boolean = true;
    const matchAll: number = this.matchAllIndex(this.props.rules);
    const routeRules =
      this.props.rules.length > 0
        ? this.props.rules.map((rule, order) => {
            isValid = matchAll === -1 || order <= matchAll;
            return {
              cells: [
                <>{order + 1}</>,
                <>
                  {rule.matches.length === 0
                    ? 'Any request'
                    : rule.matches.map((match, i) => <div key={'match_' + i}>{match}</div>)}
                  {!isValid && (
                    <div className={validationStyle}>
                      Match 'Any request' is defined in a previous rule.
                      <br />
                      This rule is not accessible.
                    </div>
                  )}
                </>,
                <>
                  <div key={'ww_' + order}>
                    {rule.workloadWeights
                      .filter(wk => !wk.mirrored)
                      .map((wk, i) => {
                        return (
                          <div key={'wk_' + order + '_' + wk.name + '_' + i}>
                            <PFBadge badge={PFBadges.Workload} position={TooltipPosition.top} />
                            {wk.name} ({wk.weight}% routed traffic)
                          </div>
                        );
                      })}
                    {rule.workloadWeights
                      .filter(wk => wk.mirrored)
                      .map((wk, i) => {
                        return (
                          <div key={'wk_mirrored_' + order + '_' + wk.name + '_' + i}>
                            <Tooltip
                              key={'mirrorred_' + wk.name}
                              position={TooltipPosition.top}
                              content={<>Mirrored Workload</>}
                            >
                              <Badge className={'faultinjection_badge_definition'}>MI</Badge>
                            </Tooltip>
                            {wk.name} ({wk.weight}% mirrored traffic)
                          </div>
                        );
                      })}
                  </div>
                  {rule.delay && (
                    <div key={'delay_' + order}>
                      <Tooltip position={TooltipPosition.top} content={<>Fault Injection: Delay</>}>
                        <Badge className={'faultinjection_badge_definition'}>FI</Badge>
                      </Tooltip>
                      {rule.delay.percentage?.value}% requests delayed ({rule.delay.fixedDelay})
                    </div>
                  )}
                  {rule.abort && (
                    <div key={'abort_' + order}>
                      <Tooltip position={TooltipPosition.top} content={<>Fault Injection: Abort</>}>
                        <Badge className={'faultinjection_badge_definition'}>FI</Badge>
                      </Tooltip>
                      {rule.abort.percentage?.value}% requests aborted (HTTP Status {rule.abort.httpStatus})
                    </div>
                  )}
                  {rule.timeout && (
                    <div key={'timeout_' + order}>
                      <Tooltip position={TooltipPosition.top} content={<>Request Timeout</>}>
                        <Badge className={'faultinjection_badge_definition'}>RT</Badge>
                      </Tooltip>
                      timeout ({rule.timeout})
                    </div>
                  )}
                  {rule.retries && (
                    <div key={'retries_' + order}>
                      <Tooltip position={TooltipPosition.top} content={<>Request Retry</>}>
                        <Badge className={'faultinjection_badge_definition'}>RR</Badge>
                      </Tooltip>
                      {rule.retries.attempts} attempts with timeout ({rule.timeout})
                    </div>
                  )}
                </>
              ]
            };
          })
        : [
            {
              key: 'rowEmpty',
              cells: [
                {
                  title: (
                    <EmptyState variant={EmptyStateVariant.full}>
                      <Title headingLevel="h5" size="lg">
                        No Rules Defined
                      </Title>
                    </EmptyState>
                  ),
                  props: { colSpan: 3 }
                }
              ]
            }
          ];

    return (
      <>
        Rules defined:
        <Table
          aria-label="Rules Created"
          cells={headerCells}
          rows={routeRules}
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

export default ExperimentRules;
