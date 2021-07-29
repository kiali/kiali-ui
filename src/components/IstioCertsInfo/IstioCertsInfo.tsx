import * as React from 'react';
import * as API from '../../services/Api';
import { Alert, Button, Card, CardBody, CardHeader, Grid, GridItem, Modal, Title } from '@patternfly/react-core';
import { KialiAppState } from 'store/Store';
import { istioCertsInfoSelector, lastRefreshAtSelector } from 'store/Selectors';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppAction } from 'actions/KialiAppAction';
import { bindActionCreators } from 'redux';
import { IstioCertsInfoActions } from 'actions/IstioCertsInfoActions';
import { connect } from 'react-redux';
import { TimeInMilliseconds } from 'types/Common';
import { CertsInfo } from 'types/CertsInfo';

type IstioCertsInfoState = {
  showModal: boolean;
};

type IstioCertsInfoProps = {
  lastRefreshAt: TimeInMilliseconds;
  setIstioCertsInfo: (istioCertsInfo: CertsInfo[]) => void;
  certsInfo: CertsInfo[];
  ref: React.RefObject<any>;
};

class IstioCertsInfo extends React.Component<IstioCertsInfoProps, IstioCertsInfoState> {
  constructor(props: IstioCertsInfoProps) {
    super(props);
    this.state = { showModal: false };
  }

  open = () => {
    this.setState({ showModal: true });
  };

  close = () => {
    this.setState({ showModal: false });
  };

  componentDidMount() {
    this.fetchStatus();
  }

  componentDidUpdate(prevProps: Readonly<IstioCertsInfoProps>): void {
    if (this.props.lastRefreshAt !== prevProps.lastRefreshAt) {
      this.fetchStatus();
    }
  }

  fetchStatus = () => {
    API.getIstioCertsInfo()
      .then(response => {
        return this.props.setIstioCertsInfo(response.data);
      })
      .catch(_error => {});
  };

  showCertInfo = (certInfo: CertsInfo): JSX.Element => {
    return (
      <Grid>
        <GridItem span={3}>
          <b>Issuer</b>
        </GridItem>
        <GridItem span={9}>{certInfo.issuer}</GridItem>
        <GridItem span={3}>
          <b>Validity</b>
        </GridItem>
        <GridItem span={9}>
          <ul>
            <li>
              <Grid>
                <GridItem span={2}>From:</GridItem>
                <GridItem span={10}>{certInfo.notBefore}</GridItem>
              </Grid>
            </li>
            <li>
              <Grid>
                <GridItem span={2}>To:</GridItem>
                <GridItem span={10}>{certInfo.notAfter}</GridItem>
              </Grid>
            </li>
          </ul>
        </GridItem>
        <GridItem span={3}>
          <b>DNS Names</b>
        </GridItem>
        <GridItem span={9}>
          {certInfo.dnsNames && certInfo.dnsNames.map((dnsName, index) => <li key={index}>{dnsName}</li>)}
        </GridItem>
      </Grid>
    );
  };

  render() {
    return (
      <Modal
        isSmall={true}
        isOpen={this.state.showModal}
        onClose={this.close}
        title="Certicates information"
        actions={[<Button onClick={this.close}>Close</Button>]}
      >
        <ul>
          {this.props.certsInfo &&
            this.props.certsInfo.map((certInfo, index) => (
              <li key={index}>
                <Card>
                  <CardHeader>
                    <Title headingLevel="h3" size="lg">
                      Certificate #{index + 1}
                    </Title>
                  </CardHeader>
                  <CardBody>
                    <Grid>
                      <GridItem span={3}>
                        <b>Secret</b>
                      </GridItem>
                      <GridItem span={9}>{certInfo.secretName}</GridItem>
                    </Grid>
                    {certInfo.error && this.showCertInfo(certInfo)}
                    {!certInfo.error && <Alert variant="danger" title="The certificate has errors" />}
                  </CardBody>
                </Card>
              </li>
            ))}
        </ul>
      </Modal>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  certsInfo: istioCertsInfoSelector(state),
  lastRefreshAt: lastRefreshAtSelector(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  setIstioCertsInfo: bindActionCreators(IstioCertsInfoActions.setinfo, dispatch)
});

const IstioCertsInfoConnected = connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(
  IstioCertsInfo
);

export default IstioCertsInfoConnected;
