import * as React from 'react';
import ServiceListComponent from './ServiceListComponent';
import * as MessageCenter from '../../utils/MessageCenter';
import { Breadcrumb } from 'patternfly-react';
import { RouteComponentProps } from 'react-router';

type ServiceListState = {};

type ServiceListProps = {
  // none yet
};

interface URLParameter {
  name: string;
  value: string;
}

const ACTION_APPEND = 'append';
const ACTION_SET = 'set';

class ServiceListPage extends React.Component<RouteComponentProps<ServiceListProps>, ServiceListState> {
  handleError = (error: string) => {
    MessageCenter.add(error);
  };

  onParamChange = (params: URLParameter[], action?: string) => {
    const urlParams = new URLSearchParams(this.props.location.search);

    if (params.length > 0 && action === ACTION_APPEND) {
      urlParams.delete(params[0].name);
    }

    params.forEach((param: URLParameter) => {
      if (action === ACTION_APPEND) {
        urlParams.append(param.name, param.value);
      } else if (!action || action === ACTION_SET) {
        urlParams.set(param.name, param.value);
      }
    });

    this.props.history.push(this.props.location.pathname + '?' + urlParams.toString());
  };

  onParamDelete = (params: string[]) => {
    const urlParams = new URLSearchParams(this.props.location.search);

    params.forEach(param => {
      urlParams.delete(param);
    });

    this.props.history.push(this.props.location.pathname + '?' + urlParams.toString());
  };

  getQueryParam = (queryName: string, whenEmpty: string[]): string[] => {
    const urlParams = new URLSearchParams(this.props.location.search);
    let values = urlParams.getAll(queryName);

    if (values.length === 0) {
      values = whenEmpty;
    }

    return values;
  };

  render() {
    return (
      <>
        <Breadcrumb title={true}>
          <Breadcrumb.Item active={true}>Services</Breadcrumb.Item>
        </Breadcrumb>
        <ServiceListComponent
          onError={this.handleError}
          onParamChange={this.onParamChange}
          onParamDelete={this.onParamDelete}
          queryParam={this.getQueryParam}
        />
      </>
    );
  }
}

export default ServiceListPage;
