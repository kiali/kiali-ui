import { AceValidations } from './AceValidations';

export enum KialiAnnotationConfig {
  HEALTH_RATE = 'health.kiali.io/rate'
}

export type Annotation = {
  title: string;
  id: string;
  validated: boolean;
  severity: string;
  error: string;
  content: string;
};

export class KialiAnnotation {
  annotation: { [key: string]: string };
  isValid: boolean;
  severity: string;
  validations: Annotation[];
  aceValidations: AceValidations;

  constructor(annotation: { [key: string]: string }) {
    this.annotation = annotation;
    this.validations = [];
    this.aceValidations = { markers: [], annotations: [] };
    this.isValid = false;
    this.severity = '';
    this.validate();
  }

  getHealthRate = () => {
    return this.annotation[KialiAnnotationConfig.HEALTH_RATE] || '';
  };

  validate = () => {
    Object.keys(this.annotation).forEach((key, i) => {
      switch (key) {
        case KialiAnnotationConfig.HEALTH_RATE:
          this.validateHealth(this.annotation[key], i);
          break;
        default:
          break;
      }
      return;
    });
    const validationsFail = this.validations.filter(val => val.validated === false);
    this.isValid = !(validationsFail.length > 0);
    this.severity = validationsFail.filter(val => val.severity === 'error').length > 0 ? 'error' : 'warning';
  };

  validateHealthNumber = (num: string): { error: string; number: number } => {
    var error = '';
    var number = 0;
    const value_1 = Number(num);
    if (value_1) {
      if (0 < value_1 && value_1 <= 100) {
        number = value_1;
      } else {
        error = num + ' should be between 0-100';
      }
    } else {
      error = num + ' is not a number';
    }
    return { error, number };
  };

  validateHealth = (annotation: string, index: number): boolean => {
    var result = true;
    var pos_annotation_start = KialiAnnotationConfig.HEALTH_RATE.length + 2;
    annotation.split(';').forEach(annotation => {
      const annotationResult = this.validateHealthAnnotation(annotation, index, pos_annotation_start);
      result = result ? annotationResult : true;
      pos_annotation_start += annotation.length + 1;
    });
    return result;
  };

  validateHealthAnnotation = (annotation: string, index: number, pos_ini: number): boolean => {
    const filt = this.validations.filter(annotation => annotation.id === KialiAnnotationConfig.HEALTH_RATE);
    if (filt.length === 1) {
      return filt[0].validated;
    }
    var annotate: Annotation = {
      title: 'Health Rate',
      id: KialiAnnotationConfig.HEALTH_RATE,
      error: '',
      validated: true,
      severity: '',
      content: annotation
    };

    var pos_parameter = pos_ini;

    const steps = annotation.split(',');
    if (steps.length > 1) {
      // Case 2 parameters, defined failure only
      if (steps.length >= 4) {
        pos_parameter += steps[0].length + 1;
        var value_1 = this.validateHealthNumber(steps[1]);
        if (value_1.error !== '') {
          this.addAnnotation('In col ' + pos_parameter + ' : ' + value_1.error, index, 'error');
          this.addMarker(index, pos_parameter, steps[1].length, 'error');
          annotate.validated = false;
          annotate.severity = 'error';
        }
        const pos_value_1 = pos_parameter;
        pos_parameter += steps[1].length + 1;
        var value_2 = this.validateHealthNumber(steps[2]);
        if (value_2.error !== '') {
          this.addAnnotation('In col ' + pos_parameter + ' : ' + value_2.error, index, 'error');
          this.addMarker(index, pos_parameter, steps[2].length, 'error');
          annotate.validated = false;
          annotate.severity = 'error';
        }

        // Check degraded less than failure
        if (value_1.number && value_2.number && value_1.number > value_2.number) {
          this.addAnnotation(
            'In col ' + pos_value_1 + ' : Degraded value ' + value_1 + ' should be lower than Failure value ' + value_2,
            index,
            'error'
          );
          this.addMarker(index, pos_value_1, steps[1].length + steps[2].length + 1, 'error');
          annotate.validated = false;
          annotate.severity = 'error';
        }
        pos_parameter += steps[2].length + 1;
        pos_parameter += steps[3].length + 1;
        // Check direction
        if (steps.length === 5) {
          const reg = new RegExp(steps[5]);
          if (!(reg.test('inbound') || reg.test('outbound'))) {
            this.addAnnotation(
              'In col ' +
                pos_parameter +
                ' : Direction value ' +
                value_1 +
                ' should include inbound, outbound or both ',
              index,
              'warning'
            );
            this.addMarker(index, pos_parameter, steps[5].length, 'warning');
            annotate.validated = false;
            annotate.severity = annotate.severity === 'error' ? 'error' : 'warning';
          }
        }
      } else {
        // We need more parameters
        this.addAnnotation(
          'Kiali can process this annotation with only 3 parameter. Should be code,degraded,failure,protocol like 4x4,10,20,http',
          index,
          'error'
        );
        this.addMarker(index, pos_ini, annotation.length, 'error');
        annotate.validated = false;
        annotate.severity = 'error';
      }
    } else {
      this.addAnnotation('Kiali can process this annotation with only 1 parameter', index, 'error');
      this.addMarker(
        index,
        KialiAnnotationConfig.HEALTH_RATE.length,
        KialiAnnotationConfig.HEALTH_RATE.length + annotation.length + 2,
        'error'
      );
    }
    this.validations.push(annotate);
    return annotate.validated;
  };

  addAnnotation = (errMsg: string, row: number, errType: string) => {
    this.aceValidations.annotations.push({
      column: 0,
      row: row,
      text: errMsg,
      type: errType
    });
  };

  addMarker = (row: number, col: number, length: number, errType: string) => {
    this.aceValidations.markers.push({
      startRow: row,
      startCol: col + 2,
      endRow: row,
      endCol: length,
      className: 'kialiAnnotation-' + errType,
      type: 'text'
    });
  };
}
