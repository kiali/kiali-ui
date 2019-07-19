// Only REST is supported for now, we're working on GraphQL !
//
// For REST, we use the excellent https://github.com/mrin9/RapiDoc
// https://github.com/mrin9/RapiDoc/blob/master/LICENSE.txt
//
// For now the 'allow-try' is set to false, but a PR will follow
// with an optional proxy to run requests against the service

import * as React from 'react';
import 'rapidoc/dist/rapidoc-min.js';

/* eslint-disable */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'rapi-doc': any;
    }
  }
}
/* eslint-enable */

interface ApiDocumentationProps {
    apiType: string;
    baseUrl: string;
  };

export class ApiDocumentation extends React.Component<ApiDocumentationProps> {

  render() {
    return (
      <div>
        <rapi-doc
           spec-url={this.props.baseUrl + '/apispec'}
           show-header="false"
           show-info="false"
           allow-authentication="false"
           allow-try="false"
           layout="column"
        />
     </div>
    );
  }
}
