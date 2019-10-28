import * as React from 'react';
import { Button, Popover, PopoverPosition } from '@patternfly/react-core';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { KialiAppState } from 'store/Store';
import { KialiIcon } from 'config/KialiIcon';
import { KialiAppAction } from 'actions/KialiAppAction';
import { TourActions } from 'actions/TourActions';

export interface TourStopInfo {
  name: string;
  description: string;
  position?: PopoverPosition;
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
    return this.props.activeStop !== undefined && this.props.activeStop < this.props.activeTour!.stops.length - 1;
  };

  private backButton = () => {
    if (!this.hasPreviousStop()) {
      return null;
    }
    return (
      <Button variant="primary" onClick={this.props.previousStop}>
        <KialiIcon.AngleLeft /> Back
      </Button>
    );
  };

  private nextButton = () => {
    return (
      <Button variant="primary" onClick={this.props.nextStop}>
        {this.hasNextStop() ? (
          'Done'
        ) : (
          <>
            Next <KialiIcon.AngleRight />
          </>
        )}
      </Button>
    );
  };

  render() {
    const name = this.props.info.name;
    const show = this.props.activeTour && name === this.props.activeTour.stops[this.props.activeStop!].name;
    console.log('SHOW=' + show);
    return (
      <>
        {show ? (
          <Popover
            key={this.props.info.name}
            isVisible={show}
            shouldClose={this.props.endTour}
            position={this.props.info.position}
            headerContent={
              <div>
                <span>{name}</span>
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
