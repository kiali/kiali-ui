import * as React from 'react';
import { IstioConfigItem } from '../../types/IstioConfigList';
import { cellWidth, ICell, IRow, Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';
import {
  Badge,
  Card,
  CardActions,
  CardBody,
  CardHead,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import { ValidationObjectSummary } from '../Validations/ValidationObjectSummary';
import IstioObjectLink from '../Link/IstioObjectLink';
import { IstioTypes } from '../VirtualList/Config';

interface Props {
  name: string;
  items: IstioConfigItem[];
}

class IstioConfigCard extends React.Component<Props> {
  columns(): ICell[] {
    // TODO: Casting 'as any' because @patternfly/react-table@2.22.19 has a typing bug. Remove the casting when PF fixes it.
    // https://github.com/patternfly/patternfly-next/issues/2373
    return [{ title: 'Name' }, { title: 'Configuration', transforms: [cellWidth(10) as any] }];
  }

  noIstioConfig(): IRow[] {
    return [
      {
        cells: [
          {
            title: (
              <EmptyState variant={EmptyStateVariant.full}>
                <EmptyStateBody>No Istio Config found for {this.props.name}</EmptyStateBody>
              </EmptyState>
            ),
            props: { colSpan: 3 }
          }
        ]
      }
    ];
  }

  overviewLink(item: IstioConfigItem) {
    return (
      <IstioObjectLink name={item.name} namespace={item.namespace || ''} type={item.type}>
        {item.name}
      </IstioObjectLink>
    );
  }

  rows(): IRow[] {
    if (this.props.items.length === 0) {
      return this.noIstioConfig();
    }
    let rows: IRow[] = [];
    this.props.items.map((item, itemIdx) => {
      rows.push({
        cells: [
          {
            title: (
              <span>
                <Tooltip position={TooltipPosition.top} content={<>{IstioTypes[item.type].name}</>}>
                  <Badge className={'virtualitem_badge_definition'}>{IstioTypes[item.type].icon}</Badge>
                </Tooltip>
                {this.overviewLink(item)}
              </span>
            )
          },
          {
            title: (
              <ValidationObjectSummary
                id={itemIdx + '-config-validation'}
                validations={item.validation ? [item.validation] : []}
                style={{ verticalAlign: '-0.5em' }}
              />
            )
          }
        ]
      });
      return rows;
    });

    return rows;
  }

  render() {
    return (
      <Card>
        <CardHead>
          <CardActions />
          <CardHeader>
            <Title style={{ float: 'left' }} headingLevel="h3" size="2xl">
              Istio Config
            </Title>
          </CardHeader>
        </CardHead>
        <CardBody>
          <Table
            variant={TableVariant.compact}
            aria-label={'list_istio_config'}
            cells={this.columns()}
            rows={this.rows()}
            // This style is declared on _overrides.scss
            className="table"
          >
            <TableHeader />
            <TableBody />
          </Table>
        </CardBody>
      </Card>
    );
  }
}

export default IstioConfigCard;
