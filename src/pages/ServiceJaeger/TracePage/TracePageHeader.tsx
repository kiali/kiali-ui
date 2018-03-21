// @flow

// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';
import IoChevronDown from 'react-icons/lib/io/chevron-down';
import IoChevronRight from 'react-icons/lib/io/chevron-right';
import { formatDatetime, formatDuration } from '../SearchResults/date';
import './TracePageHeader.css';

export const FALLBACK_TRACE_NAME = '<trace-without-root-span>';

type TracePageHeaderProps = {
  traceID: string;
  name: String;
  slimView: boolean;
  onSlimViewClicked: () => void;
  updateTextFilter: any;
  textFilter?: string;
  // these props are used by the `HEADER_ITEMS`
  // eslint-disable-next-line react/no-unused-prop-types
  timestamp: number;
  // eslint-disable-next-line react/no-unused-prop-types
  duration: number;
  // eslint-disable-next-line react/no-unused-prop-types
  numServices: number;
  // eslint-disable-next-line react/no-unused-prop-types
  maxDepth: number;
  // eslint-disable-next-line react/no-unused-prop-types
  numSpans: number;
};

export const HEADER_ITEMS = [
  {
    key: 'timestamp',
    title: 'Trace Start',
    propName: null,
    renderer: (props: TracePageHeaderProps) => formatDatetime(props.timestamp)
  },
  {
    key: 'duration',
    title: 'Duration',
    propName: null,
    renderer: (props: TracePageHeaderProps) => formatDuration(props.duration)
  },
  {
    key: 'service-count',
    title: 'Services',
    propName: 'numServices',
    renderer: null
  },
  {
    key: 'depth',
    title: 'Depth',
    propName: 'maxDepth',
    renderer: null
  },
  {
    key: 'span-count',
    title: 'Total Spans',
    propName: 'numSpans',
    renderer: null
  }
];

class TracePageHeader extends React.PureComponent<TracePageHeaderProps> {
  constructor(props: TracePageHeaderProps) {
    super(props);
  }

  render() {
    const { name, slimView } = this.props;
    return (
      <header>
        <div className="TracePageHeader--titleRow">
          <a className="ub-flex-auto ub-mr2" role="switch">
            <h1 className="TracePageHeader--title">
              {slimView ? <IoChevronRight className="ub-mr2" /> : <IoChevronDown className="ub-mr2" />}
              {name || FALLBACK_TRACE_NAME}
            </h1>
          </a>
        </div>
      </header>
    );
  }
}

export default TracePageHeader;
