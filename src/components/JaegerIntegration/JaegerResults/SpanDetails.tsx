import * as React from 'react';
import { Card, CardBody, pluralize } from '@patternfly/react-core';

import { JaegerTrace, Span } from 'types/JaegerInfo';
import { SpanTable } from './SpanTable';
import { KialiAppState } from 'store/Store';
import { connect } from 'react-redux';
import { StatefulFilters } from 'components/Filters/StatefulFilters';
import { itemFromSpan, SpanTableItem } from './SpanTableItem';
import { spanFilters } from './Filters';
import { Filter } from 'types/Filters';
import { GlobalFilters, runFilters } from 'utils/Filters';

interface Props {
  trace?: JaegerTrace;
  namespace: string;
  target: string;
  externalURL?: string;
}

interface State {
  spanSelected?: Span;
  filteredSpans: SpanTableItem[];
  filters: Filter<SpanTableItem>[];
}

class SpanDetails extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { filtered, filters } = this.filterSpans();
    GlobalFilters.init(filters);
    this.state = { filteredSpans: filtered, filters: filters };
  }

  private filterSpans = (): { filtered: SpanTableItem[]; filters: Filter<SpanTableItem>[] } => {
    const spans = this.props.trace?.spans.map(s => itemFromSpan(s, this.props.namespace)) || [];
    const filters = spanFilters(spans);
    return {
      filtered: runFilters(spans, filters),
      filters: filters
    };
  };

  private onActiveFiltersChanged = () => {
    const { filtered } = this.filterSpans();
    this.setState({ filteredSpans: filtered });
  };

  render() {
    if (!this.props.trace) {
      return null;
    }

    const spans: SpanTableItem[] = this.props.trace.spans.map(s => itemFromSpan(s, this.props.namespace));
    const filters = spanFilters(spans);
    const filteredSpans = runFilters(spans, filters);
    return (
      <Card isCompact style={{ border: '1px solid #e6e6e6' }}>
        <CardBody>
          <StatefulFilters initialFilters={filters} onFilterChange={this.onActiveFiltersChanged}>
            <div style={{ marginLeft: 5 }}>
              {GlobalFilters.getActive().filters.length > 0 && `${filteredSpans.length} / `}
              {pluralize(spans.length, 'Span')}
            </div>
          </StatefulFilters>
          <SpanTable spans={filteredSpans} namespace={this.props.namespace} externalURL={this.props.externalURL} />
        </CardBody>
      </Card>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  trace: state.jaegerState.selectedTrace
});

const Container = connect(mapStateToProps)(SpanDetails);
export default Container;
