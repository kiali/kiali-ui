import * as React from 'react';
import { sortBy } from 'lodash';
import { Button, Card, CardBody, Label, Grid, GridItem } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { JaegerTrace, Span } from '../../../types/JaegerInfo';
import { JaegerTraceTitle } from './JaegerTraceTitle';
import { SpanDetail } from './SpanDetail';
import { style } from 'typestyle';
import { cleanServiceSelector } from './transform';
import { isErrorTag } from '../JaegerHelper';
import { KialiAppState } from '../../../store/Store';
import { connect } from 'react-redux';
import { PfColors } from '../../Pf/PfColors';
import { getFormattedTraceInfo } from './FormattedTraceInfo';

const labelStyle = style({
  margin: '5px'
});

interface JaegerScatterProps {
  trace: JaegerTrace;
  namespaceSelector: boolean;
  namespace: string;
  app: string;
  jaegerURL: string;
}

interface JaegerScatterState {
  spansSelected: Span[];
  appSelected: string;
}
class JaegerItemC extends React.Component<JaegerScatterProps, JaegerScatterState> {
  constructor(props: JaegerScatterProps) {
    super(props);
    this.state = { spansSelected: [], appSelected: '' };
  }

  getClassButtonSpan = (app: string) => {
    if (this.state.appSelected === app) {
      return 'primary';
    } else {
      const srv = this.props.namespaceSelector ? cleanServiceSelector(app, this.props.namespace) : app;
      if (this.props.app === srv) {
        return 'tertiary';
      } else {
        return 'secondary';
      }
    }
  };

  onClickApp = (app: string) => {
    this.setState({
      appSelected: app,
      spansSelected: this.props.trace.spans.filter(span => span.process.serviceName === app)
    });
  };

  render() {
    const { trace, jaegerURL } = this.props;
    const formattedTrace = getFormattedTraceInfo(trace);
    return (
      <Card isCompact style={{ border: '1px solid #e6e6e6' }}>
        <JaegerTraceTitle
          traceID={trace.traceID}
          formattedTrace={formattedTrace}
          onClickLink={jaegerURL !== '' ? `${jaegerURL}/trace/${trace.traceID}` : ''}
        />
        <CardBody>
          <Grid style={{ marginTop: '20px' }}>
            <GridItem span={2}>
              <Label>{formattedTrace.spans}</Label>
              {formattedTrace.errors && (
                <Label style={{ marginLeft: '10px', backgroundColor: PfColors.Red200 }}>{formattedTrace.errors}</Label>
              )}
            </GridItem>
            <GridItem span={8}>
              {sortBy(trace.services, s => s.name).map(app => {
                const { name, numberOfSpans: count } = app;
                const spans = trace.spans.filter(span => span.process.serviceName === name);
                const errorSpans = spans.filter(span => span.tags.some(isErrorTag)).length;
                return (
                  <Button
                    variant={this.getClassButtonSpan(name)}
                    onClick={() => this.onClickApp(name)}
                    className={labelStyle}
                    key={`span_button_${name}`}
                  >
                    {name} ({count} {errorSpans > 0 && <ExclamationCircleIcon color={PfColors.Red200} />})
                  </Button>
                );
              })}
            </GridItem>
            <GridItem span={2} style={{ textAlign: 'right' }}>
              {formattedTrace.relativeDate}
              <span style={{ padding: '0 10px 0 10px' }}>|</span>
              {formattedTrace.absTime}
              <br />
              <small>{formattedTrace.fromNow}</small>
            </GridItem>
            {this.state.spansSelected.length > 0 && (
              <GridItem span={12}>
                <SpanDetail spans={this.state.spansSelected} />
              </GridItem>
            )}
          </Grid>
        </CardBody>
      </Card>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => {
  return {
    namespaceSelector: state.jaegerState.info ? state.jaegerState.info.namespaceSelector : true
  };
};

export const JaegerItem = connect(mapStateToProps)(JaegerItemC);

export default JaegerItem;
