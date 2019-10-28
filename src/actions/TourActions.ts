import { ActionType, createAction, createStandardAction } from 'typesafe-actions';
import { ActionKeys } from './ActionKeys';
import { TourInfo } from '../components/Tour/TourStop';

export const TourActions = {
  startTour: createStandardAction(ActionKeys.TOUR_START)<TourInfo>(),
  endTour: createAction(ActionKeys.TOUR_END),
  nextStop: createAction(ActionKeys.TOUR_NEXT),
  previousStop: createAction(ActionKeys.TOUR_PREV)
};

export type TourAction = ActionType<typeof TourActions>;
