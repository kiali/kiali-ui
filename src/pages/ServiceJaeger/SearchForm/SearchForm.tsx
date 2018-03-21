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
import { Form, FormGroup, ControlLabel, FormControl, Button, FieldLevelHelp } from 'patternfly-react';

import './SearchForm.css';

type SearchFormProps = {
  services: string[];
  operations: string[];
  handleSubmit: any;
  handleServiceChange: any;
  disabled: boolean;
  selectedService: string;
};

type SearchFormState = {
  operationSelected: string;
  lookbackSelected: string;
  minDuration: string;
  maxDuration: string;
  limits: number;
  tags: string;
};

class SearchForm extends React.Component<SearchFormProps, SearchFormState> {
  constructor(props: SearchFormProps) {
    super(props);
    this.state = {
      operationSelected: 'all',
      lookbackSelected: '1h',
      minDuration: '',
      maxDuration: '',
      limits: 20,
      tags: ''
    };

    this.handleOperationChange = this.handleOperationChange.bind(this);
    this.handleLookbackChange = this.handleLookbackChange.bind(this);
    this.handleMinDuration = this.handleMinDuration.bind(this);
    this.handleMaxDuration = this.handleMaxDuration.bind(this);
    this.handleLimits = this.handleLimits.bind(this);
    this.handleTags = this.handleTags.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleOperationChange(e: any) {
    this.setState({ operationSelected: e.target.value });
  }

  handleLookbackChange(e: any) {
    this.setState({ lookbackSelected: e.target.value });
  }

  handleMinDuration(e: any) {
    this.setState({ minDuration: e.target.value });
  }

  handleMaxDuration(e: any) {
    this.setState({ maxDuration: e.target.value });
  }

  handleLimits(e: any) {
    this.setState({ limits: e.target.value });
  }
  handleTags(e: any) {
    this.setState({ tags: e.target.value });
  }
  handleSubmit() {
    this.props.handleSubmit(this.state);
  }

  render() {
    const { handleSubmit, handleServiceChange, operations, selectedService, services, disabled } = this.props;
    const opsForSvc = operations || [];
    const noSelectedService = selectedService === '-' || !selectedService;
    // const tz = selectedLookback === 'custom' ? new Date().toTimeString().replace(/^.*?GMT/, 'UTC') : null;
    return (
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormGroup disabled={false}>
          <ControlLabel>
            <span>
              Service <span className="SearchForm--labelCount">({services.length})</span>
            </span>
          </ControlLabel>
          <FormControl
            componentClass="select"
            placeholder="Select A Service"
            onChange={handleServiceChange}
            disabled={disabled || noSelectedService}
          >
            {services.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup disabled={false}>
          <ControlLabel>
            <span>
              Operation <span className="SearchForm--labelCount">({opsForSvc ? opsForSvc.length : 0})</span>
            </span>
          </ControlLabel>
          <FormControl
            componentClass="select"
            placeholder="Select An Operation"
            disabled={disabled || noSelectedService}
            onChange={this.handleOperationChange}
          >
            <option key="all" value="all">
              all
            </option>
            {opsForSvc.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup disabled={false}>
          <ControlLabel>
            <span>Tags</span>
            <FieldLevelHelp
              content={
                <div>
                  <h3>
                    Values should be in the{' '}
                    <a href="https://brandur.org/logfmt" target="_blank">
                      logfmt
                    </a>{' '}
                    format.
                  </h3>
                  <ul>
                    <li>Use space for conjunctions</li>
                    <li>Values containing whitespace should be enclosed in quotes</li>
                  </ul>
                  <hr />
                  <code className="SearchForm--tagsHintEg">error=true db.statement="select * from User"</code>
                </div>
              }
            />
          </ControlLabel>
          <FormControl
            id="ControlTags"
            type="text"
            label="Text"
            placeholder="http.status_code=200 error=true"
            onChange={this.handleTags}
          />
        </FormGroup>
        <FormGroup disabled={false}>
          <ControlLabel>
            <span>Lookback</span>
          </ControlLabel>
          <FormControl
            componentClass="select"
            defaultValue="1h"
            disabled={disabled || noSelectedService}
            onChange={this.handleLookbackChange}
          >
            <option value="1h">Last Hour</option>
            <option value="2h">Last 2 Hours</option>
            <option value="3h">Last 3 Hours</option>
            <option value="6h">Last 6 Hours</option>
            <option value="12h">Last 12 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="2d">Last 2 Days</option>
            <option value="custom" disabled={true}>
              Custom Time Range
            </option>
          </FormControl>
        </FormGroup>
        {this.state.lookbackSelected === 'custom' && [
          <FormGroup key="custom_date" disabled={false}>
            <ControlLabel>
              <span>Lookback</span>
            </ControlLabel>
            <div className="input-group date">
              <input type="text" className="form-control bootstrap-datepicker" />
              <span className="input-group-addon">
                <span className="fa fa-calendar" />
              </span>
            </div>
          </FormGroup>
        ]}
        <FormGroup disabled={false}>
          <ControlLabel>
            <span>Min Duration</span>
          </ControlLabel>
          <FormControl
            id="ControlMinDuration"
            type="text"
            label="Text"
            placeholder="e.g. 1.2s, 100ms, 500us"
            onChange={this.handleMinDuration}
          />
        </FormGroup>
        <FormGroup disabled={false}>
          <ControlLabel>
            <span>Max Duration</span>
          </ControlLabel>
          <FormControl
            id="ControlMaxDuration"
            type="text"
            label="Text"
            placeholder="e.g. 1.1s"
            onChange={this.handleMaxDuration}
          />
        </FormGroup>
        <FormGroup disabled={false}>
          <ControlLabel>
            <span>Limit Results</span>
          </ControlLabel>
          <FormControl type="number" label="Number" defaultValue={this.state.limits} onChange={this.handleLimits} />
        </FormGroup>
        <Button onClick={this.handleSubmit} disabled={disabled}>
          Find Traces
        </Button>
      </Form>
    );
  }
}

export default SearchForm;
