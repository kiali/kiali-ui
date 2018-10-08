import * as React from 'react';
import Iframe from 'react-iframe';

type ServiceTracesJaegerProps = {
  service: string;
  duration: number;
  onlyErrors: boolean;
};

type ServiceTracesJaegerState = {
  url: string;
};

class ServiceTracesJaeger extends React.Component<ServiceTracesJaegerProps, ServiceTracesJaegerState> {
  constructor(props: ServiceTracesJaegerProps) {
    super(props);
    this.state = {
      url: this.jaegerQuery()
    };
  }

  jaegerQuery = () => {
    const dateNow = Date.now();
    const start = (dateNow - this.props.duration * 1000) * 1000;
    const end = dateNow * 1000;
    const errors = this.props.onlyErrors ? `&tags=%7B"error"%3A"true"%7D` : ``;
    const service = this.props.service === 'Filter by Service' ? `` : `&service=${this.props.service}`;
    console.log(
      `http://localhost:3000/search?embed` +
        `&limit=20` +
        `&start=${start}` +
        `&end=${end}` +
        `&maxDuration` +
        `&minDuration` +
        service +
        errors
    );
    return (
      `http://localhost:3000/search?embed` +
      `&limit=20` +
      `&start=${start}` +
      `&end=${end}` +
      `&maxDuration` +
      `&minDuration` +
      service +
      errors
    );
  };

  componentDidUpdate(prevProps: ServiceTracesJaegerProps) {
    if (this.props !== prevProps) {
      this.setState({
        url: this.jaegerQuery()
      });
    }
  }

  render() {
    return (
      <div>
        <Iframe
          url={this.state.url}
          position="inherit"
          allowFullScreen={true}
          height="800px"
          sandbox="allow-same-origin"
        />
      </div>
    );
  }
}

export default ServiceTracesJaeger;
