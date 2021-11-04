import { GlobalAction } from './GlobalActions';
import { HelpDropdownAction } from './HelpDropdownActions';
import { LoginAction } from './LoginActions';
import { MessageCenterAction } from './MessageCenterActions';
import { NamespaceAction } from './NamespaceAction';
import { UserSettingsAction } from './UserSettingsActions';
import { JaegerAction } from './JaegerActions';
import { MeshTlsAction } from './MeshTlsActions';
import { TourAction } from './TourActions';
import { IstioStatusAction } from './IstioStatusActions';
import { MetricsStatsAction } from './MetricsStatsActions';
import { IstioCertsInfoAction } from './IstioCertsInfoActions';

export type KialiAppAction =
  | GlobalAction
  | HelpDropdownAction
  | LoginAction
  | MessageCenterAction
  | NamespaceAction
  | UserSettingsAction
  | JaegerAction
  | MeshTlsAction
  | IstioStatusAction
  | IstioCertsInfoAction
  | TourAction
  | MetricsStatsAction;
