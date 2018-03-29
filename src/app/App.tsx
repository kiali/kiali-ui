import * as React from 'react';
import { BrowserRouter, withRouter } from 'react-router-dom';

import './App.css';
import Navigation from '../components/Nav/Navigation';

class App extends React.Component {
  render() {
    const Sidebar = withRouter(Navigation);
    return (
      <BrowserRouter basename="/console">
        <Sidebar />
      </BrowserRouter>
    );
  }
}

export default App;
