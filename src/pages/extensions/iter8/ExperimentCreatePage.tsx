import * as React from 'react';
import { Iter8Info } from '../../../types/Iter8';
import { style } from 'typestyle';
import { PfColors } from '../../../components/Pf/PfColors';
import { Link, RouteComponentProps } from 'react-router-dom';
import * as API from '../../../services/Api';
import * as AlertUtils from '../../../utils/AlertUtils';
import {
  ActionGroup,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  Text,
  TextInput,
  TextVariants
} from '@patternfly/react-core';
import history from '../../../app/History';
import { RenderContent } from '../../../components/Nav/Page';
import Namespace from '../../../types/Namespace';
import ExperimentCriteriaForm from './ExperimentCriteriaForm';
import { PromisesRegistry } from '../../../utils/CancelablePromises';

interface Props {
  experimentName: string;
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
const containerWhite = style({ backgroundColor: PfColors.White });
const paddingLeft = style({ paddingLeft: '20px' });

const algorithms = [
  'check_and_increment',
  'epsilon_greedy',
  'increment_without_check',
  ' posterior_bayesian_routing',
  'optimistic_bayesian_routing'
];

class ExperimentCreatePage extends React.Component<RouteComponentProps<Props>, State> {
  private promises = new PromisesRegistry();

  constructor(props: RouteComponentProps<Props>) {
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

  // Get available namespaces first
  componentDidMount() {
    this.updateNamespaces();
  }

  // Page title for creating new experiment, no namespace dropdown
  // as it is selected inside the form
  pageTitle = (title: string) => (
    <>
      <div className={`breadcrumb ${containerWhite} ${paddingLeft}`}>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={'/extensions/iter8/list'}>Iter8 Experiments</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive={true}>{title}</BreadcrumbItem>
        </Breadcrumb>
        <Text component={TextVariants.h1}>{title}</Text>
      </div>
    </>
  );

  // Invoke the history object to update and URL and start a routing
  goExperimentsPage = () => {
    history.push('/extensions/iter8/list');
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
        case 'algorithm':
          newExperiment.trafficControl.algorithm = value.trim();
          break;
        case 'metricName':
          newExperiment.criterias[0].metric = value.trim();
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
    } else {
      API.updateExperiment(
        this.state.experiment.namespace,
        this.state.experiment.name,
        JSON.stringify(this.state.experiment)
      )
        .then(_ => this.goExperimentsPage())
        .catch(error => AlertUtils.addError('Could not update Experiment', error));
    }
  };

  updateNamespaces() {
    this.promises.cancelAll();
    let arr: string[];
    this.promises
      .register('namespaces', API.getNamespaces())
      .then(namespacesResponse => {
        const namespacesdata: Namespace[] = namespacesResponse.data;
        arr = [];
        for (let ns of namespacesdata.map(namespace => namespace.name)) {
          arr.push(ns);
        }
        this.setState({
          namespaces: arr
        });
      })
      .catch(namespacesError => {
        if (!namespacesError.isCanceled) {
          AlertUtils.addError('Could not fetch namespaces', namespacesError);
        }
      });
  }

  render() {
    const title = 'Create New Experiment';

    // @ts-ignore
    return (
      <>
        {this.pageTitle(title)}
        <RenderContent>
          <div className={containerPadding}>
            <Form isHorizontal={true}>
              <FormGroup
                fieldId="name"
                label="Experiment Name :"
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
                    label="Target Service :"
                    isValid={this.state.experiment.service !== ''}
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
                    fieldId="namespace"
                    label="Namespace :"
                    isValid={this.state.experiment.namespace !== ''}
                    helperText="Namespace of the service"
                  >
                    <FormSelect
                      value={this.state.experiment.namespace}
                      id="namespace"
                      name="Namespace"
                      onChange={value => this.changeExperiment('namespace', value)}
                    >
                      {this.state.namespaces.map((option, index) => (
                        <FormSelectOption isDisabled={false} key={'p' + index} value={option} label={option} />
                      ))}
                    </FormSelect>
                  </FormGroup>
                </GridItem>
              </Grid>
              <Grid gutter="md">
                <GridItem span={6}>
                  <FormGroup
                    fieldId="baseline"
                    label="Baseline :"
                    isValid={this.state.experiment.baseline !== ''}
                    helperTextInvalid="Baseline cannot be empty"
                  >
                    <TextInput
                      id="baseline"
                      value={this.state.experiment.baseline}
                      placeholder="Service Name"
                      onChange={value => this.changeExperiment('baseline', value)}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup
                    fieldId="candidate"
                    label="Candidate :"
                    isValid={this.state.experiment.candidate !== ''}
                    helperTextInvalid="Candidate cannot be empty"
                  >
                    <TextInput
                      id="candidate"
                      value={this.state.experiment.candidate}
                      placeholder="Service Name"
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
                    label="Interval :"
                    isValid={this.state.experiment.trafficControl.interval !== ''}
                    helperText="frequency with which the controller calls the analytics service"
                  >
                    <TextInput
                      id="interval"
                      value={this.state.experiment.trafficControl.interval}
                      placeholder="Service Name"
                      onChange={value => this.changeExperimentNumber('interval', Number(value))}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup
                    fieldId="maxIteration"
                    label="Maximum Iteration :"
                    isValid={isNaN(this.state.experiment.trafficControl.maxIteration)}
                    helperText="Default is 100"
                  >
                    <TextInput
                      id="maxIteration"
                      value={this.state.experiment.trafficControl.maxIteration}
                      placeholder="Maximum Iteration "
                      onChange={value => this.changeExperimentNumber('maxIteration', Number(value))}
                    />
                  </FormGroup>
                </GridItem>
              </Grid>
              <Grid gutter="md">
                <GridItem span={6}>
                  <FormGroup
                    fieldId="maxTrafficPercentage"
                    label="Maximum Traffic Percentage :"
                    isValid={isNaN(this.state.experiment.trafficControl.maxTrafficPercentage)}
                    helperText="Default is 50"
                  >
                    <TextInput
                      id="maxTrafficPercentage"
                      value={this.state.experiment.trafficControl.maxTrafficPercentage}
                      placeholder="Service Name"
                      onChange={value => this.changeExperimentNumber('maxTrafficPercentage', parseFloat(value))}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup
                    fieldId="maxTrafficPercentage"
                    label="Maximum Traffic Percentage :"
                    isValid={isNaN(this.state.experiment.trafficControl.trafficStepSize)}
                    helperText="Default is 2"
                  >
                    <TextInput
                      id="maxTrafficPercentage"
                      value={this.state.experiment.trafficControl.trafficStepSize}
                      placeholder="Service Name"
                      onChange={value => this.changeExperimentNumber('trafficStepSize', parseFloat(value))}
                    />
                  </FormGroup>
                </GridItem>
              </Grid>
              <FormGroup
                fieldId="algorithm"
                label="Algorithm :"
                isValid={this.state.experiment.trafficControl.algorithm !== ''}
                helperText="Default to check_and_increment"
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
                    <Button variant={ButtonVariant.primary} onClick={this.createExperiment}>
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

export default ExperimentCreatePage;
