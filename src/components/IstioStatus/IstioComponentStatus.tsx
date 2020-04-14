import * as React from 'react';
import { ComponentStatus, Status } from '../../types/IstioStatus';
import { GutterSize, Split, SplitItem } from '@patternfly/react-core';
import { IconType } from '@patternfly/react-icons/dist/js/createIcon';
import { PFAlertColor } from '../Pf/PfColors';
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';

type Props = {
  componentStatus: ComponentStatus;
}

export type ComponentIcon = {
  color: string;
  icon: IconType;
}

const ErrorCoreComponent: ComponentIcon = {
  color: PFAlertColor.Danger,
  icon: ExclamationCircleIcon
};

const ErrorAddonComponent: ComponentIcon = {
  color: PFAlertColor.Warning,
  icon: ExclamationTriangleIcon
};

const SuccessComponent: ComponentIcon = {
  color: PFAlertColor.Success,
  icon: CheckCircleIcon
};

// Mapping Valid-Core to Icon representation.
export const validToIcon: { [valid: string]: ComponentIcon } = {
  "false-false": ErrorAddonComponent,
  "false-true": ErrorCoreComponent,
  "true-false": SuccessComponent,
  "true-true": SuccessComponent,
};

class IstioComponentStatus extends React.Component<Props> {
  renderIcon = (status: Status, isCore: boolean) => {
    const compIcon = validToIcon[`${status == Status.Healthy}-${isCore}`];
    const IconComponent = compIcon.icon;
    return (
      <IconComponent style={{color: compIcon.color}} />
    )
  };

  renderCells = () => {
    const comp = this.props.componentStatus;

    return ([
      <Split key={'cell-status-icon-' + comp.name} gutter={GutterSize.md}>
        <SplitItem>
          {this.renderIcon(this.props.componentStatus.status, this.props.componentStatus.is_core)}
        </SplitItem>
        <SplitItem isFilled={true}>
        {comp.name}
        </SplitItem>
        <SplitItem>
          {comp.status}
        </SplitItem>
      </Split>,
    ]);
  };

  render() {
    return this.renderCells();
  }
}

export default IstioComponentStatus;
