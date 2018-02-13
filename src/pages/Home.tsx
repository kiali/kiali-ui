import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Alert} from 'patternfly-react';

const logo = require('../assets/logo.svg');

interface HomeState {
    alertVisible: boolean;
}

class HomePage extends React.Component<RouteComponentProps<any>, HomeState> {
    constructor(props: any) {
        super(props);

        console.log('Starting HomePage');
        this.state = {
            alertVisible: true
        };
    }

    dismissAlert = () => {
        this.setState({alertVisible: false});
    }

    render() {
        return (
            <div className="container-fluid container-pf-nav-pf-vertical">
                <div className="page-header">
                    <h2>Service Graph</h2>
                </div>
                <div className="App-body">
                    {this.state.alertVisible && (
                        <Alert type="success" onDismiss={this.dismissAlert}>
                            <span>Congrats! This is working.</span>
                        </Alert>
                    )}
                    <div className="App-intro">
                        <img src={logo} className="App-logo" alt="logo"/>
                        <h2>Welcome to SWS UI</h2>
                    </div>
                    <p className="App-paragraph">
                        To get started, edit <code>src/containers/App.tsx</code> and save to reload.
                    </p>
                </div>
            </div>
        );
    }
}

export default HomePage;
