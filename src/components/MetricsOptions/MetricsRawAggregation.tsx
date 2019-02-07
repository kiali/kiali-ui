import * as React from 'react';

import history, { URLParams, HistoryManager } from '../../app/History';
import { ToolbarDropdown } from '../ToolbarDropdown/ToolbarDropdown';
import { AggregationOperator } from '../../types/MetricsOptions';

interface Props {
  onChanged: (operator: AggregationOperator) => void;
}

export default class MetricsRawAggregation extends React.Component<Props> {
  static Operators: { [key: string]: string } = {
    sum: 'Sum',
    avg: 'Average',
    min: 'Min',
    max: 'Max',
    stddev: 'Standard deviation',
    stdvar: 'Standard variance'
  };

  private shouldReportOptions: boolean;
  private operator: AggregationOperator;

  static initialOperator = (): AggregationOperator => {
    const urlParams = new URLSearchParams(history.location.search);
    const opParam = urlParams.get(URLParams.AGG_OPERATOR);
    if (opParam != null) {
      return opParam as AggregationOperator;
    }
    return 'sum';
  };

  constructor(props: Props) {
    super(props);
  }

  componentDidUpdate() {
    if (this.shouldReportOptions) {
      this.shouldReportOptions = false;
      this.props.onChanged(this.operator);
    }
  }

  onOperatorChanged = (operator: string) => {
    HistoryManager.setParam(URLParams.AGG_OPERATOR, operator);
  };

  render() {
    this.processUrlParams();
    return (
      <ToolbarDropdown
        id={'metrics_filter_operator'}
        disabled={false}
        handleSelect={this.onOperatorChanged}
        nameDropdown={'Pods aggregation'}
        value={this.operator}
        initialLabel={MetricsRawAggregation.Operators[this.operator]}
        options={MetricsRawAggregation.Operators}
      />
    );
  }

  processUrlParams() {
    const op = MetricsRawAggregation.initialOperator();
    this.shouldReportOptions = op !== this.operator;
    this.operator = op;
  }
}
