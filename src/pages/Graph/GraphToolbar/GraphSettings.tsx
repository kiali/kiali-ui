import { Radio, Dropdown, DropdownToggle, Checkbox } from '@patternfly/react-core';
import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { bindActionCreators } from 'redux';
import { HistoryManager, URLParam } from '../../../app/History';
import { GraphToolbarState, KialiAppState } from '../../../store/Store';
import { GraphToolbarActions } from '../../../actions/GraphToolbarActions';
import { GraphType, EdgeLabelMode } from '../../../types/Graph';
import { KialiAppAction } from 'actions/KialiAppAction';
import * as _ from 'lodash';
import { edgeLabelModeSelector } from 'store/Selectors';
import {
  BoundingClientAwareComponent,
  PropertyType
} from 'components/BoundingClientAwareComponent/BoundingClientAwareComponent';
import { style } from 'typestyle';

type ReduxProps = Omit<GraphToolbarState, 'findValue' | 'hideValue' | 'showLegend' | 'showFindHelp'> & {
  setEdgeLabelMode: (edgeLabelMode: EdgeLabelMode) => void;
  toggleCompressOnHide(): void;
  toggleGraphCircuitBreakers(): void;
  toggleGraphMissingSidecars(): void;
  toggleGraphNodeLabels(): void;
  toggleGraphSecurity(): void;
  toggleGraphVirtualServices(): void;
  toggleServiceNodes(): void;
  toggleTrafficAnimation(): void;
  toggleUnusedNodes(): void;
};

type GraphSettingsProps = ReduxProps;

type GraphSettingsState = { isOpen: boolean };

interface DisplayOptionType {
  id: string;
  disabled?: boolean;
  labelText: string;
  value: boolean;
  onChange: () => void;
}

const marginBottom = 20;

const containerStyle = style({
  overflow: 'auto'
});

const menuStyle = style({
  fontSize: '14px'
});

const firstTitleStyle = style({
  margin: '0.5em 0.25em 0.5em 0.25em',
  fontWeight: 'bold'
});

const titleStyle = style({
  margin: '1em 0.25em 0.5em 0.25em',
  fontWeight: 'bold'
});

const checkboxStyle = style({
  margin: '0.25em 0.5em 0.25em 0.5em'
});

class GraphSettings extends React.PureComponent<GraphSettingsProps, GraphSettingsState> {
  constructor(props: GraphSettingsProps) {
    super(props);
    this.state = {
      isOpen: false
    };

    // Let URL override current redux state at construction time. Update URL with unset params.
    const urlInjectServiceNodes = HistoryManager.getBooleanParam(URLParam.GRAPH_SERVICE_NODES);
    if (urlInjectServiceNodes !== undefined) {
      if (urlInjectServiceNodes !== props.showServiceNodes) {
        props.toggleServiceNodes();
      }
    } else {
      HistoryManager.setParam(URLParam.GRAPH_SERVICE_NODES, String(this.props.showServiceNodes));
    }
  }

  private onToggle = isOpen => {
    this.setState({
      isOpen
    });
  };

  componentDidUpdate(_prevProps: GraphSettingsProps) {
    // ensure redux state and URL are aligned
    HistoryManager.setParam(URLParam.GRAPH_SERVICE_NODES, String(this.props.showServiceNodes));
  }

  render() {
    const { isOpen } = this.state;
    return (
      <Dropdown
        toggle={
          <DropdownToggle id={'display-settings'} onToggle={this.onToggle}>
            Display
          </DropdownToggle>
        }
        isOpen={isOpen}
      >
        {this.getPopoverContent()}
      </Dropdown>
    );
  }

  getPopoverContent() {
    // map our attributes from redux
    const {
      compressOnHide,
      edgeLabelMode,
      showCircuitBreakers,
      showMissingSidecars,
      showNodeLabels,
      showSecurity,
      showServiceNodes,
      showTrafficAnimation,
      showUnusedNodes,
      showVirtualServices
    } = this.props;

    // map our dispatchers for redux
    const {
      toggleCompressOnHide,
      toggleGraphCircuitBreakers,
      toggleGraphMissingSidecars,
      toggleGraphNodeLabels,
      toggleGraphSecurity,
      toggleGraphVirtualServices,
      toggleServiceNodes,
      toggleTrafficAnimation,
      toggleUnusedNodes
    } = this.props;

    const edgeLabelOptions: DisplayOptionType[] = [
      {
        id: EdgeLabelMode.NONE,
        labelText: _.capitalize(_.startCase(EdgeLabelMode.NONE)),
        value: edgeLabelMode === EdgeLabelMode.NONE,
        onChange: this.setEdgeLabelModeNone
      },
      {
        id: EdgeLabelMode.REQUESTS_PER_SECOND,
        labelText: _.capitalize(_.startCase(EdgeLabelMode.REQUESTS_PER_SECOND)),
        value: edgeLabelMode === EdgeLabelMode.REQUESTS_PER_SECOND,
        onChange: this.setEdgeLabelModeRPS
      },
      {
        id: EdgeLabelMode.REQUESTS_PERCENTAGE,
        labelText: _.capitalize(_.startCase(EdgeLabelMode.REQUESTS_PERCENTAGE)),
        value: edgeLabelMode === EdgeLabelMode.REQUESTS_PERCENTAGE,
        onChange: this.setEdgeLabelModePCT
      },
      {
        id: EdgeLabelMode.RESPONSE_TIME_95TH_PERCENTILE,
        labelText: _.capitalize(_.startCase(EdgeLabelMode.RESPONSE_TIME_95TH_PERCENTILE)),
        value: edgeLabelMode === EdgeLabelMode.RESPONSE_TIME_95TH_PERCENTILE,
        onChange: this.setEdgeLabelModeRT
      }
    ];

    const visibilityOptions: DisplayOptionType[] = [
      {
        id: 'filterHide',
        labelText: 'Compress Hidden',
        value: compressOnHide,
        onChange: toggleCompressOnHide
      },
      {
        id: 'filterNodes',
        labelText: 'Node Names',
        value: showNodeLabels,
        onChange: toggleGraphNodeLabels
      },
      {
        id: 'filterServiceNodes',
        disabled: this.props.graphType === GraphType.SERVICE,
        labelText: 'Service Nodes',
        value: showServiceNodes,
        onChange: toggleServiceNodes
      },
      {
        id: 'filterTrafficAnimation',
        labelText: 'Traffic Animation',
        value: showTrafficAnimation,
        onChange: toggleTrafficAnimation
      },
      {
        id: 'filterUnusedNodes',
        labelText: 'Unused Nodes',
        value: showUnusedNodes,
        onChange: toggleUnusedNodes
      }
    ];

    const badgeOptions: DisplayOptionType[] = [
      {
        id: 'filterCB',
        labelText: 'Circuit Breakers',
        value: showCircuitBreakers,
        onChange: toggleGraphCircuitBreakers
      },
      {
        id: 'filterSidecars',
        labelText: 'Missing Sidecars',
        value: showMissingSidecars,
        onChange: toggleGraphMissingSidecars
      },
      {
        id: 'filterVS',
        labelText: 'Virtual Services',
        value: showVirtualServices,
        onChange: toggleGraphVirtualServices
      },
      {
        id: 'filterSecurity',
        labelText: 'Security',
        value: showSecurity,
        onChange: toggleGraphSecurity
      }
    ];

    return (
      <BoundingClientAwareComponent
        className={containerStyle}
        maxHeight={{ type: PropertyType.VIEWPORT_HEIGHT_MINUS_TOP, margin: marginBottom }}
      >
        <div className={menuStyle}>
          <div className={firstTitleStyle}>Edge Labels</div>
          {edgeLabelOptions.map((item: DisplayOptionType) => (
            <label className="pf-c-select__menu-item">
              <Radio
                className={checkboxStyle}
                id={item.id}
                name="edgeLabels"
                isChecked={item.value}
                key={item.id}
                label={item.labelText}
                onChange={item.onChange}
              />
            </label>
          ))}
          <div className={titleStyle}>Show</div>
          {visibilityOptions.map((item: DisplayOptionType) => (
            <label className="pf-c-select__menu-item">
              <Checkbox
                className={checkboxStyle}
                id={item.id}
                isChecked={item.value}
                key={item.id}
                label={item.labelText}
                onChange={item.onChange}
              />
            </label>
          ))}
          <div className={titleStyle}>Show Badges</div>
          {badgeOptions.map((item: DisplayOptionType) => (
            <label className="pf-c-select__menu-item">
              <Checkbox
                className={checkboxStyle}
                id={item.id}
                isChecked={item.value}
                key={item.id}
                label={item.labelText}
                onChange={item.onChange}
              />
            </label>
          ))}
        </div>
      </BoundingClientAwareComponent>
    );
  }

  private setEdgeLabelModeNone = () => {
    this.setEdgeLabelMode(EdgeLabelMode.NONE);
  };

  private setEdgeLabelModeRPS = () => {
    this.setEdgeLabelMode(EdgeLabelMode.REQUESTS_PER_SECOND);
  };

  private setEdgeLabelModePCT = () => {
    this.setEdgeLabelMode(EdgeLabelMode.REQUESTS_PERCENTAGE);
  };

  private setEdgeLabelModeRT = () => {
    this.setEdgeLabelMode(EdgeLabelMode.RESPONSE_TIME_95TH_PERCENTILE);
  };

  private setEdgeLabelMode = (mode: EdgeLabelMode) => {
    if (this.props.edgeLabelMode !== mode) {
      this.props.setEdgeLabelMode(mode);
    }
  };
}

// Allow Redux to map sections of our global app state to our props
const mapStateToProps = (state: KialiAppState) => ({
  compressOnHide: state.graph.toolbarState.compressOnHide,
  edgeLabelMode: edgeLabelModeSelector(state),
  showCircuitBreakers: state.graph.toolbarState.showCircuitBreakers,
  showMissingSidecars: state.graph.toolbarState.showMissingSidecars,
  showNodeLabels: state.graph.toolbarState.showNodeLabels,
  showSecurity: state.graph.toolbarState.showSecurity,
  showServiceNodes: state.graph.toolbarState.showServiceNodes,
  showTrafficAnimation: state.graph.toolbarState.showTrafficAnimation,
  showUnusedNodes: state.graph.toolbarState.showUnusedNodes,
  showVirtualServices: state.graph.toolbarState.showVirtualServices
});

// Map our actions to Redux
const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    setEdgeLabelMode: bindActionCreators(GraphToolbarActions.setEdgelLabelMode, dispatch),
    toggleCompressOnHide: bindActionCreators(GraphToolbarActions.toggleCompressOnHide, dispatch),
    toggleGraphCircuitBreakers: bindActionCreators(GraphToolbarActions.toggleGraphCircuitBreakers, dispatch),
    toggleGraphMissingSidecars: bindActionCreators(GraphToolbarActions.toggleGraphMissingSidecars, dispatch),
    toggleGraphNodeLabels: bindActionCreators(GraphToolbarActions.toggleGraphNodeLabel, dispatch),
    toggleGraphSecurity: bindActionCreators(GraphToolbarActions.toggleGraphSecurity, dispatch),
    toggleGraphVirtualServices: bindActionCreators(GraphToolbarActions.toggleGraphVirtualServices, dispatch),
    toggleServiceNodes: bindActionCreators(GraphToolbarActions.toggleServiceNodes, dispatch),
    toggleTrafficAnimation: bindActionCreators(GraphToolbarActions.toggleTrafficAnimation, dispatch),
    toggleUnusedNodes: bindActionCreators(GraphToolbarActions.toggleUnusedNodes, dispatch)
  };
};

// hook up to Redux for our State to be mapped to props
const GraphSettingsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphSettings);
export default GraphSettingsContainer;
