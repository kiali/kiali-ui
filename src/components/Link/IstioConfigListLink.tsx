import * as React from 'react';
import { Link } from 'react-router-dom';
import { Paths } from '../../config';

interface Props {
  namespaces: string[];
  errors?: boolean;
  warnings?: boolean;
}

class IstioConfigListLink extends React.Component<Props> {
  namespacesToParams = () => {
    let param: string = '';
    if (this.props.namespaces.length > 0) {
      param = 'namespaces=' + this.props.namespaces.join(',');
    }
    return param;
  };

  validationToParams = () => {
    let params: string = '';

    if(this.props.warnings) {
      params += 'configvalidation=Warning';
    }

    if(params !== '') {
      params += '&'
    }

    if(this.props.errors) {
      params += 'configvalidation=Not+Valid';
    }

    return params;
  };

  render() {
    let params: string = this.namespacesToParams();
    if(params !== '') { params += '&'; }
    params += this.validationToParams();

    return (
      <Link to={`/${Paths.ISTIO}?${params}`}>
        {this.props.children}
      </Link>
    )
  }
}


export default IstioConfigListLink;
