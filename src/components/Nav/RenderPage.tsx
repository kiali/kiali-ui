import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import SwitchErrorBoundary from '../SwitchErrorBoundary/SwitchErrorBoundary';
import { pathRoutes, defaultRoute, secondaryMastheadRoutes } from '../../routes';
import { Path } from '../../types/Routes';
import { style } from 'typestyle';
import { PfColors } from '../Pf/PfColors';

const containerStyle = style({ marginLeft: 0, marginRight: 0 });
const containerPadding = style({ padding: '0 20px 0 20px' });
const containerGray = style({ background: PfColors.Black150 });

class RenderPage extends React.Component<{ needScroll: boolean }> {
  renderPaths(paths: Path[]) {
    return paths.map((item, index) => {
      return <Route key={index} path={item.path} component={item.component} />;
    });
  }

  renderSecondaryMastheadRoutes() {
    return this.renderPaths(secondaryMastheadRoutes);
  }

  renderPathRoutes() {
    return this.renderPaths(pathRoutes);
  }

  render() {
    const component = (
      <div className={`${containerStyle} ${!this.props.needScroll && containerPadding}`}>
        <SwitchErrorBoundary
          fallBackComponent={() => <h2>Sorry, there was a problem. Try a refresh or navigate to a different page.</h2>}
        >
          {this.renderPathRoutes()}
          <Redirect from="/" to={defaultRoute} />
        </SwitchErrorBoundary>
      </div>
    );
    return (
      <>
        {this.renderSecondaryMastheadRoutes()}
        {this.props.needScroll ? (
          <div id="content-scrollable" className={containerGray}>
            {component}
          </div>
        ) : (
          component
        )}
      </>
    );
  }
}

export default RenderPage;
