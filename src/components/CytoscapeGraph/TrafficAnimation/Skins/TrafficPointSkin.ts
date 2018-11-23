import { TrafficPointType } from '../Types';

export default abstract class TrafficPointSkin {
  /**
   * Returns a TrafficPointRenderer for a Http error point
   * @param edge
   * @returns {TrafficPointRenderer}
   */
  abstract forHttpSuccess(edge: any);

  /**
   * Returns a TrafficPointRenderer for a Http success point
   * @param edge
   * @returns {TrafficPointRenderer}
   */
  abstract forHttpError(edge: any);

  /**
   * Returns a TrafficPointRenderer for a Tcp point
   * @param edge
   * @returns {TrafficPointCircleRenderer}
   */
  abstract forTcp(edge: any);

  forType(type: TrafficPointType, edge: any) {
    switch (type) {
      case TrafficPointType.HTTP_ERROR:
        return this.forHttpError(edge);
      case TrafficPointType.HTTP_SUCCESS:
        return this.forHttpSuccess(edge);
      case TrafficPointType.TCP:
        return this.forTcp(edge);
      default:
        throw new Error(`Unexpected type: ${type}`);
    }
  }
}
