import * as React from 'react';
import '../../css/App.css';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../Nav/Navigation';
import MastHead from '../Nav/MastHead';
import Routes from '../Nav/Routes';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <MastHead />
          <Navigation />
          <Routes />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
