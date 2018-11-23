import { Point } from '../../../utils/MathUtils';
import { TrafficPointRenderer } from './TrafficPointRenderer';

export enum EdgeConnectionType {
  LINEAR,
  CURVE,
  LOOP
}

export enum TrafficEdgeType {
  HTTP,
  TCP,
  NONE
}

export enum TrafficPointType {
  HTTP_SUCCESS,
  HTTP_ERROR,
  TCP
}

/**
 * Traffic Point, it defines in an edge
 * speed - defines how fast the point is going to travel from the start to the end
 *  of the edge. Is a rate of the edge length traveled by second.
 *  1 means that the edge is traveled in exactly 1 second.
 *  0.5 is 2 seconds, 2 is half a second, etc.
 * delta - defines in what part of the edge is the point,  is a normalized number
 *  from 0 to 1, 0 means at the start of the path, and 1 is the end. The position
 *  is interpolated.
 * offset - Offset to add to the rendered point position.
 * renderer - Renderer used to draw the shape at a given position.
 */
export type TrafficPoint = {
  speed: number;
  delta: number;
  offset: Point;
  renderer: TrafficPointRenderer;
  type: TrafficPointType;
};
