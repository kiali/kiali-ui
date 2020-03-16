import * as React from 'react';
import { Iter8Info } from '../../../../types/Iter8';
import { style } from 'typestyle';
import * as API from '../../../../services/Api';
import * as AlertUtils from '../../../../utils/AlertUtils';
import {
  ActionGroup,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  TextInput
} from '@patternfly/react-core';
import history from '../../../../app/History';
import { RenderContent } from '../../../../components/Nav/Page';
import Namespace from '../../../../types/Namespace';
import ExperimentCriteriaForm from './ExperimentCriteriaForm';
import { PromisesRegistry } from '../../../../utils/CancelablePromises';
import { KialiAppState } from '../../../../store/Store';
import { activeNamespacesSelector } from '../../../../store/Selectors';
import { connect } from 'react-redux';

interface Props {
  activeNamespaces: Namespace[];
}

interface State {
  isNew: boolean;
  isModified: boolean;
  iter8Info: Iter8Info;
  experiment: ExperimentSpec;
  namespaces: string[];
}

interface ExperimentSpec {
  name: string;
  namespace: string;
  service: string;
  apiversion: string;
  baseline: string;
  candidate: string;
  // canaryVersion: string;
  trafficControl: TrafficControl;
  criterias: Criteria[];
}

interface TrafficControl {
  algorithm: string;
  interval: string;
  maxIteration: number;
  maxTrafficPercentage: number;
  trafficStepSize: number;
}

export interface Criteria {
  metric: string;
  toleranceType: string;
  tolerance: number;
  sampleSize: number;
  stopOnFailure: boolean;
}

// Style constants
const containerPadding = style({ padding: '20px 20px 20px 20px' });

const algorithms = [
  'check_and_increment',
  'epsilon_greedy',
  'increment_without_check',
  ' posterior_bayesian_routing',
  'optimistic_bayesian_routing'
];

class ExperimentCreatePage extends React.Component<Props, State> {
  private promises = new PromisesRegistry();

  constructor(props: Props) {
    super(props);

    this.state = {
      isNew: true,
      isModified: false,
      iter8Info: {
        enabled: false,
        permissions: {
          create: true,
          update: true,
          delete: true
        }
      },

      experiment: {
        name: '',
        namespace: 'default',
        apiversion: 'v1',
        service: '',
        baseline: '',
        candidate: '',
        trafficControl: {
          algorithm: 'check_and_increment',
          interval: '30s',
          maxIteration: 100,
          maxTrafficPercentage: 50,
          trafficStepSize: 2
        },

        criterias: []
      },
      namespaces: []
    };
  }

  componentWillUnmount() {
    this.promises.cancelAll();
  }

  // Invoke the history object to update and URL and start a routing
  goExperimentsPage = () => {
    history.push('/extensions/iter8');
  };

  // Updates state with modifications of the new/editing handler
  changeExperiment = (field: string, value: string) => {
    this.setState(prevState => {
      const newExperiment = prevState.experiment;
      switch (field) {
        case 'name':
          newExperiment.name = value.trim();
          break;
        case 'namespace':
          newExperiment.namespace = value.trim();
          break;
        case 'service':
          newExperiment.service = value.trim();
          break;
        case 'algorithm':
          newExperiment.trafficControl.algorithm = value.trim();
          break;
        case 'baseline':
          newExperiment.baseline = value.trim();
          break;
        case 'candidate':
          newExperiment.candidate = value.trim();
          break;
        case 'kubernets':
          newExperiment.apiversion = 'v1';
          break;
        case 'knative':
          newExperiment.apiversion = 'serving.knative.dev/v1alpha1';
          break;
        case 'metricName':
          newExperiment.criterias[0].metric = value.trim();
          break;
        case 'toleranceType':
          newExperiment.criterias[0].toleranceType = value.trim();
          break;
        case 'interval':
          newExperiment.trafficControl.interval = value.trim();
          break;
        default:
      }
      return {
        isNew: prevState.isNew,
        isModified: true,
        experiment: newExperiment
      };
    });
  };

  // Updates state with modifications of the new/editing handler
  changeExperimentNumber = (field: string, value: number) => {
    this.setState(prevState => {
      const newExperiment = prevState.experiment;
      switch (field) {
        case 'maxIteration':
          newExperiment.trafficControl.maxIteration = value;
          break;
        case 'maxTrafficPercentage':
          newExperiment.trafficControl.maxTrafficPercentage = value;
          break;
        case 'trafficStepSize':
          newExperiment.trafficControl.trafficStepSize = value;
          break;
        case 'sampleSize':
          newExperiment.criterias[0].sampleSize = value;
          break;
        case 'tolerance':
          newExperiment.criterias[0].tolerance = value;
          break;
        default:
      }
      return {
        isNew: prevState.isNew,
        isModified: true,
        experiment: newExperiment
      };
    });
  };

  // It invokes backend to create  a new experiment
  createExperiment = () => {
    if (this.state.isNew) {
      API.createExperiment(JSON.stringify(this.state.experiment))
        .then(_ => this.goExperimentsPage())
        .catch(error => AlertUtils.addError('Could not create Experiment.', error));
    }
  };

  updateExperiment = () => {
    API.updateExperiment(
      this.state.experiment.namespace,
      this.state.experiment.name,
      JSON.stringify(this.state.experiment)
    )
      .then(_ => this.goExperimentsPage())
      .catch(error => AlertUtils.addError('Could not update Experiment', error));
  };

  isMainFormValid = (): boolean => {
    return (
      this.state.experiment.name !== '' &&
      this.state.experiment.service !== '' &&
      this.props.activeNamespaces.length == 1 &&
      this.state.experiment.baseline !== '' &&
      this.state.experiment.candidate !== ''
    );
  };

  isTCFormValid = (): boolean => {
    return (
      this.state.experiment.trafficControl.interval !== '' && this.state.experiment.trafficControl.maxIteration > 0
    );
  };

  isSCFormValid = (): boolean => {
    return this.state.experiment.criterias.length > 0;
  };

  render() {
    const isNamespacesValid = this.props.activeNamespaces.length == 1;
    const isFormValid = this.isMainFormValid() && this.isTCFormValid() && this.isSCFormValid();
    // @ts-ignore
    return (
      <>
        <RenderContent>
          <div className={containerPadding}>
            <Form isHorizontal={true}>
              <FormGroup
                fieldId="name"
                label="Experiment Name"
                isValid={this.state.experiment.name !== ''}
                helperTextInvalid="Name cannot be empty"
              >
                <TextInput
                  id="name"
                  value={this.state.experiment.name}
                  placeholder="Exteriment Name"
                  onChange={value => this.changeExperiment('name', value)}
                />
              </FormGroup>

              <Grid gutter="md">
                <GridItem span={6}>
                  <FormGroup
                    fieldId="service"
                    label="Target Service"
                    isValid={this.state.experiment.service !== ''}
                    helperText="Target Service specifies the reference to experiment targets (i.e. reviews)"
                    helperTextInvalid="Target Service cannot be empty"
                  >
                    <TextInput
                      id="service"
                      value={this.state.experiment.service}
                      placeholder="Target Service"
                      onChange={value => this.changeExperiment('service', value)}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup
                    label="Namespaces"
                    isRequired={true}
                    fieldId="namespaces"
                    helperText={'Select namespace where this configuration will be applied'}
                    helperTextInvalid={'Only one namespace should be selected'}
                    isValid={isNamespacesValid}
                  >
                    <TextInput
                      value={this.props.activeNamespaces.map(n => n.name).join(',')}
                      isRequired={true}
                      type="text"
                      id="namespaces"
                      aria-describedby="namespaces"
                      name="namespaces"
                      isDisabled={true}
                      isValid={isNamespacesValid}
                    />
                  </FormGroup>
                </GridItem>
              </Grid>
              <Grid gutter="md">
                <GridItem span={6}>
                  <FormGroup
                    fieldId="baseline"
                    label="Baseline"
                    isValid={this.state.experiment.baseline !== ''}
                    helperText="The baseline deployment of the target service (i.e. reviews-v1)"
                    helperTextInvalid="Baseline deployment cannot be empty"
                  >
                    <TextInput
                      id="baseline"
                      value={this.state.experiment.baseline}
                      placeholder="Deployment name"
                      onChange={value => this.changeExperiment('baseline', value)}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup
                    fieldId="candidate"
                    label="Candidate"
                    isValid={this.state.experiment.candidate !== ''}
                    helperText="The candidate deployment of the target service (i.e. reviews-v2)"
                    helperTextInvalid="Candidate deployment cannot be empty"
                  >
                    <TextInput
                      id="candidate"
                      value={this.state.experiment.candidate}
                      placeholder="Deployment name"
                      onChange={value => this.changeExperiment('candidate', value)}
                    />
                  </FormGroup>
                </GridItem>
              </Grid>
              <hr />
              <h1 className="pf-c-title pf-m-xl">Traffic Control</h1>
              <Grid gutter="md">
                <GridItem span={6}>
                  <FormGroup
                    fieldId="interval"
                    label="Interval"
                    isValid={this.state.experiment.trafficControl.interval !== ''}
                    helperText="Frequency with which the controller calls the analytics service"
                    helperTextInvalid="Interval cannot be empty"
                  >
                    <TextInput
                      id="interval"
                      value={this.state.experiment.trafficControl.interval}
                      placeholder="Time interval i.e. 30s"
                      onChange={value => this.changeExperiment('interval', value)}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup
                    fieldId="maxIteration"
                    label="Maximum Iteration"
                    isValid={this.state.experiment.trafficControl.maxIteration > 0}
                    helperText="Maximum number of iterations for this experiment"
                    helperTextInvalid="Maximun Iteration cannot be empty"
                  >
                    <TextInput
                      id="maxIteration"
                      type="number"
                      value={this.state.experiment.trafficControl.maxIteration}
                      placeholder="Maximum Iteration"
                      onChange={value => this.changeExperimentNumber('maxIteration', Number(value))}
                    />
                  </FormGroup>
                </GridItem>
              </Grid>
              <Grid gutter="md">
                <GridItem span={6}>
                  <FormGroup
                    fieldId="maxTrafficPercentage"
                    label="Maximum Traffic Percentage"
                    isValid={
                      this.state.experiment.trafficControl.maxTrafficPercentage >= 0 &&
                      this.state.experiment.trafficControl.maxTrafficPercentage <= 100
                    }
                    helperText="The maximum traffic percentage to send to the candidate during an experiment"
                    helperTextInvalid="Maximum Traffic Percentage must be between 0 and 100"
                  >
                    <TextInput
                      id="maxTrafficPercentage"
                      type="number"
                      value={this.state.experiment.trafficControl.maxTrafficPercentage}
                      placeholder="Service Name"
                      onChange={value => this.changeExperimentNumber('maxTrafficPercentage', parseFloat(value))}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup
                    fieldId="trafficStepSize"
                    label="Traffic Step Size"
                    isValid={this.state.experiment.trafficControl.trafficStepSize > 0}
                    helperText="The maximum traffic increment per iteration"
                    helperTextInvalid="Traffic Step Size must be > 0"
                  >
                    <TextInput
                      id="trafficStepSize"
                      value={this.state.experiment.trafficControl.trafficStepSize}
                      placeholder="Traffic Step Size"
                      onChange={value => this.changeExperimentNumber('trafficStepSize', parseFloat(value))}
                    />
                  </FormGroup>
                </GridItem>
              </Grid>
              <FormGroup
                fieldId="algorithm"
                label="Algorithm"
                helperText="Strategy used to analyze the candidate and shift the traffic"
              >
                <FormSelect
                  value={this.state.experiment.trafficControl.algorithm}
                  id="algorithm"
                  name="Algorithm"
                  onChange={value => this.changeExperiment('algorithm', value)}
                >
                  {algorithms.map((option, index) => (
                    <FormSelectOption isDisabled={false} key={'p' + index} value={option} label={option} />
                  ))}
                </FormSelect>
              </FormGroup>
              <hr />
              <h1 className="pf-c-title pf-m-xl">Success Criteria</h1>
              <ExperimentCriteriaForm
                criterias={this.state.experiment.criterias}
                onAdd={newCriteria => {
                  this.setState(prevState => {
                    prevState.experiment.criterias.push(newCriteria);
                    return {
                      isNew: prevState.isNew,
                      isModified: prevState.isModified,
                      iter8Info: prevState.iter8Info,
                      experiment: {
                        name: prevState.experiment.name,
                        namespace: prevState.experiment.namespace,
                        service: prevState.experiment.service,
                        apiversion: prevState.experiment.apiversion,
                        baseline: prevState.experiment.baseline,
                        candidate: prevState.experiment.candidate,
                        trafficControl: prevState.experiment.trafficControl,
                        criterias: prevState.experiment.criterias
                      }
                    };
                  });
                }}
                onRemove={index => {
                  this.setState(prevState => {
                    prevState.experiment.criterias.splice(index, 1);
                    return {
                      isNew: prevState.isNew,
                      isModified: prevState.isModified,
                      iter8Info: prevState.iter8Info,
                      experiment: {
                        name: prevState.experiment.name,
                        namespace: prevState.experiment.namespace,
                        service: prevState.experiment.service,
                        apiversion: prevState.experiment.apiversion,
                        baseline: prevState.experiment.baseline,
                        candidate: prevState.experiment.candidate,
                        trafficControl: prevState.experiment.trafficControl,
                        criterias: prevState.experiment.criterias
                      }
                    };
                  });
                }}
              />
              <ActionGroup>
                <span style={{ float: 'left', paddingTop: '10px', paddingBottom: '10px' }}>
                  <span style={{ paddingRight: '5px' }}>
                    <Button
                      variant={ButtonVariant.primary}
                      isDisabled={!isFormValid}
                      onClick={() => this.createExperiment()}
                    >
                      Create
                    </Button>
                  </span>
                  <span style={{ paddingRight: '5px' }}>
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={() => {
                        this.goExperimentsPage();
                      }}
                    >
                      Cancel
                    </Button>
                  </span>
                </span>
              </ActionGroup>
            </Form>
          </div>
        </RenderContent>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  activeNamespaces: activeNamespacesSelector(state)
});

const ExperimentCreatePageContainer = connect(
  mapStateToProps,
  null
)(ExperimentCreatePage);

export default ExperimentCreatePageContainer;
