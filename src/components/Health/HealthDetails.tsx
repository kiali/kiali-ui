import * as React from 'react';
import * as H from '../../types/Health';
import { createIcon } from './Helper';
import { InfoAltIcon } from '@patternfly/react-icons';
import './Health.css';
import { PFColors } from '../Pf/PfColors';
import { Title } from '@patternfly/react-core';
import { style } from 'typestyle';

interface Props {
  health: H.Health;
  tooltip?: boolean;
}

const titleStyle = style({
  margin: '15px 0 11px 0'
});

export class HealthDetails extends React.PureComponent<Props, {}> {
  renderErrorRate = (item: H.HealthItem, idx: number) => {
    const config = this.props.health.getStatusConfig();
    const isValueInConfig =
      config && this.props.health.health.statusConfig ? this.props.health.health.statusConfig.value > 0 : false;

    const showTraffic = item.children
      ? item.children.filter(sub => {
          const showItem = sub.value && sub.value > 0;
          return (sub.status !== H.HEALTHY && showItem) || !this.props.tooltip;
        }).length > 0
      : false;
    return showTraffic ? (
      <div key={idx}>
        {!this.props.tooltip && (
          <Title headingLevel="h3" size="lg" className={titleStyle}>
            {item.title + (item.text && item.text.length > 0 ? ': ' : '')}{' '}
            {config && <InfoAltIcon color={PFColors.Black600} />}
          </Title>
        )}
        {item.text}
        {item.children && (
          <ul style={{ listStyleType: 'none' }}>
            {item.children.map((sub, subIdx) => {
              const showItem = sub.value && sub.value > 0;
              return (sub.status !== H.HEALTHY && showItem) || !this.props.tooltip ? (
                <li key={subIdx}>
                  <span style={{ marginRight: '10px' }}>{createIcon(sub.status)}</span>
                  {sub.text}
                </li>
              ) : (
                <React.Fragment key={subIdx} />
              );
            })}
            {config && isValueInConfig && (
              <li key={'degraded_failure_config'}>
                <span style={{ marginRight: '10px' }}>{createIcon(H.DEGRADED)}</span>:{' '}
                {config.degraded === 0 ? '>' : '>='}
                {config.degraded}% {createIcon(H.FAILURE)}: {config.degraded === 0 ? '>' : '>='}
                {config.failure}%
              </li>
            )}
          </ul>
        )}
      </div>
    ) : (
      <React.Fragment key={idx} />
    );
  };

  renderChildren = (item: H.HealthItem, idx: number) => {
    return item.title.startsWith(H.TRAFFICSTATUS)
      ? this.renderErrorRate(item, idx)
      : (item.status !== H.HEALTHY || !this.props.tooltip) && (
          <div key={idx}>
            {!this.props.tooltip && (
              <Title headingLevel="h3" size="lg" className={titleStyle}>
                {item.title + (item.text && item.text.length > 0 ? ': ' : '')}
              </Title>
            )}
            {item.text}
            {item.children && (
              <ul style={{ listStyleType: 'none' }}>
                {item.children.map((sub, subIdx) => {
                  return (
                    <li key={subIdx}>
                      <span style={{ marginRight: '10px' }}>{createIcon(sub.status)}</span>
                      {sub.text}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
  };

  render() {
    const health = this.props.health;
    return health.health.items.map((item, idx) => {
      return this.renderChildren(item, idx);
    });
  }
}
