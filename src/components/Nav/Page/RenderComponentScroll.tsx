import React from 'react';

// TOP_PADDING constant is used to adjust the height of the main div to allow scrolling in the inner container layer.
// 76px (header) + 118px (breadcrumb + title)
const TOP_PADDING = 76 + 118;

export class RenderComponentScroll extends React.Component<{ className?: any }, { height: number }> {
  constructor(props) {
    super(props);
    this.state = { height: 0 };
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ height: window.innerHeight - TOP_PADDING });
  };

  render() {
    return (
      <div
        style={{ height: this.state.height, overflowY: 'auto', padding: '10px' }}
        className={this.props.className ? this.props.className : undefined}
      >
        {this.props.children}
      </div>
    );
  }
}
