import * as React from 'react';
import './App.css';
import Home from '../pages/Home';

const logo = require('../assets/logo.svg');

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">SWS UI</h1>
                </header>
                <p className="App-intro">
                    To get started, edit <code>src/containers/App.tsx</code> and save to reload.
                </p>
                <Home/>
            </div>
        );
    }
}

export default App;
