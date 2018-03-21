import * as React from 'react';
import { Row, Col } from 'patternfly-react';
import moment from 'moment';
import './index.css';
import SearchForm from './SearchForm/SearchForm';
import SearchResults from './SearchResults/SearchResults';
import * as API from '../../services/Api';
import logfmtParser from 'logfmt/lib/logfmt_parser';
import { getTraceSummaries, sortTraces } from './search';
import { Trace, TraceSummaries } from '../../types/Jaeger';

type ServiceJaegerState = {
  services: string[];
  operations: string[];
  selectedService: string;
  tracesResults: TraceSummaries | null;
  sortBy: string;
};

const getUnixTimeStampInMSFromForm = ({ startDate, startDateTime, endDate, endDateTime }) => {
  const start = `${startDate} ${startDateTime}`;
  const end = `${endDate} ${endDateTime}`;
  return {
    start: `${moment(start, 'YYYY-MM-DD HH:mm').valueOf()}000`,
    end: `${moment(end, 'YYYY-MM-DD HH:mm').valueOf()}000`
  };
};

const convTagsLogfmt = tags => {
  if (!tags) {
    return null;
  }
  const data = logfmtParser.parse(tags);
  Object.keys(data).forEach(key => {
    const value = data[key];
    // make sure all values are strings
    // https://github.com/jaegertracing/jaeger/issues/550#issuecomment-352850811
    if (typeof value !== 'string') {
      data[key] = String(value);
    }
  });
  return JSON.stringify(data);
};

const getLastXformCacher = xformer => {
  let lastArgs: any[] | null = null;
  let lastXformed = null;

  return (...args) => {
    const sameArgs = lastArgs && lastArgs.length === args.length && lastArgs.every((lastArg, i) => lastArg === args[i]);
    if (sameArgs) {
      return lastXformed;
    }
    lastArgs = args;
    lastXformed = xformer(...args);
    return lastXformed;
  };
};

const sortedTracesXformer = getLastXformCacher((traces, sortBy) => {
  const traceResults = traces.traces;
  sortTraces(traceResults, sortBy);
  return { traces: traceResults, maxDuration: traces.maxDuration };
});

class ServiceJaegerPage extends React.Component<any, ServiceJaegerState> {
  constructor(props: any) {
    super(props);
    this.state = {
      services: [],
      operations: [],
      selectedService: '-',
      tracesResults: {
        maxDuration: 0,
        traces: []
      },
      sortBy: 'MOST_RECENT'
    };
    this.handleServiceChange = this.handleServiceChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fetchOperationService = this.fetchOperationService.bind(this);
    this.sortTraces = this.sortTraces.bind(this);
  }
  componentWillMount() {
    this.fetchServices();
  }

  componentWillReceiveProps() {
    this.fetchServices();
  }

  fetchServices() {
    API.JAEGER_API.fetchServices().then(response => {
      let data = response['data'];
      this.setState({ services: data.data, selectedService: data.data[0] });
      this.fetchOperationService(data.data[0]);
    });
  }

  fetchOperationService(serv: string) {
    this.setState({ operations: [] });
    API.JAEGER_API.fetchServiceOperations(serv).then(operations => {
      this.setState({ operations: operations['data'].data });
    });
  }

  handleSubmit(dataForm: any) {
    console.log('SUMIT');
    console.log(dataForm);
    let start;
    let end;
    if (dataForm.lookbackSelected !== 'custom') {
      const unit = dataForm.lookbackSelected.substr(-1);
      const now = new Date();
      start =
        moment(now)
          .subtract(parseInt(dataForm.lookbackSelected, 10), unit)
          .valueOf() * 1000;
      end = moment(now).valueOf() * 1000;
    } else {
      const times = getUnixTimeStampInMSFromForm({
        startDate: dataForm.startDate,
        startDateTime: dataForm.startDateTime,
        endDate: dataForm.endDate,
        endDateTime: dataForm.endDateTime
      });
      start = times.start;
      end = times.end;
    }
    let operation = dataForm.operationSelected;
    let minDuration = dataForm.minDuration === '' ? null : dataForm.minDuration;
    let maxDuration = dataForm.maxDuration === '' ? null : dataForm.maxDuration;

    API.JAEGER_API.searchTraces({
      service: 'jaeger-query',
      operation: operation !== 'all' ? operation : undefined,
      limit: dataForm.limits,
      lookback: dataForm.lookbackSelected,
      start,
      end,
      tags: convTagsLogfmt(dataForm.tags) || undefined,
      minDuration: minDuration,
      maxDuration: maxDuration
    }).then(response => {
      let data = response['data'].data;
      let tracesRaw: Trace[];
      tracesRaw = data;
      console.log(data);
      let traces = getTraceSummaries(tracesRaw);
      this.setState({ tracesResults: sortedTracesXformer(traces, 'MOST_RECENT') });
    });
  }

  handleServiceChange(e: any) {
    this.setState({ selectedService: e.target.value });
    this.fetchOperationService(e.target.value);
  }
  goToTrace(traceID: string) {
    // this.context.router.history.push(`/jaeger/traces/${traceID}`);
    console.log(traceID);
  }
  sortTraces(sort: string) {
    this.setState({ tracesResults: sortedTracesXformer(this.state.tracesResults, sort) });
  }
  render() {
    return (
      <div className="container-fluid container-pf-nav-pf-vertical">
        <Row>
          <Col md={3} className="SearchTracePage--column">
            <div className="SearchTracePage--find">
              <h2>Find Traces</h2>
              <SearchForm
                services={this.state.services}
                operations={this.state.operations}
                selectedService={this.state.selectedService}
                handleServiceChange={this.handleServiceChange}
                handleSubmit={this.handleSubmit}
                disabled={false}
              />
            </div>
          </Col>
          <Col md={9} className="SearchTracePage--column">
            <SearchResults
              goToTrace={this.goToTrace}
              loading={false}
              maxTraceDuration={this.state.tracesResults ? this.state.tracesResults.maxDuration : 1}
              traces={this.state.tracesResults ? this.state.tracesResults.traces : []}
              sort={this.sortTraces}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default ServiceJaegerPage;
