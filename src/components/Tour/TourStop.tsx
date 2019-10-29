import * as React from 'react';
import { Button, Popover, PopoverPosition } from '@patternfly/react-core';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import { KialiIcon } from 'config/KialiIcon';
import { KialiAppAction } from 'actions/KialiAppAction';
import { TourActions } from 'actions/TourActions';
import { style } from 'typestyle';
import { Props } from 'tippy.js';

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

  private onHidden() {
    if (this.props !== undefined) {
      console.log(`HIDDEN [${this.props.info.name}]`);
    }
  }

  render() {
    const name = this.props.info.name;
    const offset: string = this.props.info.offset ? this.props.info.offset : '0, 0';
    const tippyProps: Props = { offset: offset };
    const show = this.props.activeTour && name === this.props.activeTour.stops[this.props.activeStop!].name;
    if (show) {
      console.log(`*** [${name}]`);
    } else {
      console.log(`                      [${name}]`);
    }
    return (
      <>
        {show ? (
          <Popover
            key={this.props.info.name}
            isVisible={true}
            shouldClose={this.props.endTour}
            onHidden={this.onHidden}
            position={this.props.info.position}
            tippyProps={tippyProps}
            headerContent={<span>{name}</span>}
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
