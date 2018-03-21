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

import React from 'react';
import './ResultItem.css';
import { Col, Row } from 'patternfly-react';
import { sortBy } from 'lodash';
import { TraceSummary } from '../../../types/Jaeger';
import moment from 'moment';
import { formatDuration, formatRelativeDate } from './date';
import colorGenerator from './color-generator';

const FALLBACK_TRACE_NAME = '<trace-without-root-span>';

type ResultItemProps = {
  trace: TraceSummary;
  durationPercent: number;
};

class ResultItem extends React.Component<ResultItemProps> {
  constructor(props: ResultItemProps) {
    super(props);
  }

  render() {
    const { durationPercent, trace } = this.props;
    const { duration, services, timestamp, numberOfErredSpans, numberOfSpans, traceName } = trace;
    const mDate = moment(timestamp);
    const timeStr = mDate.format('h:mm:ss a');
    const fromNow = mDate.fromNow();
    return (
      <div className="ItemResult">
        <div className="ItemResult--title clearfix">
          <span className="ItemResult--durationBar" style={{ width: `${durationPercent}%` }} />
          <span className="ub-right ub-relative">{formatDuration(duration * 1000)}</span>
          <h3 className="ub-m0 ub-relative">{traceName || FALLBACK_TRACE_NAME}</h3>
        </div>
        <Row style={{ marginLeft: '0px', marginRight: '0px' }}>
          <Col md={2} className="ub-p2">
            <div className="ant-tag ub-m1">
              <span className="ant-tag-text">
                {numberOfSpans} Span{numberOfSpans > 1 && 's'}
              </span>
            </div>
            {Boolean(numberOfErredSpans) && (
              <span className="ub-m1" color="red">
                {numberOfErredSpans} Error{numberOfErredSpans > 1 && 's'}
              </span>
            )}
          </Col>
          <Col md={7} className="ub-p2">
            <ul className="ub-list-reset">
              {sortBy(services, s => s.name).map(service => {
                const { name, numberOfSpans: count } = service;
                return (
                  <li key={name} className="ub-inline-block ub-m1">
                    <div
                      className="ant-tag ItemResult--serviceTag"
                      style={{ borderLeftWidth: '15px', borderLeftColor: colorGenerator.getColorByKey(name) }}
                    >
                      <span className="ant-tag-text">
                        {name} ({count})
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Col>
          <Col md={3} className="ub-p3 ub-tx-right-align">
            {formatRelativeDate(timestamp)}
            <div className="ant-divider ant-divider-vertical" />
            <br />
            {timeStr.slice(0, -3)}&nbsp;{timeStr.slice(-2)}
            <br />
            <small>{fromNow}</small>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ResultItem;
