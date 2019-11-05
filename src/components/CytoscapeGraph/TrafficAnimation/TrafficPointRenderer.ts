import { Point } from '../../../utils/MathUtils';

export abstract class TrafficPointRenderer {
  abstract render(context: any, point: Point);
}

export class TrafficPointCircleRenderer extends TrafficPointRenderer {
  readonly radius: number;
  readonly backgroundColor: string;
  readonly borderColor: string;
  readonly lineWidth: number;

  constructor(radius: number, backgroundColor: string, borderColor: string, lineWidth: number) {
    super();
    this.radius = radius;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.lineWidth = lineWidth;
  }

  render(context: any, point: Point) {
    context.fillStyle = this.backgroundColor;
    context.strokeStyle = this.borderColor;
    context.lineWidth = this.lineWidth;
    context.beginPath();
    context.arc(point.x, point.y, this.radius, 0, 2 * Math.PI, true);
    context.stroke();
    context.fill();
  }
}

export class TrafficPointConcentricDiamondRenderer extends TrafficPointRenderer {
  readonly outerDiamond: Diamond;
  readonly innerDiamond: Diamond;

  private static diamondPath(context: any, point: Point, diamond: Diamond) {
    context.fillStyle = diamond.backgroundColor;
    context.strokeStyle = diamond.borderColor;
    context.lineWidth = diamond.lineWidth;
    context.beginPath();
    context.moveTo(point.x, point.y - diamond.radius);
    context.lineTo(point.x + diamond.radius, point.y);
    context.lineTo(point.x, point.y + diamond.radius);
    context.lineTo(point.x - diamond.radius, point.y);
    context.lineTo(point.x, point.y - diamond.radius);
    context.stroke();
    context.fill();
  }

  constructor(outerDiamond: Diamond, innerDiamond: Diamond) {
    super();
    this.outerDiamond = outerDiamond;
    this.innerDiamond = innerDiamond;
  }

  render(context: any, point: Point) {
    TrafficPointConcentricDiamondRenderer.diamondPath(context, point, this.outerDiamond);
    TrafficPointConcentricDiamondRenderer.diamondPath(context, point, this.innerDiamond);
  }
}

export class Diamond {
  radius: number;
  backgroundColor: string;
  borderColor: string;
  lineWidth: number;

  constructor(radius: number, backgroundColor: string, borderColor: string, lineWidth: number) {
    this.radius = radius;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.lineWidth = lineWidth;
  }
}
