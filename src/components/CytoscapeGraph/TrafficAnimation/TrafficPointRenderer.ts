import { Point } from '../../../utils/MathUtils';

export abstract class TrafficPointRenderer {
  abstract render(context: any, point: Point);
}

export class TrafficPointCircleRenderer extends TrafficPointRenderer {
  readonly radio: number;
  readonly backgroundColor: string;
  readonly borderColor: string;
  readonly lineWidth: number;

  constructor(radio: number, backgroundColor: string, borderColor: string, lineWidth: number) {
    super();
    this.radio = radio;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.lineWidth = lineWidth;
  }

  render(context: any, point: Point) {
    context.fillStyle = this.backgroundColor;
    context.strokeStyle = this.borderColor;
    context.lineWidth = this.lineWidth;
    context.beginPath();
    context.arc(point.x, point.y, this.radio, 0, 2 * Math.PI, true);
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
    context.moveTo(point.x, point.y - diamond.radio);
    context.lineTo(point.x + diamond.radio, point.y);
    context.lineTo(point.x, point.y + diamond.radio);
    context.lineTo(point.x - diamond.radio, point.y);
    context.lineTo(point.x, point.y - diamond.radio);
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
  radio: number;
  backgroundColor: string;
  borderColor: string;
  lineWidth: number;

  constructor(radio: number, backgroundColor: string, borderColor: string, lineWidth: number) {
    this.radio = radio;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.lineWidth = lineWidth;
  }
}

export class TrafficPointSnowflake extends TrafficPointRenderer {
  // I used gimp to get the "path", exported into octave and did some math to normalize the points from (-1 to 1) both axis
  // points is an array of points [x1, y1, x2, y2, ... , xn, yn]
  static points = [
    -0.005780346820809301,
    -1,
    -0.005780346820809301,
    -0.002499999999999947,
    -0.7861271676300579,
    -0.002499999999999947,
    -0.002890173410404651,
    0,
    -1,
    -0.4925,
    -0.005780346820809301,
    -0.375,
    -0.1358381502890174,
    -0.4375,
    -0.2109826589595376,
    -0.3100000000000001,
    -0.384393063583815,
    -0.335,
    -0.3670520231213873,
    -0.1775,
    -0.523121387283237,
    -0.1225000000000001,
    -0.4277456647398844,
    -0.005000000000000004,
    -0.3930635838150289,
    -0.5900000000000001,
    0,
    0,
    -0.2427745664739884,
    -0.6625,
    -0.315028901734104,
    -0.47,
    -0.5491329479768786,
    -0.5075000000000001,
    -0.6820809248554913,
    -0.54,
    -0.6820809248554913,
    -0.3325,
    -0.8901734104046243,
    -0.235,
    -0.8323699421965318,
    -0.5675,
    -0.9826589595375722,
    -0.34,
    -0.7832369942196532,
    -0.145,
    -0.6473988439306358,
    -0.005000000000000004,
    -0.1502890173410405,
    -0.905,
    -0.005780346820809301,
    -0.835,
    -0.1994219653179191,
    -0.78,
    -0.008670520231213841,
    -0.6875
  ];
  // map tells us how to draw the points [index1, count1, index2, count2, ..., indexm, countm]
  // index1 is 1-based, as octave uses it that way, count is the number of points to use after the index.
  static map = [1, 2, 4, 1, 6, 6, 13, 1, 15, 2, 18, 2, 21, 1, 23, 1, 25, 1, 27, 1];

  readonly scale: number;
  readonly borderColor: string;
  readonly lineWidth: number;

  constructor(scale: number, borderColor: string, lineWidth: number) {
    super();
    this.scale = scale;
    this.borderColor = borderColor;
    this.lineWidth = lineWidth;
  }

  render(context: any, point: Point) {
    context.strokeStyle = this.borderColor;
    context.lineWidth = this.lineWidth;
    for (let i = 0; i < TrafficPointSnowflake.map.length; i += 2) {
      const index = TrafficPointSnowflake.map[i] - 1; // convert index to 0-based
      const count = TrafficPointSnowflake.map[i + 1];
      // We are using a symmetric shape, draw each quarter
      this.renderSegment(context, point, index, count, this.scale, this.scale);
      this.renderSegment(context, point, index, count, this.scale, -this.scale);
      this.renderSegment(context, point, index, count, -this.scale, this.scale);
      this.renderSegment(context, point, index, count, -this.scale, -this.scale);
    }
  }

  private renderSegment(context: any, point: Point, index: number, count: number, scaleX: number, scaleY: number) {
    context.beginPath();
    context.moveTo(
      point.x + scaleX * TrafficPointSnowflake.points[index * 2],
      point.y + scaleY * TrafficPointSnowflake.points[index * 2 + 1]
    );
    for (let j = 1; j <= count; ++j) {
      context.lineTo(
        point.x + scaleX * TrafficPointSnowflake.points[(index + j) * 2],
        point.y + scaleY * TrafficPointSnowflake.points[(index + j) * 2 + 1]
      );
    }
    context.stroke();
  }
}
