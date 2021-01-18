import * as React from 'react';
import AceEditor from 'react-ace';
import { jsYaml } from '../../types/AceValidations';
import { KialiAnnotation } from '../../types/KialiAnnotation';
import './Annotation.css';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';

interface Props {
  annotation?: { [key: string]: string };
  promise: Promise<ServiceDetailsInfo>;
}

interface State {
  annotation?: KialiAnnotation;
}

class Annotation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { annotation: this.props.annotation ? new KialiAnnotation(this.props.annotation) : undefined };
  }

  componentDidUpdate() {
    this.props.promise.then(results => {
      this.setState({
        annotation:
          Object.keys(results.service.healthAnnotations).length > 0
            ? new KialiAnnotation(results.service.healthAnnotations)
            : undefined
      });
    });
  }

  render() {
    return (
      <>
        {this.state.annotation ? (
          <AceEditor
            mode={'yaml'}
            theme="eclipse"
            height={'var(--kiali-yaml-editor-height)'}
            width={'100%'}
            className={'istio-ace-editor'}
            wrapEnabled={true}
            readOnly={true}
            value={jsYaml.safeDump(this.state.annotation.annotation)}
            annotations={this.state.annotation.aceValidations.annotations}
            markers={this.state.annotation.aceValidations.markers}
          />
        ) : (
          'No loaded'
        )}
      </>
    );
  }
}

export default Annotation;
