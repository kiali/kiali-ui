import * as React from 'react';
import { connect } from 'react-redux';
import { KialiAppState } from 'store/Store';
import { namespaceItemsSelector } from 'store/Selectors';
import { RenderComponentScroll } from 'components/Nav/Page';
import { SortByDirection } from '@patternfly/react-table';
import { Workload } from 'types/Workload';
import { EnvoyProxyDump, Pod } from 'types/IstioObjects';
import * as API from '../../services/Api';
import * as AlertUtils from '../../utils/AlertUtils';
import { Card, CardBody, Grid, GridItem } from '@patternfly/react-core';
import { SummaryTableBuilder } from './tables/BaseTable';
import { ResourceSorts } from './EnvoyModal';
import Namespace from 'types/Namespace';

type ReduxProps = {
  namespaces: Namespace[];
};

type EnvoyResourceProps = ReduxProps & {
  namespace: string;
  workload: Workload;
  resource: string;
};

type EnvoyResourceState = {
  config: EnvoyProxyDump;
  fetch: boolean;
  pod: Pod;
  tableSortBy: ResourceSorts;
};

class EnvoyResource extends React.Component<EnvoyResourceProps, EnvoyResourceState> {
  constructor(props: EnvoyResourceProps) {
    super(props);

    this.state = {
      pod: this.sortedPods()[0],
      config: {},
      fetch: false,
      tableSortBy: {
        clusters: {
          index: 0,
          direction: 'asc'
        },
        listeners: {
          index: 0,
          direction: 'asc'
        },
        routes: {
          index: 0,
          direction: 'asc'
        }
      }
    };
  }

  componentDidMount() {
    this.fetchEnvoyProxyResourceEntries();
  }

  componentDidUpdate(prevProps: EnvoyResourceProps, prevState: EnvoyResourceState) {
    if (this.state.pod.name !== prevState.pod.name || this.props.resource !== prevProps.resource) {
      this.fetchEnvoyProxyResourceEntries();
    }
  }

  fetchEnvoyProxyResourceEntries = () => {
    API.getPodEnvoyProxyResourceEntries(this.props.namespace, this.state.pod.name, this.props.resource)
      .then(resultEnvoyProxy => {
        this.setState({
          config: resultEnvoyProxy.data,
          fetch: false
        });
      })
      .catch(error => {
        AlertUtils.addError(
          `Could not fetch envoy config ${this.props.resource} entries for ${this.state.pod.name}.`,
          error
        );
      });
  };

  setPod = (podName: string) => {
    const podIdx: number = +podName;
    const targetPod: Pod = this.sortedPods()[podIdx];
    if (targetPod.name !== this.state.pod.name) {
      this.setState({
        config: {},
        fetch: true,
        pod: targetPod
      });
    }
  };

  sortedPods = (): Pod[] => {
    return this.props.workload.pods.sort((p1: Pod, p2: Pod) => (p1.name >= p2.name ? 1 : -1));
  };

  onSort = (tab: string, index: number, direction: SortByDirection) => {
    if (this.state.tableSortBy[tab].index !== index || this.state.tableSortBy[tab].direction !== direction) {
      let tableSortBy = this.state.tableSortBy;
      tableSortBy[tab].index = index;
      tableSortBy[tab].direction = direction;
      this.setState({
        tableSortBy: tableSortBy
      });
    }
  };

  render() {
    const builder = SummaryTableBuilder(
      this.props.resource,
      this.state.config,
      this.state.tableSortBy,
      this.props.namespaces,
      this.props.namespace
    );
    const SummaryWriterComp = builder[0];
    const summaryWriter = builder[1];
    return (
      <RenderComponentScroll>
        <Grid>
          <GridItem span={12}>
            <Card>
              <CardBody>
                <SummaryWriterComp
                  writer={summaryWriter}
                  sortBy={this.state.tableSortBy}
                  onSort={this.onSort}
                  pod={this.state.pod.name}
                  pods={this.props.workload.pods.map(pod => pod.name)}
                  setPod={this.setPod}
                />
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </RenderComponentScroll>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  namespaces: namespaceItemsSelector(state)!
});

const EnvoyResourceContainer = connect(mapStateToProps)(EnvoyResource);

export default EnvoyResourceContainer;
