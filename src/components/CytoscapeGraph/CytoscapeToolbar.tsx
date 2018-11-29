import * as React from 'react';
import { ButtonGroup, Button, Icon } from 'patternfly-react';
import { style } from 'typestyle';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from '../../store/Store';

import { PfColors } from '../Pf/PfColors';
import * as CytoscapeGraphUtils from './CytoscapeGraphUtils';
import { Layout } from '../../types/GraphFilter';
import { ColaGraph } from './graphs/ColaGraph';
import { CoseGraph } from './graphs/CoseGraph';
import { DagreGraph } from './graphs/DagreGraph';
import { KialiAppAction } from '../../actions/KialiAppAction';
import { GraphActions } from '../../actions/GraphActions';
import { HistoryManager, URLParams } from '../../app/History';
import { ListPagesHelper } from '../ListPage/ListPagesHelper';
import * as LayoutDictionary from './graphs/LayoutDictionary';
import { GraphFilterActions } from '../../actions/GraphFilterActions';

type ReduxProps = {
  layout: Layout;
  showLegend: boolean;

  setLayout: (layout: Layout) => void;
  toggleLegend: () => void;
};

type CytoscapeToolbarProps = ReduxProps & {
  cytoscapeGraphRef: any;
};

const cytoscapeToolbarStyle = style({
  padding: '7px 10px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: PfColors.Black500,
  backgroundColor: PfColors.White
});
const cytoscapeToolbarPadStyle = style({ marginLeft: '10px' });

const ZOOM_STEP = 0.2;

export class CytoscapeToolbar extends React.PureComponent<CytoscapeToolbarProps> {
  constructor(props: CytoscapeToolbarProps) {
    super(props);
    // Let URL override current redux state at construction time. Update URL with unset params.
    const urlLayout = ListPagesHelper.getSingleQueryParam(URLParams.GRAPH_LAYOUT);
    if (urlLayout) {
      if (urlLayout !== props.layout.name) {
        props.setLayout(LayoutDictionary.getLayoutByName(urlLayout));
      }
    } else {
      HistoryManager.setParam(URLParams.GRAPH_LAYOUT, props.layout.name);
    }
  }

  componentDidUpdate() {
    // ensure redux state and URL are aligned
    HistoryManager.setParam(URLParams.GRAPH_LAYOUT, this.props.layout.name);
  }

  render() {
    return (
      <div className={cytoscapeToolbarStyle}>
        <ButtonGroup>
          <Button onClick={this.zoomIn}>
            <Icon type="fa" name="plus" />
          </Button>

          <Button onClick={this.zoomOut}>
            <Icon type="fa" name="minus" />
          </Button>
        </ButtonGroup>

        <Button onClick={this.fit} className={cytoscapeToolbarPadStyle}>
          <div className="glyphicon glyphicon-fullscreen" />
        </Button>

        <ButtonGroup id="toolbar_layout_group" className={cytoscapeToolbarPadStyle}>
          <Button
            onClick={() => {
              this.props.setLayout(DagreGraph.getLayout());
            }}
            title={DagreGraph.getLayout().name}
            active={this.props.layout.name === DagreGraph.getLayout().name}
          >
            <div className="fa pficon-infrastructure fa-rotate-270" />
          </Button>

          <Button
            onClick={() => {
              this.props.setLayout(CoseGraph.getLayout());
            }}
            title={CoseGraph.getLayout().name}
            active={this.props.layout.name === CoseGraph.getLayout().name}
          >
            <div className="fa pficon-topology" /> 1
          </Button>

          <Button
            onClick={() => {
              this.props.setLayout(ColaGraph.getLayout());
            }}
            title={ColaGraph.getLayout().name}
            active={this.props.layout.name === ColaGraph.getLayout().name}
          >
            <div className="fa pficon-topology" /> 2
          </Button>
        </ButtonGroup>

        <Button
          id="toolbar_toggle_legend"
          onClick={this.props.toggleLegend}
          active={this.props.showLegend}
          className={cytoscapeToolbarPadStyle}
        >
          Legend
        </Button>
      </div>
    );
  }

  getCy() {
    if (this.props.cytoscapeGraphRef.current) {
      return this.props.cytoscapeGraphRef.current.getCy();
    }
    return null;
  }

  zoom(step: number) {
    const cy: any = this.getCy();
    if (cy) {
      cy.zoom({
        level: cy.zoom() * (1 + step),
        renderedPosition: {
          x: cy.container().offsetWidth / 2,
          y: cy.container().offsetHeight / 2
        }
      });
    }
  }

  zoomIn = () => {
    this.zoom(ZOOM_STEP);
  };

  zoomOut = () => {
    this.zoom(-ZOOM_STEP);
  };

  fit = () => {
    const cy: any = this.getCy();
    if (cy) {
      CytoscapeGraphUtils.safeFit(cy);
    }
  };
}

const mapStateToProps = (state: KialiAppState) => ({
  layout: state.graph.layout,
  showLegend: state.graph.filterState.showLegend
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => ({
  setLayout: bindActionCreators(GraphActions.setLayout, dispatch),
  toggleLegend: bindActionCreators(GraphFilterActions.toggleLegend, dispatch)
});

const CytoscapeToolbarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CytoscapeToolbar);
export default CytoscapeToolbarContainer;
