import * as React from 'react';
import { PopoverPosition, Tooltip } from '@patternfly/react-core';
import { HealthDetails } from './HealthDetails';
import * as H from '../../types/Health';
import { createIcon } from './Helper';
import './Health.css';

export enum DisplayMode {
  LARGE,
  SMALL
}

interface Props {
  id: string;
  health?: H.Health;
  mode: DisplayMode;
  tooltipPlacement?: PopoverPosition;
}

interface HealthState {
  globalStatus: H.Status;
}

export class HealthIndicator extends React.PureComponent<Props, HealthState> {
  static getDerivedStateFromProps(props: Props) {
    return {
      globalStatus: props.health ? props.health.getGlobalStatus() : H.NA
    };
  }

  constructor(props: Props) {
    super(props);
    this.state = HealthIndicator.getDerivedStateFromProps(props);
  }

  render() {
    if (this.props.health) {
      if (this.props.mode === DisplayMode.SMALL) {
        return this.renderSmall(this.props.health);
      } else {
        return this.renderLarge(this.props.health);
      }
    }
    return <span />;
  }

  renderSmall(health: H.Health) {
    return this.renderPopover(health, createIcon(this.state.globalStatus, 'sm'));
  }

  renderLarge(health: H.Health) {
    const spanStyle: React.CSSProperties = {
      color: this.state.globalStatus.color,
      fontWeight: 'bold'
    };
    return (
      <>
        <div>
          <span style={spanStyle}>
            <span style={{ marginRight: '10px' }}>{createIcon(this.state.globalStatus, 'sm')}</span>
            {this.state.globalStatus.name}
          </span>
        </div>
        <div>
          <HealthDetails health={health} />
        </div>
      </>
    );
  }

  renderHealthTooltip(health: H.Health) {
    return (
      <div>
        <strong>{this.state.globalStatus.name}</strong>
        <HealthDetails health={health} tooltip={true} />
      </div>
    );
  }

  renderPopover(health: H.Health, icon: JSX.Element) {
    return health.getGlobalStatus() === H.HEALTHY ? (
      icon
    ) : (
      <Tooltip
        aria-label={'Health indicator'}
        content={this.renderHealthTooltip(health)}
        position={PopoverPosition.auto}
        className={'health_indicator'}
      >
        <>{icon}</>
      </Tooltip>
    );
  }
}
