import * as React from 'react';
import { Button, Popover, PopoverPosition } from '@patternfly/react-core';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import ReactResizeDetector from 'react-resize-detector';
import { KialiIcon } from 'config/KialiIcon';
import { KialiAppAction } from 'actions/KialiAppAction';
import { TourActions } from 'actions/TourActions';
import { style } from 'typestyle';
import { Props } from 'tippy.js';
import { PfColors } from 'components/Pf/PfColors';

export interface TourStopInfo {
  name: string;
  description: string;
  position?: PopoverPosition;
  offset?: string; // tippy prop: 'xOffset, yOffset'
}

export interface TourInfo {
  name: string;
  stops: Array<TourStopInfo>;
}

const stopNumberStyle = style({
  borderRadius: '20px',
  backgroundColor: PfColors.Blue300,
  padding: '2px 6px',
  marginRight: '10px',
  color: PfColors.White
});

type ReduxProps = {
  activeTour?: TourInfo;
  activeStop?: number;

  endTour: () => void;
  nextStop: () => void;
  previousStop: () => void;
};

type TourStopProps = ReduxProps & {
  info: TourStopInfo;
};

class TourStop extends React.PureComponent<TourStopProps> {
  private hasPreviousStop = (): boolean => {
    return this.props.activeStop !== undefined && this.props.activeStop > 0;
  };

  private hasNextStop = (): boolean => {
    return this.props.activeStop !== undefined && this.props.activeStop + 1 < this.props.activeTour!.stops.length;
  };

  private backButton = () => {
    return (
      <Button isDisabled={!this.hasPreviousStop()} variant="secondary" onClick={this.props.previousStop}>
        <KialiIcon.AngleLeft /> Back
      </Button>
    );
  };

  private nextButton = () => {
    const right = style({
      float: 'right'
    });

    if (this.hasNextStop()) {
      return (
        <Button className={right} variant="primary" onClick={this.props.nextStop}>
          Next <KialiIcon.AngleRight />
        </Button>
      );
    }

    return (
      <Button className={right} variant="primary" onClick={this.props.endTour}>
        Done
      </Button>
    );
  };

  /*
  private stopNumber = () => {
    return <span className={stopNumberStyle}>{this.props.activeStop! + 1}</span>;
  };
  */

  private isVisible = (): boolean => {
    const name = this.props.info.name;
    const isVisible: boolean =
      this.props.activeTour !== undefined && name === this.props.activeTour.stops[this.props.activeStop!].name;
    return isVisible;
  };

  // This is here to workaround what seems to be a bug.  As far as I know when isVisible is set then outside clicks should not hide
  // the Popover, but it seems to be happening in certain scenarios. So, if the Popover is still valid, unhide it immediately.
  private onHidden = () => {
    if (this.isVisible()) {
      this.forceUpdate();
    }
  };

  private onResize = () => {
    if (this.isVisible()) {
      this.forceUpdate();
    }
  };

  private shouldClose = () => {
    this.props.endTour();
  };

  render() {
    const offset: string = this.props.info.offset ? this.props.info.offset : '0, 0';
    const tippyProps: Props = { offset: offset };
    const isVisible = this.isVisible();

    return (
      <>
        {isVisible ? (
          <>
            <ReactResizeDetector
              refreshMode={'debounce'}
              refreshRate={100}
              skipOnMount={true}
              handleWidth={true}
              handleHeight={true}
              onResize={this.onResize}
            />
            <Popover
              key={this.props.info.name}
              isVisible={true}
              shouldClose={this.shouldClose}
              onHidden={this.onHidden}
              position={this.props.info.position}
              tippyProps={tippyProps}
              headerContent={
                <div>
                  <span className={stopNumberStyle}>{this.props.activeStop! + 1}</span>
                  <span>{this.props.info.name}</span>
                </div>
              }
              bodyContent={this.props.info.description}
              footerContent={
                <div>
                  {this.backButton()}
                  {this.nextButton()}
                </div>
              }
            >
              <>{this.props.children}</>
            </Popover>
          </>
        ) : (
          <>{this.props.children}</>
        )}
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  activeTour: state.tourState.activeTour,
  activeStop: state.tourState.activeStop
});

const mapDispatchToProps = (dispatch: ThunkDispatch<KialiAppState, void, KialiAppAction>) => {
  return {
    endTour: bindActionCreators(TourActions.endTour, dispatch),
    nextStop: bindActionCreators(TourActions.nextStop, dispatch),
    previousStop: bindActionCreators(TourActions.previousStop, dispatch)
  };
};

const TourStopContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TourStop);

export default TourStopContainer;
