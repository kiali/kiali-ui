import * as React from 'react';
import { Card, CardBody, Grid, GridItem, Title, Tooltip } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { Span } from '../../../types/JaegerInfo';
import history from '../../../app/History';
import { PfColors } from '../../Pf/PfColors';
import { KialiAppState } from '../../../store/Store';
import { connect } from 'react-redux';
import { serverConfig } from '../../../config';
import { SpanTable } from './SpanTable';

interface SpanDetailProps {
  spans: Span[];
  namespaceSelector: boolean;
}

interface SpanDetailState {
  spanSelected?: Span;
  isModalOpen: boolean;
}

export class SpanDetailC extends React.Component<SpanDetailProps, SpanDetailState> {
  constructor(props: SpanDetailProps) {
    super(props);
    this.state = { isModalOpen: false };
  }

  goApp = (app: string = this.props.spans[0].process.serviceName) => {
    const ns = app.split('.')[1] || serverConfig.istioNamespace;
    const appLink = app.split('.')[0];
    return '/namespaces/' + ns + '/applications/' + appLink;
  };

  render() {
    return (
      <>
        <Card style={{ backgroundColor: PfColors.Black200, marginTop: '30px' }}>
          <CardBody>
            <Grid>
              <GridItem span={12}>
                <Card>
                  <CardBody>
                    <GridItem span={6}>
                      <Title headingLevel="h2" size="3xl">
                        {' '}
                        App{' '}
                        <Tooltip content={<>Go to the service {this.props.spans[0].process.serviceName}</>}>
                          <Link
                            to={this.goApp(this.props.spans[0].process.serviceName)}
                            onClick={() => history.push(this.goApp())}
                          >
                            {this.props.spans[0].process.serviceName}
                          </Link>
                        </Tooltip>
                      </Title>
                    </GridItem>
                    <GridItem span={4} />
                    <GridItem span={2}>
                      <Tooltip content={<>View traces of application {this.props.spans[0].process.serviceName}</>}>
                        <Link
                          to={this.goApp() + '?tab=traces'}
                          onClick={() => history.push(this.goApp() + '?tab=traces')}
                        >
                          View traces
                        </Link>
                      </Tooltip>
                    </GridItem>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={12}>
                <Card>
                  <CardBody>
                    <SpanTable spans={this.props.spans} />
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => {
  return {
    namespaceSelector: state.jaegerState.info ? state.jaegerState.info.namespaceSelector : true
  };
};

export const SpanDetail = connect(mapStateToProps)(SpanDetailC);
