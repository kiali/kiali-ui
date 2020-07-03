import { cellWidth, ICell, Table, TableBody, TableHeader, wrappable } from '@patternfly/react-table';
import { Criteria, Host, initCriteria, Iter8Info, NameValuePair } from '../../../../types/Iter8';
import * as React from 'react';
import {
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInputBase as TextInput
} from '@patternfly/react-core';
import { style } from 'typestyle';
import { PfColors } from '../../../../components/Pf/PfColors';
import history from '../../../../app/History';

const headerCells: ICell[] = [
  {
    title: 'Metric Name',
    transforms: [cellWidth(20) as any],
    props: {}
  },
  {
    title: 'Threshold',
    transforms: [wrappable],
    props: {}
  },
  {
    title: 'Threshold Type',
    transforms: [wrappable, cellWidth(20) as any],
    props: {}
  },
  {
    title: 'Stop on Failure',
    transforms: [wrappable],
    props: {}
  },
  {
    title: '',
    props: {}
  }
];

const toleranceType: NameValuePair[] = [
  {
    name: 'threshold',
    value: 'absolute'
  },
  {
    name: 'delta',
    value: 'delta'
  }
];

const noCriteriaStyle = style({
  marginTop: 15,
  marginBottom: 15,
  color: PfColors.Blue400,
  fontSize: '1.2em'
});

type Props = {
  iter8Info: Iter8Info;
  criterias: Criteria[];
  metricNames: string[];
  onAdd: (server: Criteria, host: Host) => void;
  onRemove: (type: string, index: number) => void;
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
      addCriteria: initCriteria(),
      validName: false
    };
  }

  // @ts-ignore
  actionResolver = (rowData, { rowIndex }) => {
    const removeAction = {
      title: 'Remove Criteria',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => {
        this.props.onRemove('Criteria', rowIndex);
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
        stopOnFailure: prevState.addCriteria.stopOnFailure,
        sampleSize: 5
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
        stopOnFailure: prevState.addCriteria.stopOnFailure,
        sampleSize: 5
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
        stopOnFailure: prevState.addCriteria.stopOnFailure,
        sampleSize: 5
      },
      validName: true
    }));
  };

  onAddStopOnFailure = () => {
    this.setState(prevState => ({
      addCriteria: {
        metric: prevState.addCriteria.metric,
        tolerance: prevState.addCriteria.tolerance,
        toleranceType: prevState.addCriteria.toleranceType,
        stopOnFailure: !prevState.addCriteria.stopOnFailure,
        sampleSize: 5
      },
      validName: true
    }));
  };

  onAddCriteria = () => {
    this.props.onAdd(this.state.addCriteria, { name: '', gateway: '' });
    this.setState({
      addCriteria: initCriteria()
    });
  };

  rows() {
    if (history.location.pathname.endsWith('/new')) {
      return this.props.criterias
        .map((gw, i) => ({
          key: 'criteria' + i,
          cells: [
            <>{gw.metric}</>,
            <>{gw.tolerance}</>,
            <>{gw.toleranceType === 'threshold' ? 'abosulte' : 'delta'}</>,
            <>{gw.stopOnFailure ? 'true' : 'false'}</>
          ]
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

              <FormGroup fieldId="addTolerancef" isValid={this.state.addCriteria.tolerance > 0}>
                <TextInput
                  id="addTolerance"
                  type="number"
                  value={this.state.addCriteria.tolerance}
                  placeholder="Tolerance"
                  onChange={value => this.onAddTolerance(value, '')}
                  isValid={!isNaN(Number(this.state.addCriteria.tolerance))}
                />
              </FormGroup>,

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
    } else {
      return this.props.criterias.map((gw, i) => ({
        key: 'criteria' + i,
        cells: [
          <>{gw.metric}</>,
          <>{gw.tolerance}</>,
          <>{gw.toleranceType === 'threshold' ? 'abosulte' : 'delta'}</>,
          <>{gw.stopOnFailure ? 'true' : 'false'}</>
        ]
      }));
    }
  }

  renderCriteriaForm() {
    return (
      <>
        <div>
          {this.props.criterias.length === 0 && (
            <span className={noCriteriaStyle}>(At least one criteria is needed)</span>
          )}
          <p>&nbsp;&nbsp;</p>
          <Form isHorizontal={true}>
            <FormGroup fieldId="name" label="Metric" isRequired={true}>
              <FormSelect
                value={this.state.addCriteria.metric}
                id="addMetricName"
                name="addMetricName"
                onChange={this.onAddMetricName}
                style={{ width: 'auto' }}
              >
                {this.props.metricNames.map((option, index) => (
                  <FormSelectOption isDisabled={false} key={'p' + index} value={option} label={option} />
                ))}
              </FormSelect>
            </FormGroup>

            <FormGroup label="Tolerance" fieldId="addTolerancef" isValid={this.state.addCriteria.tolerance > 0}>
              <TextInput
                id="addTolerance"
                type="number"
                value={this.state.addCriteria.tolerance}
                placeholder="Tolerance"
                onChange={value => this.onAddTolerance(value, '')}
                isValid={!isNaN(Number(this.state.addCriteria.tolerance))}
                style={{ width: 'auto' }}
              />
            </FormGroup>
            <FormGroup label="Protocol" fieldId="addPortProtocol" isValid={this.state.addCriteria.tolerance > 0}>
              <FormSelect
                value={this.state.addCriteria.toleranceType}
                id="addPortProtocol"
                name="addPortProtocol"
                onChange={this.onAddToleranceType}
                style={{ width: 'auto' }}
              >
                {toleranceType.map((option, index) => (
                  <FormSelectOption isDisabled={false} key={'p' + index} value={option.name} label={option.value} />
                ))}
              </FormSelect>
            </FormGroup>
            <FormGroup label="Protocol" fieldId="addPortProtocol" isValid={this.state.addCriteria.tolerance > 0}>
              <Checkbox
                label="Stop On Failure"
                id="stopOnFailure"
                name="stopOnFailure"
                aria-label="Stop On Failure"
                isChecked={this.state.addCriteria.stopOnFailure}
                onChange={this.onAddStopOnFailure}
              />
            </FormGroup>

            <>
              <Button
                style={{ paddingLeft: '6px' }}
                id="addServerBtn"
                variant="primary"
                isDisabled={this.state.addCriteria.metric.length === 0}
                onClick={this.onAddCriteria}
              >
                Add this Criteria
              </Button>
            </>
          </Form>
        </div>
      </>
    );
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
        {history.location.pathname.endsWith('/new') ? '' : this.renderCriteriaForm()}
      </>
    );
  }
}

export default ExperimentCriteriaForm;
