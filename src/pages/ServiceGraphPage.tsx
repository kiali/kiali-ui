import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {Alert} from 'patternfly-react';

type ServiceGraphState = {
    alertVisible: boolean;
};

type ServiceGraphProps = {
    // none yet
};

class ServiceGraphPage extends React.Component<ServiceGraphProps, ServiceGraphState> {
    constructor(props: ServiceGraphProps) {
        super(props);

        console.log('Starting ServiceGraphPage');
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
                    <h2>Welcome to SWS UI</h2>
                </div>
                <div className="App-body">
                    {this.state.alertVisible && (
                        <Alert type="success" onDismiss={this.dismissSuccess}>
                            <span>Congrats! This is working.</span>
                        </Alert>
                    )}
                    <div className="App-intro">
                        <h2>Service Graph Page</h2>
                    </div>
                </div>
            </div>
        );
    }
}

export default ServiceGraphPage;
