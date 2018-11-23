import { Diamond, TrafficPointCircleRenderer, TrafficPointConcentricDiamondRenderer } from '../TrafficPointRenderer';
import { PfColors } from '../../../Pf/PfColors';
import TrafficPointSkin from './TrafficPointSkin';

export default class TrafficPointSkinNormal extends TrafficPointSkin {
  forHttpSuccess(edge: any) {
    return new TrafficPointCircleRenderer(1, PfColors.White, edge.style('line-color'), 2);
  }

  forHttpError(edge: any) {
    return new TrafficPointConcentricDiamondRenderer(
      new Diamond(2.5, PfColors.White, PfColors.Red100, 1.0),
      new Diamond(1, PfColors.Red100, PfColors.Red100, 1.0)
    );
  }

  forTcp(edge: any) {
    return new TrafficPointCircleRenderer(0.8, PfColors.Black100, PfColors.Black500, 1);
  }
}
