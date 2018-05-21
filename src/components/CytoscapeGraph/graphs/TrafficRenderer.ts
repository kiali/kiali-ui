import { clamp } from '../../../utils/MathUtils';

/**
 * Traffic Point, it defines in an edge
 * speed - defines how fast the point is going to travel from the start to the end
 *  of the edge a speed o 1000 travels the edge in about 1 second.
 * delta - defines in what part of the edge is the point,  is a normalized number
 *  from 0 to 1, 0 means at the start of the path, and 1 is the end. The position
 *  is interpolated.
 */
type TrafficPoint = {
  speed: number;
  delta: number;
};

/**
 * Helps generate traffic points
 * timer - defines how fast to generate a new point, its in milliseconds.
 * timerForNextPoint - keeps track of how many milliseconds to generate the next point.
 * speed - defines the speed of the next point (see TrafficPoint.speed)
 */
class TrafficPointGenerator {
  private timer?: number;
  private timerForNextPoint?: number;
  private speed: number;

  // initialize values, if timer is undefined, no point is going to be generated
  // There is no traffic.
  constructor(speed: number, timer: number | undefined) {
    this.speed = speed;
    this.timer = timer;
    this.timerForNextPoint = timer;
  }

  /**
   * Process a step, decrements the timerForNextPoint and returns a new point
   * if it reaches zero or is close.
   * This method adds some randomness to avoid the "flat" look that all the points
   * are syncronized.
   */
  processStep(step: number): TrafficPoint | undefined {
    if (this.timerForNextPoint) {
      this.timerForNextPoint -= step;
      // Add some random-ness to make it less "flat"
      if (this.timerForNextPoint <= Math.random() * 200) {
        this.timerForNextPoint = this.timer;
        return { speed: this.speed, delta: 0 };
      }
    }
    return undefined;
  }

  setTimer(timer: number | undefined) {
    this.timer = timer;
    this.timerForNextPoint = timer;
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }
}

/**
 * Holds the list of points an edge has.
 * points - list of active points the edge has, points are discarded when they
 *  reach their target.
 * generator - Generates the next point
 * edge - Edge where the traffic is tracked
 */
class TrafficEdge {
  private points: Array<TrafficPoint> = [];
  private generator: TrafficPointGenerator;
  private edge: any;

  constructor(speed: number, timer: number | undefined, edge: any) {
    this.generator = new TrafficPointGenerator(speed, timer);
    this.edge = edge;
  }

  processStep(step: number) {
    this.points = this.points.map(p => {
      p.delta += step / p.speed;
      p.delta = Math.min(p.delta, 1);
      return p;
    });
    const point = this.generator.processStep(step);
    if (point) {
      this.points.push(point);
    }
  }

  getPoints() {
    return this.points;
  }

  getEdge() {
    return this.edge;
  }

  setTimer(timer: number | undefined) {
    this.generator.setTimer(timer);
  }

  removeFinishedPoints() {
    this.points = this.points.filter(p => p.delta < 1);
  }

  setSpeed(speed: number) {
    this.generator.setSpeed(speed);
  }

  setEdge(edge: any) {
    this.edge = edge;
  }
}

type TrafficEdgeHash = {
  [edgeId: string]: TrafficEdge;
};

/**
 * Renders the traffic going from edges using the edge information
 */
export default class TrafficRenderer {
  private animationTimer;
  private previousTimestamp;
  private trafficEdges: TrafficEdgeHash = {};

  private layer;
  private canvas;
  private ctx;

  // private readonly TIMER_FOR_RATE_FACTOR = 100;
  private readonly TIMER_FOR_RATE_MIN = 20;
  private readonly TIMER_FOR_RATE_MAX = 1000;

  constructor(cy: any, edges: any) {
    this.layer = cy.cyCanvas();
    this.canvas = this.layer.getCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.setEdges(edges);
  }

  start = () => {
    if (this.animationTimer) {
      this.stop();
    }
    this.animationTimer = window.setInterval(this.processStep, 50);
  };

  stop = () => {
    window.clearInterval(this.animationTimer);
  };

  setEdges = (edges: any) => {
    this.trafficEdges = this.processEdges(edges);
  };

  clear = () => {
    this.layer.clear(this.ctx);
  };

  processStep = () => {
    if (this.previousTimestamp === undefined) {
      this.previousTimestamp = Date.now();
    }
    const nextTimestamp = Date.now();
    const step = this.currentStep();
    this.layer.clear(this.ctx);
    this.layer.setTransform(this.ctx);
    Object.keys(this.trafficEdges).forEach(edgeId => {
      const trafficEdge = this.trafficEdges[edgeId];
      trafficEdge.processStep(step);
      this.render(trafficEdge);
      trafficEdge.removeFinishedPoints();
    });

    this.previousTimestamp = nextTimestamp;
  };

  private render(trafficEdge: TrafficEdge) {
    const edge = trafficEdge.getEdge();
    if (edge.hasClass('mousedim')) {
      // Probably need to move this somewhere else
      return;
    }
    trafficEdge.getPoints().forEach((point: TrafficPoint) => {
      const source = edge.source().position();
      const target = edge.target().position();
      const x = source.x + (target.x - source.x) * point.delta;
      const y = source.y + (target.y - source.y) * point.delta;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, 2 * Math.PI, true);
      this.ctx.fill();
    });
  }

  private currentStep(): number {
    return Date.now() - this.previousTimestamp;
  }

  private processEdges(edges: any): TrafficEdgeHash {
    return edges.map(edge => {
      const edgeId = edge.data('id');
      const timer = this.timerForRate(edge.data('rate'));
      const speed = this.speedForLatency(edge.data('latency'));
      if (edgeId in this.trafficEdges) {
        const trafficEdge = this.trafficEdges[edgeId];
        trafficEdge.setTimer(timer);
        trafficEdge.setSpeed(speed);
        trafficEdge.setEdge(edge);
      } else {
        this.trafficEdges[edgeId] = new TrafficEdge(speed, timer, edge);
      }
      return this.trafficEdges[edgeId];
    });
  }

  private timerForRate(rate: number) {
    if (isNaN(rate) || rate === 0) {
      return undefined;
    }
    // Normalize from 0 rps to 1000 rps
    const delta = clamp(rate, 0, 400) / 400;
    // Invert and scale to (TIMER_FOR_RATE_MIN, TIMER_FOR_RATE_MAX)
    return this.TIMER_FOR_RATE_MIN + (1 - delta) * (this.TIMER_FOR_RATE_MAX - this.TIMER_FOR_RATE_MIN);
  }

  private speedForLatency(latency: number) {
    if (isNaN(latency)) {
      return 800;
    }
    // Normalize from 0 to 10 seconds
    const delta = clamp(latency, 0, 10);
    // Scale from (800 to 8000)
    return 800 + delta * (8000 - 800);
  }
}
