import * as React from 'react';
import { Button, Wizard } from 'patternfly-react';
import { WorkloadOverview } from '../../types/ServiceInfo';
import * as API from '../../services/Api';
import * as MessageCenter from '../../utils/MessageCenter';
import MatchingRouting from './MatchingRouting';
import WeightedRouting, { WorkloadWeight } from './WeightedRouting';
import TrafficPolicyConnected from '../../containers/TrafficPolicyContainer';
import { DISABLE, ROUND_ROBIN } from './TrafficPolicy';
import SuspendTraffic, { SuspendedRoute } from './SuspendTraffic';
import { Rule } from './MatchingRouting/Rules';
import {
  createIstioTraffic,
  WIZARD_MATCHING_ROUTING,
  WIZARD_SUSPEND_TRAFFIC,
  WIZARD_TITLES,
  WIZARD_WEIGHTED_ROUTING,
  WizardProps,
  WizardState
} from './IstioWizardActions';

class IstioWizard extends React.Component<WizardProps, WizardState> {
  constructor(props: WizardProps) {
    super(props);
    this.state = {
      showWizard: false,
      workloads: [],
      rules: [],
      suspendedRoutes: [],
      valid: true,
      mtlsMode: DISABLE,
      tlsModified: false,
      loadBalancer: ROUND_ROBIN,
      lbModified: false
    };
  }

  componentDidUpdate(prevProps: WizardProps) {
    if (prevProps.show !== this.props.show || !this.compareWorkloads(prevProps.workloads, this.props.workloads)) {
      let isValid: boolean;
      switch (this.props.type) {
        // By default the rule of Weighted routing should be valid
        case WIZARD_WEIGHTED_ROUTING:
          isValid = true;
          break;
        // By default no rules is a no valid scenario
        case WIZARD_MATCHING_ROUTING:
          isValid = false;
          break;
        case WIZARD_SUSPEND_TRAFFIC:
        default:
          isValid = true;
          break;
      }
      this.setState({
        showWizard: this.props.show,
        workloads: [],
        rules: [],
        valid: isValid,
        mtlsMode: DISABLE,
        loadBalancer: ROUND_ROBIN
      });
    }
  }

  compareWorkloads = (prev: WorkloadOverview[], current: WorkloadOverview[]): boolean => {
    if (prev.length !== current.length) {
      return false;
    }
    for (let i = 0; i < prev.length; i++) {
      if (!current.includes(prev[i])) {
        return false;
      }
    }
    return true;
  };

  onClose = () => {
    this.setState({
      showWizard: false
    });
    this.props.onClose(false);
  };

  onCreate = () => {
    const [dr, vr] = createIstioTraffic(this.props, this.state);
    const createDR = API.createIstioConfigDetail(this.props.namespace, 'destinationrules', JSON.stringify(dr));
    const createVS = API.createIstioConfigDetail(this.props.namespace, 'virtualservices', JSON.stringify(vr));
    // Disable button before promise is completed. Then Wizard is closed.
    this.setState({
      valid: false
    });
    Promise.all([createDR, createVS])
      .then(results => {
        this.props.onClose(true);
      })
      .catch(error => {
        MessageCenter.add(API.getErrorMsg('Could not create Istio config objects', error));
        this.props.onClose(true);
      });
  };

  onTLS = (mTLS: string) => {
    this.setState({
      mtlsMode: mTLS,
      tlsModified: true
    });
  };

  onLoadBalancer = (simple: string) => {
    this.setState({
      loadBalancer: simple,
      lbModified: true
    });
  };

  onWeightsChange = (valid: boolean, workloads: WorkloadWeight[], reset: boolean) => {
    this.setState({
      valid: valid,
      workloads: workloads
    });
  };

  onRulesChange = (valid: boolean, rules: Rule[]) => {
    this.setState({
      valid: valid,
      rules: rules
    });
  };

  onSuspendedChange = (valid: boolean, suspendedRoutes: SuspendedRoute[]) => {
    this.setState({
      valid: valid,
      suspendedRoutes: suspendedRoutes
    });
  };

  render() {
    return (
      <Wizard show={this.state.showWizard} onHide={this.onClose}>
        <Wizard.Header onClose={this.onClose} title={WIZARD_TITLES[this.props.type]} />
        <Wizard.Body>
          <Wizard.Row>
            <Wizard.Main>
              <Wizard.Contents stepIndex={0} activeStepIndex={0}>
                {this.props.type === WIZARD_WEIGHTED_ROUTING && (
                  <WeightedRouting
                    serviceName={this.props.serviceName}
                    workloads={this.props.workloads}
                    onChange={this.onWeightsChange}
                  />
                )}
                {this.props.type === WIZARD_MATCHING_ROUTING && (
                  <MatchingRouting
                    serviceName={this.props.serviceName}
                    workloads={this.props.workloads}
                    onChange={this.onRulesChange}
                  />
                )}
                {this.props.type === WIZARD_SUSPEND_TRAFFIC && (
                  <SuspendTraffic
                    serviceName={this.props.serviceName}
                    workloads={this.props.workloads}
                    onChange={this.onSuspendedChange}
                  />
                )}
                <TrafficPolicyConnected
                  mtlsMode={this.state.mtlsMode}
                  loadBalancer={this.state.loadBalancer}
                  onTlsChange={this.onTLS}
                  onLoadbalancerChange={this.onLoadBalancer}
                  expanded={false}
                  nsWideStatus={this.props.tlsStatus}
                />
              </Wizard.Contents>
            </Wizard.Main>
          </Wizard.Row>
        </Wizard.Body>
        <Wizard.Footer>
          <Button bsStyle="default" className="btn-cancel" onClick={this.onClose}>
            Cancel
          </Button>
          <Button disabled={!this.state.valid} bsStyle="primary" onClick={this.onCreate}>
            Create
          </Button>
        </Wizard.Footer>
      </Wizard>
    );
  }
}

export default IstioWizard;
