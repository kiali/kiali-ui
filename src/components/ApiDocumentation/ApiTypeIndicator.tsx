import * as React from 'react';
import { style } from 'typestyle';

interface Props {
  apiType: string;
}

const apiGrpcIcon = require('../../assets/img/api-grpc-logo.svg');
const apiRestIcon = require('../../assets/img/api-rest-logo.svg');
const apiGraphqlIcon = require('../../assets/img/api-graphql-logo.svg');

const nameToSource = new Map<string, string>([
  ['grpc', apiGrpcIcon],
  ['rest', apiRestIcon],
  ['graphql', apiGraphqlIcon],
]);

export class ApiTypeIndicator extends React.Component<Props> {
  iconStyle() {
    return style({
      marginTop: -2,
      marginRight: 6,
      width: 30
    });
  }

  render() {
    if (this.props.apiType) {
        if (this.props.apiType === 'grpc' || this.props.apiType === 'graphql' || this.props.apiType === 'rest') {
          return this.renderIcon(this.props.apiType);
        }
    }
    return <span />;
  }

  renderIcon(apiType: string) {
      return (
        <img
          className={this.iconStyle()}
          src={nameToSource.get(apiType)}
          alt={apiType}
        />
      );
  }

}
