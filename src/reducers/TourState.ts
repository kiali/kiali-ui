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

    case getType(TourActions.nextStop): {
      if (state.activeStop === undefined) {
        return state;
      }
      const nextStop = state.activeStop + 1;
      return nextStop < state.activeTour!.stops.length ? updateState(state, { activeStop: nextStop }) : state;
    }
    case getType(TourActions.previousStop): {
      if (state.activeStop === undefined) {
        return state;
      }
      const nextStop = state.activeStop - 1;
      return nextStop >= 0 ? updateState(state, { activeStop: nextStop }) : state;
    }
    case getType(TourActions.startTour):
      return updateState(state, { activeTour: action.payload, activeStop: 0 });

    default:
      return state;
  }
};

export default tour;
