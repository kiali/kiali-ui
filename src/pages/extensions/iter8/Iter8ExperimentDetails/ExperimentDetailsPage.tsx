import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { RenderHeader } from '../../../../components/Nav/Page';
import { Breadcrumb, BreadcrumbItem, Grid, GridItem, Text, TextVariants } from '@patternfly/react-core';
import { style } from 'typestyle';
import * as API from '../../../../services/Api';
import * as AlertUtils from '../../../../utils/AlertUtils';
import { Iter8ExpDetailsInfo } from '../../../../types/Iter8';

interface Props {
  namespace: string;
  name: string;
}

interface State {
  experiment?: Iter8ExpDetailsInfo;
}

const containerPadding = style({ padding: '20px 20px 20px 20px' });

class ExperimentDetailsPage extends React.Component<RouteComponentProps<Props>, State> {
  constructor(props: RouteComponentProps<Props>) {
    super(props);
    this.state = {
      experiment: undefined
    };
  }

  fetchExperiment = (namespace: string, name: string) => {
    API.getIter8Info()
      .then(result => {
        const iter8Info = result.data;
        if (iter8Info.enabled) {
          API.getExperiment(namespace, name)
            .then(result => {
              this.setState({
                experiment: result.data
              });
            })
            .catch(error => {
              AlertUtils.addError('Could not fetch Iter8 Experiment', error);
            });
        } else {
          AlertUtils.addError('Kiali has Iter8 extension enabled but it is not detected in the cluster');
        }
      })
      .catch(error => {
        AlertUtils.addError('Could not fetch Iter8 Info.', error);
      });
  };

  componentDidMount() {
    const ns = this.props.match.params.namespace;
    const name = this.props.match.params.name;
    this.fetchExperiment(ns, name);
  }

  // Extensions breadcrumb,
  // It is a simplified view of BreadcrumbView with fixed rendering
  breadcrumb = () => {
    return (
      <div className="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={`/extensions/iter8`}>Iter8 Experiments</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/extensions/iter8?namespaces=${this.props.match.params.namespace}`}>
              Namespace: {this.props.match.params.namespace}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive={true}>{this.props.match.params.name}</BreadcrumbItem>
        </Breadcrumb>
      </div>
    );
  };

  renderOverview = () => {
    return 'Overview';
  };

  renderTrafficControl = () => {
    return 'TrafficControl';
  };

  renderSucessCriteria = () => {
    return 'SuccessCriteria';
  };

  renderStatus = () => {
    return 'Status';
  };

  render() {
    return (
      <>
        <RenderHeader>
          {this.breadcrumb()}
          <Text component={TextVariants.h1}>{this.props.match.params.name}</Text>
        </RenderHeader>
        <div className={containerPadding}>
          <Grid gutter={'md'}>
            <GridItem>{this.renderOverview()}</GridItem>
            <GridItem>{this.renderTrafficControl()}</GridItem>
            <GridItem>{this.renderSucessCriteria()}</GridItem>
            <GridItem>{this.renderStatus()}</GridItem>
          </Grid>
        </div>
      </>
    );
  }
}

export default ExperimentDetailsPage;
