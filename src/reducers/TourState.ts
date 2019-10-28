import { getType } from 'typesafe-actions';
import { updateState } from '../utils/Reducer';
import { TourState } from '../store/Store';
import { KialiAppAction } from '../actions/KialiAppAction';
import { TourActions } from '../actions/TourActions';

export const INITIAL_TOUR_STATE: TourState = {
  activeTour: undefined,
  activeStop: undefined
};

const tour = (state: TourState = INITIAL_TOUR_STATE, action: KialiAppAction): TourState => {
  switch (action.type) {
    case getType(TourActions.endTour):
      return updateState(state, { activeTour: undefined, activeStop: undefined });

    case getType(TourActions.nextStop):
      return state.activeStop && state.activeStop < state.activeTour!.stops.length - 1
        ? updateState(state, { activeStop: --state.activeStop })
        : state;

    case getType(TourActions.previousStop):
      return state.activeStop && state.activeStop > 0 ? updateState(state, { activeStop: --state.activeStop }) : state;

    case getType(TourActions.startTour):
      return updateState(state, { activeTour: action.payload, activeStop: 0 });

    default:
      return state;
  }
};

export default tour;
