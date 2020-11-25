import * as U from '../';
import { ToleranceConfig } from '../../ServerConfig';

const defaultTolerance = (): ToleranceConfig => {
  return {
    code: new RegExp(''),
    degraded: U.DEFAULTCONF.degraded,
    failure: U.DEFAULTCONF.failure,
    protocol: U.DEFAULTCONF.protocol,
    direction: U.DEFAULTCONF.direction
  };
};

describe('Utils library', () => {
  describe('Parse Annotation', () => {
    it('should return tolerances with defaults if only code', () => {
      var tol = defaultTolerance();
      tol.code = new RegExp('[45]');
      expect(U.parseAnnotationTEST('[45]')).toEqual(tol);
    });

    it('should replace x or X by d', () => {
      var tol = defaultTolerance();
      tol.code = new RegExp('[45]\\d[2]');
      expect(U.parseAnnotationTEST('[45]x[2]')).toEqual(tol);
      expect(U.parseAnnotationTEST('[45]X[2]')).toEqual(tol);
    });

    it('should return tolerances with defaults if code and degraded', () => {
      var tol = defaultTolerance();
      tol.code = new RegExp('[45]');
      tol.degraded = 2;
      expect(U.parseAnnotationTEST('[45],2')).toEqual(tol);
    });

    it('should return tolerances with defaults if code, degraded and failure', () => {
      var tol = defaultTolerance();
      tol.code = new RegExp('[45]');
      tol.degraded = 2;
      tol.failure = 4;
      expect(U.parseAnnotationTEST('[45],2,4')).toEqual(tol);
    });

    it('should return tolerances with defaults if code, degraded and protocol', () => {
      var tol = defaultTolerance();
      tol.code = new RegExp('[45]');
      tol.degraded = 2;
      tol.protocol = new RegExp('http');
      expect(U.parseAnnotationTEST('[45],2,http')).toEqual(tol);
    });

    it('should return tolerances with defaults if code and protocol', () => {
      var tol = defaultTolerance();
      tol.code = new RegExp('[45]');
      tol.protocol = new RegExp('http');
      expect(U.parseAnnotationTEST('[45],http')).toEqual(tol);
    });

    it('should return tolerances with defaults if code, protocol and direction', () => {
      var tol = defaultTolerance();
      tol.code = new RegExp('[45]');
      tol.protocol = new RegExp('http');
      tol.direction = new RegExp('inbound');
      expect(U.parseAnnotationTEST('[45],http,inbound')).toEqual(tol);
    });

    it('should return tolerance if all defined', () => {
      var tol = defaultTolerance();
      tol.code = new RegExp('[45]');
      tol.degraded = 5;
      tol.failure = 8;
      tol.protocol = new RegExp('http');
      tol.direction = new RegExp('inbound');
      expect(U.parseAnnotationTEST('[45],5,8,http,inbound')).toEqual(tol);
    });
  });
});
