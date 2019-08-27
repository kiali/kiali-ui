import * as React from 'react';
import { Icon, Table } from 'patternfly-react';
import { globalChecks, severityToColor, severityToIconName, validationToSeverity } from '../../../types/ServiceInfo';
import { DestinationRule, ObjectValidation, Subset } from '../../../types/IstioObjects';
import LocalTime from '../../../components/Time/LocalTime';
import DetailObject from '../../../components/Details/DetailObject';
import * as resolve from 'table-resolver';
import Label from '../../../components/Label/Label';
import { Link } from 'react-router-dom';
import { Card, CardBody, Grid, GridItem, Text, TextVariants } from '@patternfly/react-core';

interface DestinationRuleProps {
  namespace: string;
  destinationRule: DestinationRule;
  validation?: ObjectValidation;
}

class DestinationRuleDetail extends React.Component<DestinationRuleProps> {
  validation(_destinationRule: DestinationRule): ObjectValidation | undefined {
    return this.props.validation;
  }

  globalStatus(rule: DestinationRule) {
    const validation = this.validation(rule);
    if (!validation) {
      return '';
    }
    const checks = globalChecks(validation);
    const severity = validationToSeverity(validation);
    const iconName = severityToIconName(severity);
    const color = severityToColor(severity);
    let message = checks.map(check => check.message).join(',');

    if (!message.length) {
      if (!validation.valid) {
        message = 'Not all checks passed!';
      }
    }

    if (message.length) {
      return (
        <div>
          <p style={{ color: color }}>
            <Icon type="pf" name={iconName} /> {message}
          </p>
        </div>
      );
    } else {
      return '';
    }
  }

  headerFormat = (label, { column }) => <Table.Heading className={column.property}>{label}</Table.Heading>;
  cellFormat = (value, { column }) => {
    const props = column.cell.props;
    const className = props ? props.align : '';

    return <Table.Cell className={className}>{value}</Table.Cell>;
  };

  columnsSubsets() {
    return {
      columns: [
        {
          property: 'name',
          header: {
            label: 'Name',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat]
          }
        },
        {
          property: 'labelSubset',
          header: {
            label: 'Labels',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat]
          }
        },
        {
          property: 'trafficPolicy',
          header: {
            label: 'Traffic Policy',
            formatters: [this.headerFormat]
          },
          cell: {
            formatters: [this.cellFormat]
          }
        }
      ]
    };
  }

  rowsSubset(subsets: Subset[]) {
    return subsets.map((subset, vsIdx) => ({
      id: vsIdx,
      name: subset.name,
      labelSubset: subset.labels
        ? Object.keys(subset.labels).map((key, _) => <Label key={key} name={key} value={subset.labels[key]} />)
        : [],
      trafficPolicy: <DetailObject name={subset.trafficPolicy ? 'trafficPolicy' : ''} detail={subset.trafficPolicy} />
    }));
  }

  generateSubsets() {
    const subsets = this.props.destinationRule.spec.subsets || [];
    const hasSubsets = subsets.length > 0;

    return (
      <GridItem>
        <Card>
          <CardBody>
            <>
              <Text component={TextVariants.h2}>Subsets</Text>
              {hasSubsets ? (
                <Table.PfProvider
                  columns={this.columnsSubsets().columns}
                  striped={true}
                  bordered={true}
                  hover={true}
                  dataTable={true}
                >
                  <Table.Header headerRows={resolve.headerRows(this.columnsSubsets())} />
                  <Table.Body rows={this.rowsSubset(subsets)} rowKey="id" />
                </Table.PfProvider>
              ) : (
                <Text component={TextVariants.p}>No subsets defined.</Text>
              )}
            </>
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  serviceLink(namespace: string, host: string, isValid: boolean): any {
    if (!host) {
      return '-';
    }
    // TODO Full FQDN are not linked yet, it needs more checks in crossnamespace scenarios + validation of target
    if (host.indexOf('.') > -1 || !isValid) {
      return host;
    } else {
      return (
        <Link to={'/namespaces/' + namespace + '/services/' + host}>
          {host + ' '}
          <Icon type="pf" name="service" />
        </Link>
      );
    }
  }

  rawConfig() {
    const destinationRule = this.props.destinationRule;
    const globalStatus = this.globalStatus(destinationRule);
    const isValid = globalStatus === '' ? true : false;
    return (
      <GridItem span={6}>
        <Card>
          <CardBody>
            <Text component={TextVariants.h2}>Destination Rule Overview</Text>
            {globalStatus}
            <Text component={TextVariants.h3}>Created at</Text>
            <LocalTime time={destinationRule.metadata.creationTimestamp || ''} />

            <Text component={TextVariants.h3}>Resource Version</Text>
            {destinationRule.metadata.resourceVersion}
            {destinationRule.spec.host && (
              <>
                <Text component={TextVariants.h3}>Host</Text>
                {this.serviceLink(destinationRule.metadata.namespace || '', destinationRule.spec.host, isValid)}
              </>
            )}
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  trafficPolicy() {
    const destinationRule = this.props.destinationRule;
    const hasTrafficPolicy = !!destinationRule.spec.trafficPolicy;

    return (
      <GridItem span={6}>
        <Card>
          <CardBody>
            <Text component={TextVariants.h2}>Traffic Policy</Text>
            {hasTrafficPolicy ? (
              <DetailObject name="" detail={destinationRule.spec.trafficPolicy} />
            ) : (
              <Text component={TextVariants.p}>No traffic policy defined.</Text>
            )}
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  render() {
    return (
      <div className="container-fluid container-cards-pf">
        <Grid gutter={'md'}>
          {this.rawConfig()}
          {this.trafficPolicy()}
          {this.generateSubsets()}
        </Grid>
      </div>
    );
  }
}

export default DestinationRuleDetail;
