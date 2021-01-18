import * as React from 'react';
import './CreateAnnotation.css';
import AnnotationBuilder from './AnnotationBuilder';
import Annotations from './Annotations';
import { KialiAnnotation, KialiAnnotationConfig } from '../../../types/KialiAnnotation';

interface Props {
  annotation?: { [key: string]: string };
  updateAnnotation: (annotation: { [key: string]: string }) => void;
}

interface State {
  annotation: string;
}

class CreateAnnotation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      annotation: this.props.annotation ? new KialiAnnotation(this.props.annotation).getHealthRate() : ''
    };
  }

  removeAnnotation = (index: number) => {
    var annotations = this.state.annotation.split(';');
    var annotationText = '';
    if (annotations.length > 1) {
      annotations.splice(index, 1);
      annotationText = annotations.join(';');
    }
    this.updateAnnotation(annotationText);
  };

  addAnnotation = (annotation: string) => {
    if (this.state.annotation.length > 0) {
      var annotations = this.state.annotation.split(';');
      annotations.push(annotation);
      this.updateAnnotation(annotations.join(';'));
    } else {
      this.updateAnnotation(annotation);
    }
  };

  updateAnnotation = (annotation: string) => {
    this.setState({ annotation });
    var annotations = {};
    annotations[KialiAnnotationConfig.HEALTH_RATE] = annotation;
    this.props.updateAnnotation(annotations);
  };

  render() {
    return (
      <>
        <AnnotationBuilder addAnnotation={this.addAnnotation} />
        <Annotations annotation={this.state.annotation} onRemove={this.removeAnnotation} />
      </>
    );
  }
}

export default CreateAnnotation;
