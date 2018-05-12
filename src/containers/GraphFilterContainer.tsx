import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Toolbar, Button, Icon, FormGroup } from 'patternfly-react';

import { ToolbarDropdown } from '../components/ToolbarDropdown/ToolbarDropdown';
import NamespaceDropdownContainer from './NamespaceDropdownContainer';
import { config } from '../config';
import { style } from 'typestyle';
import { GraphParamsType } from '../types/Graph';
import Namespace from '../types/Namespace';
import { ServiceGraphDataActions } from '../actions/ServiceGraphDataActions';
import { KialiAppState } from '../store/Store';
import GraphLayersContainer from './GraphLayersContainer';
import { reload } from '../actions/NamespaceAction';

export type GraphTypes = 'cose' | 'dagre' | 'cola' | 'klay' | 'breadthfirst';

export interface GraphFilterProps extends GraphParamsType {
  disabled: boolean;
  graphType: GraphTypes;
  duration: number;
  changeDuration: (duration: number) => void;
  changeGraphLayout: (graphType: GraphTypes) => void;
  refresh: () => void;
  onNamespaceChange: (newValue: Namespace) => void;
}

const zeroPaddingLeft = style({
  paddingLeft: '0px'
});
const labelPaddingRight = style({
  paddingRight: '0.5em'
});

// Allow Redux to map sections of our global app state to our props
const mapStateToProps = (state: KialiAppState) => ({
  graphType: state.serviceGraphDataState.graphType,
  duration: state.serviceGraphDataState.duration
});

// Map our actions to Redux
const mapDispatchToProps = (dispatch: any) => {
  return {
    changeGraphLayout: bindActionCreators(ServiceGraphDataActions.changeGraphLayout, dispatch),
    changeDuration: bindActionCreators(ServiceGraphDataActions.changeDuration, dispatch),
    // @todo: make namespace actions similiar
    changeNamespace: bindActionCreators(reload, dispatch),
    refresh: bindActionCreators(ServiceGraphDataActions.refresh, dispatch)
  };
};

const INTERVAL_DURATION = config().toolbar.intervalDuration;
const GRAPH_LAYOUTS = config().toolbar.graphLayouts;

export const GraphFilter: React.SFC<GraphFilterProps> = props => {
  return (
    <>
      <Toolbar>
        <FormGroup className={zeroPaddingLeft}>
          <label className={labelPaddingRight}>Namespace:</label>
          <NamespaceDropdownContainer
            disabled={props.disabled}
            activeNamespace={props.namespace}
            onSelect={props.onNamespaceChange}
          />
        </FormGroup>
        <ToolbarDropdown
          id={'graph_filter_interval_duration'}
          disabled={props.disabled}
          handleSelect={props.changeDuration}
          nameDropdown={'Duration'}
          initialValue={props.duration}
          initialLabel={String(INTERVAL_DURATION[props.duration || config().toolbar.defaultDuration])}
          options={INTERVAL_DURATION}
        />
        <ToolbarDropdown
          id={'graph_filter_layouts'}
          disabled={props.disabled}
          handleSelect={props.changeGraphLayout}
          nameDropdown={'Layout'}
          initialValue={props.graphLayout.name}
          initialLabel={String(GRAPH_LAYOUTS[props.graphLayout.name])}
          options={GRAPH_LAYOUTS}
        />
        <FormGroup className={zeroPaddingLeft}>
          <label className={labelPaddingRight}>Filters:</label>
          <GraphLayersContainer />
        </FormGroup>
        <Toolbar.RightContent>
          <Button disabled={props.disabled} onClick={props.refresh}>
            <Icon name="refresh" />
          </Button>
        </Toolbar.RightContent>
      </Toolbar>
    </>
  );
};

const GraphFilterContainer = connect(mapStateToProps, mapDispatchToProps)(GraphFilter);
export default GraphFilterContainer;
