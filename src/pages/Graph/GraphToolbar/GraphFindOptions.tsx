import { Dropdown, DropdownToggle, DropdownItem } from '@patternfly/react-core';
import * as React from 'react';
import { KialiIcon } from 'config/KialiIcon';

type ReduxProps = {};

type GraphFindOptionsProps = ReduxProps & {
  onSelect: (expression) => void;
};

type GraphFindOptionsState = { isOpen: boolean };

export class GraphFindOptions extends React.PureComponent<GraphFindOptionsProps, GraphFindOptionsState> {
  constructor(props: GraphFindOptionsProps) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  private onToggle = isOpen => {
    this.setState({
      isOpen
    });
  };

  componentDidUpdate(_prevProps: GraphFindOptionsProps) {}

  render() {
    const options = [
      <DropdownItem key="protocol=http" onClick={() => this.props.onSelect('protocol=http')}>
        HTTP Traffic
      </DropdownItem>
    ];
    return (
      <Dropdown
        toggle={
          <DropdownToggle
            style={{ minWidth: '20px', width: '20px', paddingLeft: '5px', paddingRight: 0, bottom: '1px' }}
            id="graphfind-options"
            iconComponent={null}
            onToggle={this.onToggle}
          >
            <KialiIcon.AngleDown />
          </DropdownToggle>
        }
        isOpen={this.state.isOpen}
        dropdownItems={options}
        onSelect={this.close}
      ></Dropdown>
    );
  }

  private close = () => {
    this.setState({
      isOpen: false
    });
  };
}
