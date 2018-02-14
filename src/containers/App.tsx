import * as React from 'react';
import './App.css';

import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';

import ServiceGraphPage from '../pages/ServiceGraph/ServiceGraphPage';
import HomePage from '../pages/Home/HomePage';

const MainLayout = () => (
    <div className="primary-layout">
        <header className="App-header">
            <h1 className="App-title">SWS UI</h1>
        </header>
        <main>
            <Switch>
                <Route path="/service-graph" component={ServiceGraphPage}/>
                <Route path="/" exact={true} component={HomePage}/>
                <Redirect to="/"/>
            </Switch>
        </main>
    </div>
);

const App = () => (
    <BrowserRouter>
        <MainLayout/>
    </BrowserRouter>
);

export default App;
