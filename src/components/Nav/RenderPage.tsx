import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import SwitchErrorBoundary from '../SwitchErrorBoundary/SwitchErrorBoundary';
import { pathRoutes, defaultRoute, secondaryMastheadRoutes } from '../../routes';
import { Path } from '../../types/Routes';

class RenderPage extends React.Component<{ needScroll: boolean }> {
  constructor(props: { needScroll: boolean }) {
    super(props);
  }

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
      <div className="container-fluid">
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
        <div>{this.renderSecondaryMastheadRoutes()}</div>
        {this.props.needScroll ? <div id="content-scrollable">{component}</div> : component}
      </>
    );
  }
}

export default RenderPage;
