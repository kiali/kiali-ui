import * as React from 'react';
import IstioObjectLink from './IstioObjectLink';
import IstioConfigListLink from './IstioConfigListLink';

interface Props {
  namespace: string;
  errors: number;
  warnings: number;
  objectCount?: number;
  configType?: string;
  configName?: string;
}

class ValidationSummaryLink extends React.PureComponent<Props> {

  hasIstioObjects = () => {
    return this.props.objectCount && this.props.objectCount > 0;
  };

  configDescriptorIsPresent = () => {
    return !!this.props.configName && !!this.props.configType;
  };

  validationCount = () => {
    return this.props.errors + this.props.warnings;
  };

  showIstioListLink = () => {
    return this.validationCount() < 1 || this.validationCount() > 1;
  };

  render() {
    let link: any = <div style={{ marginLeft: '5px' }}>N/A</div>;

    if(this.hasIstioObjects()) {
      if (this.showIstioListLink() || !this.configDescriptorIsPresent()) {
        let showWarnings: boolean = false;
        let showErrors: boolean = false;

        if (this.validationCount() > 0) {
          showWarnings = true;
          showErrors = true;
        }

        link = (
          <IstioConfigListLink namespaces={[this.props.namespace]} warnings={showWarnings} errors={showErrors}>
            {this.props.children}
          </IstioConfigListLink>
        );
      }
      else {
        link = (
          <IstioObjectLink namespace={this.props.namespace} name={this.props.configName || ''} type={this.props.configType || ''}>
            {this.props.children}
          </IstioObjectLink>
        );
      }
    }

    return link;
  }
}

export default ValidationSummaryLink;
