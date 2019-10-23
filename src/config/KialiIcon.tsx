import * as React from 'react';
import { PfColors } from '../components/Pf/PfColors';
import {
  ApplicationsIcon,
  BundleIcon,
  ErrorCircleOIcon,
  InfoAltIcon,
  OkIcon,
  ServiceIcon,
  TopologyIcon,
  UnknownIcon,
  WarningTriangleIcon,
  CodeBranchIcon,
  BoltIcon,
  LockIcon,
  LockOpenIcon,
  BlueprintIcon,
  AngleDoubleUpIcon,
  AngleDoubleDownIcon,
  BellIcon,
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon
} from '@patternfly/react-icons';
import { style } from 'typestyle';

const iconStyle = style({
  width: '10px'
});

// keep alphabetized
export const KialiIcon = {
  AngleDoubleDown: (style?: string) => <AngleDoubleDownIcon className={style !== undefined ? style : iconStyle} />,
  AngleDoubleLeft: (style?: string) => <AngleDoubleLeftIcon className={style !== undefined ? style : iconStyle} />,
  AngleDoubleRight: (style?: string) => <AngleDoubleRightIcon className={style !== undefined ? style : iconStyle} />,
  AngleDoubleUp: (style?: string) => <AngleDoubleUpIcon className={style !== undefined ? style : iconStyle} />,
  Applications: (style?: string) => <ApplicationsIcon className={style !== undefined ? style : iconStyle} />,
  Bell: (style?: string) => <BellIcon className={style !== undefined ? style : iconStyle} />,
  CircuitBreaker: (style?: string) => <BoltIcon className={style !== undefined ? style : iconStyle} />,
  Error: (style?: string) => (
    <ErrorCircleOIcon className={style !== undefined ? style : iconStyle} color={PfColors.Danger} />
  ),
  Info: (style?: string) => <InfoAltIcon className={style !== undefined ? style : iconStyle} color={PfColors.Info} />,
  Ok: (style?: string) => <OkIcon className={style !== undefined ? style : iconStyle} color={PfColors.Success} />,
  MissingSidecar: (style?: string) => <CodeBranchIcon className={style !== undefined ? style : iconStyle} />,
  MtlsLock: (style?: string) => <LockIcon className={style !== undefined ? style : iconStyle} />,
  MtlsUnlock: (style?: string) => <LockOpenIcon className={style !== undefined ? style : iconStyle} />,
  Services: (style?: string) => <ServiceIcon className={style !== undefined ? style : iconStyle} />,
  Topology: (style?: string) => <TopologyIcon className={style !== undefined ? style : iconStyle} />,
  Unknown: (style?: string) => <UnknownIcon className={style !== undefined ? style : iconStyle} />,
  VirtualService: (style?: string) => <BlueprintIcon className={style !== undefined ? style : iconStyle} />,
  Warning: (style?: string) => (
    <WarningTriangleIcon className={style !== undefined ? style : iconStyle} color={PfColors.Warning} />
  ),
  Workloads: (style?: string) => <BundleIcon className={style !== undefined ? style : iconStyle} />
};
