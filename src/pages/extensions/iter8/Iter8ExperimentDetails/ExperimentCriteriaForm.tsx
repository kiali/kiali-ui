import { cellWidth, ICell, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { Criteria, NameValuePair } from '../../../../types/Iter8';
import * as React from 'react';
import { Button, FormSelect, FormSelectOption, TextInput, Checkbox } from '@patternfly/react-core';
import { style } from 'typestyle';
import { PfColors } from '../../../../components/Pf/PfColors';

const headerCells: ICell[] = [
  {
    title: 'Metric Name',
    transforms: [cellWidth(20) as any],
    props: {}
  },
  {
    title: 'Threshold',
    transforms: [cellWidth(10) as any],
    props: {}
  },
  {
    title: 'Threshold Type',
    transforms: [cellWidth(15) as any],
    props: {}
  },
  {
    title: 'Stop on Failure',
    props: {}
  },
  {
    title: '',
    props: {}
  }
];

// const metrics = ['', 'iter8_latency', 'iter8_error_count', 'iter8_error_rate'];
const toleranceType: NameValuePair[] = [
  {
    name: 'threshold',
    value: 'absolute'
  },
  {
    name: 'relative',
    value: 'delta'
  }
];

const noCriteriaStyle = style({
  marginTop: 15,
  color: PfColors.Red100
});

type Props = {
  criterias: Criteria[];
  metricNames: string[];
  onAdd: (server: Criteria) => void;
  onRemove: (index: number) => void;
};

export type CriteriaState = {
  criterias: Criteria[];
};

type State = {
  addCriteria: Criteria;
  validName: boolean;
};

// Create Success Criteria, can be multiple with same metric, but different sampleSize, etc...
class ExperimentCriteriaForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      addCriteria: {
        metric: '',
        tolerance: 0.2,
        toleranceType: 'threshold',
        stopOnFailure: false
      },
      validName: false
    };
  }

  // @ts-ignore
  actionResolver = (rowData, { rowIndex }) => {
    const removeAction = {
      title: 'Remove Criteria',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => {
        this.props.onRemove(rowIndex);
      }
    };
    if (rowIndex < this.props.criterias.length) {
      return [removeAction];
    }
    return [];
  };

  onAddMetricName = (value: string) => {
    this.setState(prevState => ({
      addCriteria: {
        metric: value.trim(),
        tolerance: prevState.addCriteria.tolerance,
        toleranceType: prevState.addCriteria.toleranceType,
        stopOnFailure: prevState.addCriteria.stopOnFailure
      },
      validName: true
    }));
  };

  onAddSampleSize = (value: string, _) => {
    this.setState(prevState => ({
      addCriteria: {
        metric: prevState.addCriteria.metric,
        sampleSize: Number(value.trim()),
        tolerance: prevState.addCriteria.tolerance,
        toleranceType: prevState.addCriteria.toleranceType,
        stopOnFailure: prevState.addCriteria.stopOnFailure
      },
      validName: true
    }));
  };

  onAddTolerance = (value: string, _) => {
    this.setState(prevState => ({
      addCriteria: {
        metric: prevState.addCriteria.metric,
        tolerance: parseFloat(value.trim()),
        toleranceType: prevState.addCriteria.toleranceType,
        stopOnFailure: prevState.addCriteria.stopOnFailure
      },
      validName: true
    }));
  };
  onAddToleranceType = (value: string, _) => {
    this.setState(prevState => ({
      addCriteria: {
        metric: prevState.addCriteria.metric,
        tolerance: prevState.addCriteria.tolerance,
        toleranceType: value.trim(),
        stopOnFailure: prevState.addCriteria.stopOnFailure
      },
      validName: true
    }));
  };

  onAddStopOnFailure = (value: boolean, _) => {
    this.setState(prevState => ({
      addCriteria: {
        metric: prevState.addCriteria.metric,
        tolerance: prevState.addCriteria.tolerance,
        toleranceType: prevState.addCriteria.toleranceType,
        stopOnFailure: value
      },
      validName: true
    }));
  };

  onAddCriteria = () => {
    this.props.onAdd(this.state.addCriteria);
    this.setState({
      addCriteria: {
        metric: '',
        tolerance: 0.2,
        toleranceType: 'threshold',
        stopOnFailure: false
      }
    });
  };

  rows() {
    return this.props.criterias
      .map((gw, i) => ({
        key: 'criteria' + i,
        cells: [<>{gw.metric}</>, <>{gw.tolerance}</>, <>{gw.toleranceType}</>, <>{gw.stopOnFailure}</>]
      }))
      .concat([
        {
          key: 'gwNew',
          cells: [
            <>
              <FormSelect
                value={this.state.addCriteria.metric}
                id="addMetricName"
                name="addMetricName"
                onChange={this.onAddMetricName}
              >
                {this.props.metricNames.map((option, index) => (
                  <FormSelectOption isDisabled={false} key={'p' + index} value={option} label={option} />
                ))}
              </FormSelect>
            </>,
            <>
              <TextInput
                value={this.state.addCriteria.tolerance}
                type="number"
                id="addTolerance"
                aria-describedby="Tolerance"
                name="addTolerance"
                onChange={this.onAddTolerance}
                isValid={!isNaN(this.state.addCriteria.tolerance)}
              />
            </>,
            <>
              <FormSelect
                value={this.state.addCriteria.toleranceType}
                id="addPortProtocol"
                name="addPortProtocol"
                onChange={this.onAddToleranceType}
              >
                {toleranceType.map((option, index) => (
                  <FormSelectOption isDisabled={false} key={'p' + index} value={option.name} label={option.value} />
                ))}
              </FormSelect>
            </>,
            <>
              <Checkbox
                label="Stop On Failure"
                id="stopOnFailure"
                name="stopOnFailure"
                aria-label="Stop On Failure"
                isChecked={this.state.addCriteria.stopOnFailure}
                onChange={this.onAddStopOnFailure}
              />
            </>,
            <>
              <Button
                id="addServerBtn"
                variant="secondary"
                isDisabled={this.state.addCriteria.metric.length === 0}
                onClick={this.onAddCriteria}
              >
                Add this Criteria
              </Button>
            </>
          ]
        }
      ]);
  }
  render() {
    return (
      <>
        <Table
          aria-label="Success Criterias"
          cells={headerCells}
          rows={this.rows()}
          // @ts-ignore
          actionResolver={this.actionResolver}
        >
          <TableHeader />
          <TableBody />
        </Table>
        {this.props.criterias.length === 0 && (
          <div className={noCriteriaStyle}>Experiment has no Success Criteria Defined</div>
        )}
      </>
    );
  }
}

export default ExperimentCriteriaForm;
