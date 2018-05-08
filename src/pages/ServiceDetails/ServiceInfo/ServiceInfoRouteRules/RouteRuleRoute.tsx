import * as React from 'react';
import * as resolve from 'table-resolver';
import { DestinationWeight, ObjectValidation } from '../../../../types/ServiceInfo';
import { Table, Icon } from 'patternfly-react';
import Badge from '../../../../components/Badge/Badge';
import { PfColors } from '../../../../components/Pf/PfColors';

interface RouteRuleRouteProps {
  name: string;
  route: DestinationWeight[];
  validations: Map<string, ObjectValidation>;
}

class RouteRuleRoute extends React.Component<RouteRuleRouteProps> {
  headerFormat = value => <Table.Heading>{value}</Table.Heading>;
  cellFormat = value => <Table.Cell>{value}</Table.Cell>;

  constructor(props: RouteRuleRouteProps) {
    super(props);
  }

  columns() {
    return {
      columns: [
        {
          property: 'status',
          header: {
            label: 'status',
            formatters: [this.headerFormat],
            props: {
              index: 0,
              rowSpan: 1,
              colSpan: 1
            }
          },
          cell: {
            formatters: [this.cellFormat]
          }
        },
        {
          property: 'labels',
          header: {
            label: 'labels',
            formatters: [this.headerFormat],
            props: {
              index: 1,
              rowSpan: 1,
              colSpan: 1
            }
          },
          cell: {
            formatters: [this.cellFormat]
          }
        },
        {
          property: 'weight',
          header: {
            label: 'weights',
            formatters: [this.headerFormat],
            props: {
              index: 2,
              rowSpan: 1,
              colSpan: 1
            }
          },
          cell: {
            formatters: [this.cellFormat]
          }
        }
      ]
    };
  }

  rows() {
    return (this.props.route || []).map((routeItem, u) => ({
      id: u,
      status: this.statusFrom(this.props.validations[this.props.name]),
      weight: routeItem.weight ? routeItem.weight : '-',
      labels: this.labelsFrom(routeItem.labels)
    }));
  }

  statusFrom(validation: ObjectValidation) {
    let valid = validation.valid;
    let iconName = valid ? 'ok' : 'error-circle-o';

    console.log('Should stay or should I go?');
    console.log(valid);
    console.log(iconName);
    return <Icon type="pf" name={iconName} />;
  }

  labelsFrom(routeLabels: Map<String, String>) {
    return Object.keys(routeLabels || new Map()).map((key, n) => (
      <Badge
        scale={0.8}
        style="plastic"
        color={PfColors.Green}
        leftText={key}
        rightText={routeLabels[key] ? routeLabels[key] : ''}
      />
    ));
  }

  render() {
    return (
      <div>
        <h5>weights:</h5>
        <Table.PfProvider striped={true} bordered={true} hover={true} dataTable={true} columns={this.columns().columns}>
          <Table.Header headerRows={resolve.headerRows(this.columns())} />
          <Table.Body rows={this.rows()} />
        </Table.PfProvider>
      </div>
    );
  }
}

export default RouteRuleRoute;
