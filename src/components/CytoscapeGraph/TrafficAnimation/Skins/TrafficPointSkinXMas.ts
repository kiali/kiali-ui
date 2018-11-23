import { TrafficPointSnowflake } from '../TrafficPointRenderer';
import { PfColors } from '../../../Pf/PfColors';
import TrafficPointSkin from './TrafficPointSkin';

export default class TrafficPointSkinXMas extends TrafficPointSkin {
  forHttpSuccess(edge: any) {
    return new TrafficPointSnowflake(8, PfColors.Green500, 0.5);
  }

  forHttpError(edge: any) {
    return new TrafficPointSnowflake(7, PfColors.Red100, 0.5);
  }

  forTcp(edge: any) {
    return new TrafficPointSnowflake(3, PfColors.Black500, 0.2);
  }
}
