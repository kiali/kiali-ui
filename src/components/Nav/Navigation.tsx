import * as React from 'react';
import RenderPage from './RenderPage';
import { RouteComponentProps } from 'react-router';

import Toolbar from './Toolbar';
import Menu from './Menu';
import {
  Page,
  PageHeader,
  PageSection,
  Brand,
  Avatar,
  BackgroundImage,
  BackgroundImageSrc
} from '@patternfly/react-core/dist/js';

import LoginPage from '../../containers/LoginPageContainer';
import { store } from '../../store/ConfigStore';
import { KialiLogo } from '../../config';
import { isKioskMode } from '../../utils/SearchParamUtils';
import { MessageCenterContainer } from '../../containers/MessageCenterContainer';

export const istioConfigTitle = 'Istio Config';
export const servicesTitle = 'Services';

type PropsType = RouteComponentProps & {
  authenticated: boolean;
  navCollapsed: boolean;
  checkCredentials: () => void;
  setNavCollapsed: (collapse: boolean) => void;
  jaegerUrl: string;
};

class Navigation extends React.Component<PropsType> {
  static contextTypes = {
    router: () => null
  };

  constructor(props: PropsType) {
    super(props);

    // handle initial path from the browser
    this.props.checkCredentials();
  }

  setDocLayout = () => {
    if (document.documentElement && isKioskMode()) {
      document.documentElement.className = 'kiosk';
    } else {
      document.documentElement.className = '';
    }
  };

  componentDidMount() {
    this.setDocLayout();
  }

  onNavToggle = () => {
    this.props.setNavCollapsed(!this.props.navCollapsed);
  };

  render() {
    store.subscribe(() => {
      this.setDocLayout();
    });

    const bgImages = {
      [BackgroundImageSrc.lg]: 'http://patternfly-react.surge.sh/assets/images/pfbg_1200.jpg',
      [BackgroundImageSrc.sm]: 'http://patternfly-react.surge.sh/assets/images/pfbg_768.jpg',
      [BackgroundImageSrc.sm2x]: 'http://patternfly-react.surge.sh/assets/images/pfbg_768@2x.jpg',
      [BackgroundImageSrc.xs]: 'http://patternfly-react.surge.sh/assets/images/pfbg_576.jpg',
      [BackgroundImageSrc.xs2x]: 'http://patternfly-react.surge.sh/assets/images/pfbg_576@2x.jpg',
      [BackgroundImageSrc.filter]: 'http://patternfly-react.surge.sh/assets/images/background-filter.svg#image_overlay'
    };

    const Avatarimg =
      'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAzNiAzNiIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMzYgMzYiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+CgkvKnN0eWxlbGludC1kaXNhYmxlKi8KCS5zdDB7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsdGVyOnVybCgjYik7fQoJLnN0MnttYXNrOnVybCgjYSk7fQoJLnN0M3tmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtmaWxsOiNCQkJCQkI7fQoJLnN0NHtvcGFjaXR5OjAuMTtmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDV7b3BhY2l0eTo4LjAwMDAwMGUtMDI7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDojMjMxRjIwO2VuYWJsZS1iYWNrZ3JvdW5kOm5ldyAgICA7fQoJLypzdHlsZWxpbnQtZW5hYmxlKi8KPC9zdHlsZT4KCQkJPGNpcmNsZSBjbGFzcz0ic3QwIiBjeD0iMTgiIGN5PSIxOC41IiByPSIxOCIvPgoJCTxkZWZzPgoJCQk8ZmlsdGVyIGlkPSJiIiB4PSI1LjIiIHk9IjcuMiIgd2lkdGg9IjI1LjYiIGhlaWdodD0iNTMuNiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KCQkJCTxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMSAwIDAgMCAwICAwIDEgMCAwIDAgIDAgMCAxIDAgMCAgMCAwIDAgMSAwIi8+CgkJCTwvZmlsdGVyPgoJCTwvZGVmcz4KCQk8bWFzayBpZD0iYSIgeD0iNS4yIiB5PSI3LjIiIHdpZHRoPSIyNS42IiBoZWlnaHQ9IjUzLjYiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiPgoJCQk8ZyBjbGFzcz0ic3QxIj4KCQkJCTxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjE4IiBjeT0iMTguNSIgcj0iMTgiLz4KCQkJPC9nPgoJCTwvbWFzaz4KCQk8ZyBjbGFzcz0ic3QyIj4KCQkJPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNS4wNCA2Ljg4KSI+CgkJCQk8cGF0aCBjbGFzcz0ic3QzIiBkPSJtMjIuNiAxOC4xYy0xLjEtMS40LTIuMy0yLjItMy41LTIuNnMtMS44LTAuNi02LjMtMC42LTYuMSAwLjctNi4xIDAuNyAwIDAgMCAwYy0xLjIgMC40LTIuNCAxLjItMy40IDIuNi0yLjMgMi44LTMuMiAxMi4zLTMuMiAxNC44IDAgMy4yIDAuNCAxMi4zIDAuNiAxNS40IDAgMC0wLjQgNS41IDQgNS41bC0wLjMtNi4zLTAuNC0zLjUgMC4yLTAuOWMwLjkgMC40IDMuNiAxLjIgOC42IDEuMiA1LjMgMCA4LTAuOSA4LjgtMS4zbDAuMiAxLTAuMiAzLjYtMC4zIDYuM2MzIDAuMSAzLjctMyAzLjgtNC40czAuNi0xMi42IDAuNi0xNi41YzAuMS0yLjYtMC44LTEyLjEtMy4xLTE1eiIvPgoJCQkJPHBhdGggY2xhc3M9InN0NCIgZD0ibTIyLjUgMjZjLTAuMS0yLjEtMS41LTIuOC00LjgtMi44bDIuMiA5LjZzMS44LTEuNyAzLTEuOGMwIDAtMC40LTQuNi0wLjQtNXoiLz4KCQkJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Im0xMi43IDEzLjJjLTMuNSAwLTYuNC0yLjktNi40LTYuNHMyLjktNi40IDYuNC02LjQgNi40IDIuOSA2LjQgNi40LTIuOCA2LjQtNi40IDYuNHoiLz4KCQkJCTxwYXRoIGNsYXNzPSJzdDUiIGQ9Im05LjQgNi44YzAtMyAyLjEtNS41IDQuOS02LjMtMC41LTAuMS0xLTAuMi0xLjYtMC4yLTMuNSAwLTYuNCAyLjktNi40IDYuNHMyLjkgNi40IDYuNCA2LjRjMC42IDAgMS4xLTAuMSAxLjYtMC4yLTIuOC0wLjYtNC45LTMuMS00LjktNi4xeiIvPgoJCQkJPHBhdGggY2xhc3M9InN0NCIgZD0ibTguMyAyMi40Yy0yIDAuNC0yLjkgMS40LTMuMSAzLjVsLTAuNiAxOC42czEuNyAwLjcgMy42IDAuOWwwLjEtMjN6Ii8+CgkJCTwvZz4KCQk8L2c+Cjwvc3ZnPgo=';

    const Header = (
      <PageHeader
        logo={<Brand src={KialiLogo} alt="Patternfly Logo" />}
        toolbar={<Toolbar />}
        avatar={<Avatar src={Avatarimg} alt="Avatar image" />}
        showNavToggle={true}
        onNavToggle={this.onNavToggle}
      />
    );

    const Sidebar = (
      <Menu isNavOpen={!this.props.navCollapsed} location={this.props.location} jaegerUrl={this.props.jaegerUrl} />
    );

    return this.props.authenticated ? (
      <>
        <BackgroundImage src={bgImages} />
        <Page header={Header} sidebar={Sidebar}>
          <MessageCenterContainer drawerTitle="Message Center" />
          <PageSection>
            <RenderPage />
          </PageSection>
        </Page>
      </>
    ) : (
      <LoginPage />
    );
  }
}

export default Navigation;
