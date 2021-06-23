import * as React from 'react';
import { IstioConfigItem } from '../../types/IstioConfigList';
import { cellWidth, ICell, IRow, Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';
import {
  Card,
  CardActions,
  CardBody,
  CardHead,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title,
  TooltipPosition
} from '@patternfly/react-core';
import { ValidationObjectSummary } from '../Validations/ValidationObjectSummary';
import IstioObjectLink from '../Link/IstioObjectLink';
import { IstioTypes } from '../VirtualList/Config';
import { style } from 'typestyle';
import { PFBadge } from '../Pf/PfBadges';

interface Props {
  name: string;
  items: IstioConfigItem[];
}

const emtpytStyle = style({
  padding: '0 0 0 0',
  margin: '0 0 0 0'
});

class IstioConfigCard extends React.Component<Props> {
  columns(): ICell[] {
    return [{ title: 'Name' }, { title: 'Status', transforms: [cellWidth(10) as any] }];
  }

  noIstioConfig(): IRow[] {
    return [
      {
        cells: [
          {
            title: (
              <EmptyState variant={EmptyStateVariant.small} className={emtpytStyle}>
                <EmptyStateBody className={emtpytStyle}>No Istio Config found for {this.props.name}</EmptyStateBody>
              </EmptyState>
            ),
            props: { colSpan: 2 }
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
    this.props.items
      .sort((a: IstioConfigItem, b: IstioConfigItem) => {
        if (a.type < b.type) {
          return -1;
        } else if (a.type > b.type) {
          return 1;
        } else {
          return a.name < b.name ? -1 : 1;
        }
      })
      .map((item, itemIdx) => {
        rows.push({
          cells: [
            {
              title: (
                <span>
                  <PFBadge badge={IstioTypes[item.type].badge} position={TooltipPosition.top} />
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
      <Card isCompact={true} id={'IstioConfigCard'}>
        <CardHead>
          <CardActions />
          <CardHeader>
            <Title style={{ float: 'left' }} headingLevel="h5" size="lg">
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
