import * as React from 'react';
import { DestinationRule, VirtualService } from '../../types/ServiceInfo';
import { Validations } from '../../types/IstioObjects';
import { Col, Nav, NavItem, Row, TabContainer, TabContent, TabPane } from 'patternfly-react';
import VirtualServiceDetail from './ServiceInfo/IstioObjectDetails/VirtualServiceDetail';
import DestinationRuleDetail from './ServiceInfo/IstioObjectDetails/DestinationRuleDetail';
import './ServiceInfo/IstioObjectDetails/IstioObjectDetails.css';
import IstioActionDropdown from '../../components/IstioActions/IstioActionsDropdown';
import { ResourcePermissions } from '../../types/Permissions';

type IstioObjectDetailsProps = {
  namespace: string;
  object: VirtualService | DestinationRule;
  validations: Validations;
  onSelectTab: (tabName: string, tabKey?: string) => void;
  activeTab: (tabName: string, whenEmpty: string) => string;
  servicePageURL: string;
  permissions: ResourcePermissions;
  onDelete: () => void;
};

type IstioObjectDetailsState = {
  validationsParsed: boolean;
  yamlEditor: string;
};

export default class IstioObjectDetails extends React.Component<IstioObjectDetailsProps, IstioObjectDetailsState> {
  constructor(props: IstioObjectDetailsProps) {
    super(props);
    this.state = {
      yamlEditor: '',
      validationsParsed: false
    };
  }

  isIstioObjectWithOverview() {
    return this.isVirtualService() || this.isDestinationRule();
  }

  isVirtualService() {
    return this.typeIstioObject() === 'VirtualService';
  }

  isDestinationRule() {
    return this.typeIstioObject() === 'DestinationRule';
  }

  navigateToIstioObject = () => {
    window.open(
      `/namespaces/${this.props.namespace}/istio/${this.typeIstioObject().toLowerCase()}s/${this.props.object.name}`,
      '_self'
    );
  };

  typeIstioObject() {
    if ('tcp' in this.props.object && 'http' in this.props.object) {
      return 'VirtualService';
    }
    return 'DestinationRule';
  }
  overviewDetail() {
    const istioObj: VirtualService | DestinationRule = this.props.object as VirtualService | DestinationRule;
    switch (this.typeIstioObject()) {
      case 'VirtualService':
        return (
          <VirtualServiceDetail
            virtualService={istioObj}
            validations={this.props.validations['virtualservice']}
            namespace={this.props.namespace}
          />
        );
      case 'DestinationRule':
        return (
          <DestinationRuleDetail
            destinationRule={istioObj}
            validations={this.props.validations['destinationRule']}
            namespace={this.props.namespace}
          />
        );
      default:
        return null;
    }
  }

  renderTabNav() {
    return (
      <>
        <Nav bsClass="nav nav-tabs nav-tabs-pf">
          {this.isIstioObjectWithOverview() && (
            <NavItem eventKey="overview">
              <div>Overview</div>
            </NavItem>
          )}
          <NavItem eventKey="yaml" onClick={this.navigateToIstioObject}>
            <div>YAML</div>
          </NavItem>
        </Nav>
      </>
    );
  }

  render() {
    const defaultDetailTab = this.isIstioObjectWithOverview() ? 'overview' : 'yaml';
    return (
      <div className="container-fluid container-cards-pf">
        <div style={{ float: 'right' }}>
          <IstioActionDropdown
            objectName={this.props.object.name}
            canDelete={this.props.permissions.delete}
            onDelete={this.props.onDelete}
          />
        </div>
        <Row className="row-cards-pf">
          <Col>
            <TabContainer
              id="basic-tabs"
              activeKey={this.props.activeTab('detail', defaultDetailTab)}
              onSelect={this.props.onSelectTab('detail')}
            >
              <>
                {this.renderTabNav()}
                <TabContent>
                  {this.isIstioObjectWithOverview() && <TabPane eventKey="overview">{this.overviewDetail()}</TabPane>}
                </TabContent>
              </>
            </TabContainer>
          </Col>
        </Row>
      </div>
    );
  }
}
