import deepFreeze from 'deep-freeze';

import solidPinIcon from '../assets/img/solid-pin.png';
import hollowPinIcon from '../assets/img/hollow-pin.png';
import { PfColors } from '../components/Pf/PfColors';
import { ErrorCircleOIcon, WarningTriangleIcon, InfoAltIcon, OkIcon, CircleIcon } from '@patternfly/react-icons';
export { solidPinIcon, hollowPinIcon };

const mutIcons = {
  istio: {
    circuitBreaker: { type: 'fa', name: 'bolt', ascii: '\uf0e7 ' },
    missingSidecar: { type: 'pf', name: 'blueprint', ascii: '\ue915 ', color: 'red' },
    mtls: { type: 'pf', name: 'locked', ascii: '\ue923 ' },
    disabledMtls: { type: 'fa', name: 'unlock', ascii: '\uf09c ' },
    virtualService: { type: 'fa', name: 'code-fork', ascii: '\uf126 ' }
  },
  health: {
    severity: {
      error: {
        icon: ErrorCircleOIcon,
        color: PfColors.Red100
      },
      warning: {
        icon: WarningTriangleIcon,
        color: PfColors.Orange400
      },
      improvement: {
        icon: InfoAltIcon,
        color: PfColors.Blue400
      },
      correct: {
        icon: OkIcon,
        color: PfColors.Green400
      },

    }
  },
  phase: {
    Running: {
      icon: CircleIcon,
      color: PfColors.Green400
    },
    Pending: {
      icon: CircleIcon,
      color: PfColors.Orange400
    },
    Succeeded: {
      icon: CircleIcon,
      color: PfColors.Green100
    },
    Failed: {
      icon: CircleIcon,
      color: PfColors.Red100
    },
    Unknown: {
      icon: CircleIcon,
      color: PfColors.Gray
    }
  }
};

export const icons = deepFreeze(mutIcons) as typeof mutIcons;
