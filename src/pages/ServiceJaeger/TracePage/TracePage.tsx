import * as React from 'react';
import { Trace, TraceSummary } from '../../../types/Jaeger';
import * as API from '../../../services/Api';
import _values from 'lodash/values';
import TracePageHeader from './TracePageHeader';
import { getTraceSummary } from '../search';

type ViewRangeTime = {
  current: number[];
  cursor?: number;
  reframe?: {
    anchor: number;
    shift: number;
  };
  shiftEnd?: number;
  shiftStart?: number;
};

type ViewRange = {
  time: ViewRangeTime;
};

type TracePageState = {
  headerHeight?: number | null;
  slimView: boolean;
  textFilter?: string;
  viewRange: ViewRange;
  trace?: Trace;
  traceSummary?: TraceSummary;
};

const getTraceName = spans => {
  const span = spans.filter(sp => !sp.references || !sp.references.length)[0];
  return span ? `${span.process.serviceName}: ${span.operationName}` : '';
};

class TracePage extends React.PureComponent<{}, TracePageState> {
  _headerElm?: Element | null;
  constructor(props: {}) {
    super(props);
    this.state = {
      headerHeight: null,
      slimView: false,
      textFilter: '',
      viewRange: {
        time: {
          current: [0, 1]
        }
      }
    };
    this.setHeaderHeight = this.setHeaderHeight.bind(this);
    this.updateTextFilter = this.updateTextFilter.bind(this);
    this.toggleSlimView = this.toggleSlimView.bind(this);
  }
  componentDidMount() {
    this.ensureTraceFetched();
  }
  setHeaderHeight = (elm?: Element | null) => {
    this._headerElm = elm;
    if (elm) {
      if (this.state.headerHeight !== elm.clientHeight) {
        this.setState({ headerHeight: elm.clientHeight });
      }
    } else if (this.state.headerHeight) {
      this.setState({ headerHeight: null });
    }
  };
  ensureTraceFetched() {
    // const { fetchTrace, trace, id, loading } = this.props;
    API.JAEGER_API.fetchTrace(this.props['match'].params.trace).then(response => {
      let data = response['data'].data[0];
      console.log(getTraceSummary(data));
      this.setState({ trace: data[0], traceSummary: getTraceSummary(data) });
    });
    /*if (!trace && !loading) {
      API.JAEGER_API.fetchTrace(this.props.id).then(response => {
        let data = response['data'];
        this.setState({ services: data.data, selectedService: data.data[0] });
        this.fetchOperationService(data.data[0]);
      });

      return;
    }*/
  }
  toggleSlimView = () => {
    this.setState({ slimView: !this.state.slimView });
  };
  updateTextFilter = (textFilter?: string) => {
    this.setState({ textFilter });
  };
  render() {
    if (this.state.trace instanceof Error) {
      return null;
    }
    const { slimView, textFilter } = this.state;
    // const { duration, processes, spans, startTime, traceID } = this.state.traceSummary;

    const duration = 18;
    const processes = {
      p1: {
        serviceName: 'jaeger-query',
        tags: [
          {
            key: 'hostname',
            type: 'string',
            value: 'jaeger-210917857-z42bp'
          },
          {
            key: 'ip',
            type: 'string',
            value: '172.17.0.9'
          },
          {
            key: 'jaeger.version',
            type: 'string',
            value: 'Go-2.11.2'
          }
        ]
      }
    };
    const spans = [
      {
        traceID: '6b903a9a6fbae79a',
        spanID: '6b903a9a6fbae79a',
        flags: 1,
        operationName: '/api/services/{service}/operations',
        references: [],
        startTime: 1.5215458163747e15,
        duration: 18,
        tags: [
          {
            key: 'sampler.type',
            type: 'string',
            value: 'const'
          },
          {
            key: 'sampler.param',
            type: 'bool',
            value: true
          },
          {
            key: 'span.kind',
            type: 'string',
            value: 'server'
          },
          {
            key: 'http.method',
            type: 'string',
            value: 'GET'
          },
          {
            key: 'http.url',
            type: 'string',
            value: '/api/services/jaeger-query/operations'
          },
          {
            key: 'component',
            type: 'string',
            value: 'net/http'
          },
          {
            key: 'http.status_code',
            type: 'int64',
            value: 200
          }
        ],
        logs: [],
        processID: 'p1',
        warnings: null
      }
    ];
    const traceID = '6b903a9a6fbae79a';
    const startTime = 1521545816374718;
    // const maxSpanDepth = _maxBy(spans, 'depth').depth + 1;

    const numberOfServices = new Set(_values(processes).map(p => p.serviceName)).size;
    return (
      <div className="container-fluid container-pf-nav-pf-vertical">
        <div className="Tracepage--headerSection" ref={this.setHeaderHeight}>
          <TracePageHeader
            duration={duration}
            maxDepth={1}
            name={getTraceName(spans)}
            numServices={numberOfServices}
            numSpans={spans.length}
            slimView={slimView}
            timestamp={startTime}
            traceID={traceID}
            onSlimViewClicked={this.toggleSlimView}
            textFilter={textFilter}
            updateTextFilter={this.updateTextFilter}
          />
        </div>
      </div>
    );
  }
}

export default TracePage;
