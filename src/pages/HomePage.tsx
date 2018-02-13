import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {Alert} from 'patternfly-react';

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

    dismissSuccess = () => {
        this.setState({alertVisible: false});
    }

    render() {
        return (
            <div className="container-fluid container-pf-nav-pf-vertical">
                <div className="page-header">
                    <h2>Home Page</h2>
                </div>
                <div className="App-body">
                    {this.state.alertVisible && (
                        <Alert type="success" onDismiss={this.dismissSuccess}>
                            <span>Congrats! This is working.</span>
                        </Alert>
                    )}
                    <div className="App-intro">
                        <h2>Welcome to SWS UI</h2>
                    </div>
                </div>
            </div>
        );
    }
}

export default HomePage;
