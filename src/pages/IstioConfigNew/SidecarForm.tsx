import * as React from 'react';
import { ICell, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { style } from 'typestyle';
import { PfColors } from '../../components/Pf/PfColors';
import { Button, FormGroup, Switch, TextInput } from '@patternfly/react-core';

const headerCells: ICell[] = [
  {
    title: 'Egress Host',
    props: {}
  },
  {
    title: '',
    props: {}
  }
];

const noEgressHostsStyle = style({
  marginTop: 15,
  color: PfColors.Red100
});

export type EgressHost = {
  host: string;
};

type Props = {
  egressHosts: EgressHost[];
  onAdd: (host: EgressHost) => void;
  onRemove: (index: number) => void;
};

type State = {
  addEgressHost: EgressHost;
  addWorkloadSelector: boolean;
  workloadSelectorValid: boolean;
  workloadSelectorLabels: string;
};

class SidecarForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      addEgressHost: {
        host: ''
      },
      addWorkloadSelector: false,
      workloadSelectorValid: false,
      workloadSelectorLabels: ''
    };
  }

  // @ts-ignore
  actionResolver = (rowData, { rowIndex }) => {
    const removeAction = {
      title: 'Remove Server',
      // @ts-ignore
      onClick: (event, rowIndex, rowData, extraData) => {
        this.props.onRemove(rowIndex);
      }
    };
    if (rowIndex < this.props.egressHosts.length) {
      return [removeAction];
    }
    return [];
  };

  onAddHost = (value: string, _) => {
    this.setState({
      addEgressHost: {
        host: value.trim()
      }
    });
  };

  onAddEgressHost = () => {
    this.props.onAdd(this.state.addEgressHost);
    this.setState({
      addEgressHost: {
        host: ''
      }
    });
  };

  addWorkloadLabels = (value: string, _) => {
    if (value.length === 0) {
      this.setState({
        workloadSelectorValid: false,
        workloadSelectorLabels: ''
      });
      return;
    }
    value = value.trim();
    const labels: string[] = value.split(',');
    let isValid = true;
    // Some smoke validation rules for the labels
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (label.indexOf('=') < 0) {
        isValid = false;
        break;
      }
      const splitLabel: string[] = label.split('=');
      if (splitLabel.length !== 2) {
        isValid = false;
        break;
      }
      if (splitLabel[0].trim().length === 0 || splitLabel[1].trim().length === 0) {
        isValid = false;
        break;
      }
    }
    this.setState({
      workloadSelectorValid: isValid,
      workloadSelectorLabels: value
    });
  };

  rows() {
    return this.props.egressHosts
      .map((eHost, i) => ({
        key: 'eH' + i,
        cells: [<>{eHost.host}</>, '']
      }))
      .concat([
        {
          key: 'egressHostNew',
          cells: [
            <>
              <TextInput
                value={this.state.addEgressHost.host}
                type="text"
                id="addEgressHost"
                aria-describedby="add egress host"
                name="addHost"
                onChange={this.onAddHost}
                isValid={this.state.addEgressHost.host.length > 0}
              />
            </>,
            <>
              <Button
                variant="secondary"
                isDisabled={this.state.addEgressHost.host.length === 0}
                onClick={this.onAddEgressHost}
              >
                Add Egress Host
              </Button>
            </>
          ]
        }
      ]);
  }

  render() {
    return (
      <>
        Egress hosts defined:
        <Table
          aria-label="Egress Hosts"
          cells={headerCells}
          rows={this.rows()}
          // @ts-ignore
          actionResolver={this.actionResolver}
        >
          <TableHeader />
          <TableBody />
        </Table>
        <FormGroup label="Add Workload Selector" fieldId="workloadSelectorSwitch">
          <Switch
            id="workloadSelectorSwitch"
            label={' '}
            labelOff={' '}
            isChecked={this.state.addWorkloadSelector}
            onChange={() => {
              this.setState(prevState => ({
                addWorkloadSelector: !prevState.addWorkloadSelector
              }));
            }}
          />
        </FormGroup>
        {this.state.addWorkloadSelector && (
          <FormGroup
            fieldId="workloadLabels"
            label="Labels"
            helperText="One or more labels to select a workload where Sidecar is applied. Enter a label in the format <label>=<value>. Enter one or multiple labels separated by comma."
            helperTextInvalid="Invalid labels format: One or more labels to select a workload where Sidecar is applied. Enter a label in the format <label>=<value>. Enter one or multiple labels separated by comma."
            isValid={this.state.workloadSelectorValid}
          >
            <TextInput
              id="gwHosts"
              name="gwHosts"
              isDisabled={!this.state.addWorkloadSelector}
              value={this.state.workloadSelectorLabels}
              onChange={this.addWorkloadLabels}
              isValid={this.state.workloadSelectorValid}
            />
          </FormGroup>
        )}
        {this.props.egressHosts.length === 0 && (
          <div className={noEgressHostsStyle}>Sidecar has no Egress Hosts Defined</div>
        )}
      </>
    );
  }
}

export default SidecarForm;
