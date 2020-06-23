import * as React from 'react';
import { Text, TextVariants, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { Status } from '../../types/Health';
import { Paths } from '../../config';
import { ActiveFilter, DEFAULT_LABEL_OPERATION } from '../../types/Filters';
import { healthFilter } from '../../components/Filters/CommonFilters';
import { FilterSelected } from '../../components/Filters/StatefulFilters';
import { createIcon } from '../../components/Health/Helper';

import '../../components/Health/Health.css';

type Props = {
  id: string;
  namespace: string;
  status: Status;
  items: string[];
  targetPage: Paths;
};

class OverviewStatus extends React.Component<Props, {}> {
  setFilters = () => {
    const filters: ActiveFilter[] = [
      {
        id: healthFilter.id,
        title: healthFilter.title,
        value: this.props.status.name
      }
    ];
    FilterSelected.setSelected({ filters: filters, op: DEFAULT_LABEL_OPERATION });
  };

  render() {
    const length = this.props.items.length;
    let items = this.props.items;
    if (items.length > 6) {
      items = items.slice(0, 5);
      items.push('and ' + (length - items.length) + ' more...');
    }
    const tooltipContent = (
      <>
        <Text component={TextVariants.h4}>
          <strong>{this.props.status.name}</strong>
        </Text>
        {items.map((app, idx) => {
          return <div key={this.props.id + '-' + idx}>{app}</div>;
        })}
      </>
    );
    return (
      <Tooltip aria-label={'Overview status'} position={TooltipPosition.top} content={tooltipContent}>
        <div style={{ display: 'inline-block', marginRight: '5px' }}>
          <Link to={`/${this.props.targetPage}?namespaces=${this.props.namespace}`} onClick={() => this.setFilters()}>
            {createIcon(this.props.status)}
            {' ' + length}
          </Link>{' '}
        </div>
      </Tooltip>
    );
  }
}

export default OverviewStatus;
