import * as React from 'react';
import { serverConfig } from '../../../config';
import { ServiceIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

interface Props {
  namespace: string;
  host: string;
  isValid: boolean;
}

export const serviceLink = (namespace: string, host: string, isValid: boolean): any => {
  if (!host) {
    return '-';
  }
  const isFqdn = host.endsWith('.' + serverConfig.istioIdentityDomain);
  const isShortName = host.split('.').length === 2;
  const showLink = isValid && (isFqdn || isShortName);
  if (showLink) {
    let linkNamespace = namespace;
    let linkService = host;
    if (isFqdn) {
      // FQDN format: service.namespace.svc.cluster.local
      const splitFqdn = host.split('.');
      linkService = splitFqdn[0];
      linkNamespace = splitFqdn[1];
    }
    return (
      <Link to={'/namespaces/' + linkNamespace + '/services/' + linkService}>
        {host + ' '}
        <ServiceIcon />
      </Link>
    );
  } else {
    return host;
  }
};

class ServiceLink extends React.PureComponent<Props> {
  render() {
    return serviceLink(this.props.namespace, this.props.host, this.props.isValid);
  }
}

export default ServiceLink;
