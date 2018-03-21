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
import './SearchResults.css';
import ScatterPlot from './ScatterPlot';
import ResultItem from './ResultItem';
import { getPercentageOfDuration } from './date';
import { TraceSummary } from '../../../types/Jaeger';
import { Link } from 'react-router-dom';

type SearchResultsProps = {
  goToTrace?: any;
  loading: boolean;
  maxTraceDuration: number;
  traces: (TraceSummary | null)[];
  sort: any;
};

class SearchResults extends React.Component<SearchResultsProps> {
  constructor(props: SearchResultsProps) {
    super(props);
    this.handleSort = this.handleSort.bind(this);
  }

  handleSort(e: any) {
    this.props.sort(e.target.value);
  }

  render() {
    return (
      <div>
        <div>
          <div className="ResultsSearch--header">
            <div className="ub-p3">
              <ScatterPlot
                data={this.props.traces.map(
                  t =>
                    t
                      ? {
                          x: t.timestamp,
                          y: t.duration,
                          traceID: t.traceID,
                          size: t.numberOfSpans,
                          name: t.traceName
                        }
                      : null
                )}
                containerWidth={500}
                onValueClick={t => {
                  this.props.goToTrace(t.traceID);
                }}
              />
            </div>
          </div>
          <div className="ResultsSearch--headerOverview">
            <label className="ResultsSearch--sortLabel">
              Sort :
              <select defaultValue="MOST_RECENT" className="ResultsSearch--sort" onChange={this.handleSort}>
                <option value="MOST_RECENT">Most Recent</option>
                <option value="LONGEST_FIRST">Longest First</option>
                <option value="SHORTEST_FIRST">Shortest First</option>
                <option value="MOST_SPANS">Most Spans</option>
                <option value="LEAST_SPANS">Least Spans</option>
              </select>
            </label>
            <h2 className="ub-m0">
              {this.props.traces.length} Trace{this.props.traces.length > 1 && 's'}
            </h2>
          </div>
        </div>
        <div>
          <ul className="ub-list-reset">
            {this.props.traces.map(
              trace =>
                trace ? (
                  <li className="ub-my3" key={trace.traceID}>
                    <Link key={`/jaeger/traces/${trace.traceID}`} to={`/jaeger/traces/${trace.traceID}`}>
                      <ResultItem
                        trace={trace}
                        durationPercent={getPercentageOfDuration(trace.duration, this.props.maxTraceDuration)}
                      />
                    </Link>
                  </li>
                ) : null
            )}
          </ul>
        </div>
      </div>
    );
  }
}

export default SearchResults;
