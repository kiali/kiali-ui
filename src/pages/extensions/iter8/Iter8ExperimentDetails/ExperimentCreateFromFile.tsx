import * as React from 'react';
import * as API from '../../../../services/Api';
import * as AlertUtils from '../../../../utils/AlertUtils';
import {
  ActionGroup,
  Button,
  ButtonVariant,
  FileUpload,
  Form,
  FormGroup,
  Grid,
  GridItem
} from '@patternfly/react-core';
import history from '../../../../app/History';
import { RenderComponentScroll, RenderContent } from '../../../../components/Nav/Page';
import Namespace, { namespacesToString } from '../../../../types/Namespace';
import { PromisesRegistry } from '../../../../utils/CancelablePromises';
import { KialiAppState } from '../../../../store/Store';
import { activeNamespacesSelector } from '../../../../store/Selectors';
import { connect } from 'react-redux';
import { style } from 'typestyle';
import { parseYamlValidations } from '../../../../types/AceValidations';
import AceEditor from 'react-ace';
import { aceOptions } from '../../../../types/IstioConfigDetails';
import { TextInputBase as TextInput } from '@patternfly/react-core/dist/js/components/TextInput/TextInput';
import { jsYaml } from '../../../../types/AceValidations';

interface Props {
  activeNamespaces: Namespace[];
  serviceName: string;
  namespace: string;
  showAdvanced: boolean;
}

interface State {
  filename: string;
  experimentYaml: any;
  isLoading: boolean;
  yamlModified: boolean;
  isModified: boolean;
  yamlFilename: string;
}

const containerPadding = style({ padding: '20px 20px 20px 20px' });

class ExperimentCreateFromFile extends React.Component<Props, State> {
  aceEditorRef: React.RefObject<AceEditor>;
  private promises = new PromisesRegistry();

  constructor(props: Props) {
    super(props);
    this.state = {
      filename: '',
      yamlFilename: '',
      experimentYaml: '',
      isLoading: false,
      isModified: false,
      yamlModified: false
    };
    this.aceEditorRef = React.createRef();
  }

  handleFileChange = (experimentYaml, filename, _) => this.setState({ experimentYaml, filename });
  handleFileReadStarted = () => this.setState({ isLoading: true });
  handleFileReadFinished = () => this.setState({ isLoading: false });

  componentWillUnmount() {
    this.promises.cancelAll();
  }

  // Invoke the history object to update and URL and start a routing
  goExperimentsPage = () => {
    history.push('/extensions/iter8');
  };

  onEditorChange = (value: string) => {
    this.setState({
      isModified: true,
      yamlModified: false,
      experimentYaml: value
    });
  };

  // It invokes backend to create  a new experiment
  createExperiment = () => {
    // if (this.props.activeNamespaces.length === 1) {
    const nsName = this.props.activeNamespaces[0].name;
    const params: any = {};
    params.type = 'json';
    let experimentJson = jsYaml.safeLoad(this.state.experimentYaml);
    this.promises
      .register('Create Iter8 Experiment', API.createExperiment(nsName, JSON.stringify(experimentJson), params))
      .then(_ => this.goExperimentsPage())
      .catch(error => AlertUtils.addError('Could not create Experiment.', error));
  };

  renderEditor = () => {
    const yamlSource = this.state.experimentYaml;
    const editorSpan = 12;
    let editorValidations = parseYamlValidations(yamlSource);

    return (
      <>
        <Grid style={{ margin: '10px' }} gutter={'md'}>
          <GridItem span={editorSpan}>
            <AceEditor
              ref={this.aceEditorRef}
              mode="yaml"
              theme="eclipse"
              onChange={this.onEditorChange}
              width={'100%'}
              height={'var(--kiali-yaml-editor-height)'}
              className={'istio-ace-editor'}
              wrapEnabled={true}
              readOnly={false}
              setOptions={aceOptions}
              value={yamlSource}
              annotations={editorValidations.annotations}
              markers={editorValidations.markers}
            />
          </GridItem>
        </Grid>
      </>
    );
  };

  updateValue = (val: string) => {
    this.setState({ yamlFilename: val });
  };

  loadFromURL = () => {
    this.setState({ isLoading: true });
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    const promise = fetch(this.state.yamlFilename, { signal: controller.signal })
      .then(resp => {
        if (!resp.ok) {
          AlertUtils.addError(resp.statusText);
          this.setState({ isLoading: false });
          throw resp;
        }
        return resp.text();
      })
      .then(data => {
        this.setState(prevState => {
          return {
            experimentYaml: data,
            isLoading: !prevState.isLoading
          };
        });
      });
    promise.catch(err => {
      if (err.name === 'AbortError') {
        AlertUtils.addError('Request took more than 5 seconds. Automatically cancelled.', err);
        this.setState({ isLoading: false });
        return;
      }
      AlertUtils.addError('Invalid fetch URL', err);

      this.setState({ isLoading: false });
    });
  };

  isFormValid = (): boolean => {
    return this.props.activeNamespaces.length === 1 && this.state.experimentYaml !== undefined;
  };

  render() {
    const { filename, isLoading, experimentYaml } = this.state;
    return (
      <>
        <RenderContent>
          <Form isHorizontal={true}>
            <div className={containerPadding}>
              <FormGroup
                fieldId="title"
                label="Load from Local"
                isRequired={true}
                helperTextInvalid="Name cannot be empty and must be a DNS subdomain name as defined in RFC 1123."
              >
                <FileUpload
                  id="text-file-with-edits-allowed"
                  type="text"
                  value={experimentYaml}
                  filename={filename}
                  onChange={this.handleFileChange}
                  onReadStarted={this.handleFileReadStarted}
                  onReadFinished={this.handleFileReadFinished}
                  isLoading={isLoading}
                  hideDefaultPreview
                  isReadOnly={false}
                />
              </FormGroup>
              <FormGroup
                fieldId="title"
                label="Load from URL"
                isRequired={true}
                helperTextInvalid="Name cannot be empty and must be a DNS subdomain name as defined in RFC 1123."
              >
                <TextInput
                  id="url"
                  placeholder="https://raw.githubusercontent.com/iter8-tools/iter8-controller/v0.2.1/doc/tutorials/istio/bookinfo/canary_reviews-v2_to_reviews-v3.yaml"
                  value={this.state.yamlFilename}
                  onChange={value => this.updateValue(value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      this.loadFromURL();
                    }
                  }}
                />
              </FormGroup>
              <ActionGroup>
                <span
                  style={{
                    float: 'left',
                    paddingTop: '0px',
                    paddingBottom: '10px',
                    width: '100%'
                  }}
                >
                  {this.props.activeNamespaces.length === 1 ? (
                    <span style={{ float: 'left' }}>
                      Experiment will be created at namespace: {namespacesToString(this.props.activeNamespaces)}
                    </span>
                  ) : (
                    <span style={{ float: 'left', color: 'red' }}>namespace missing</span>
                  )}
                  <span style={{ float: 'right', paddingRight: '5px' }}>
                    <Button
                      variant={ButtonVariant.primary}
                      isDisabled={!this.isFormValid()}
                      onClick={() => this.createExperiment()}
                    >
                      Create
                    </Button>
                  </span>
                  <span style={{ float: 'right', paddingRight: '5px' }}>
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={() => {
                        this.goExperimentsPage();
                      }}
                    >
                      Cancel
                    </Button>
                  </span>
                </span>
              </ActionGroup>
              <RenderComponentScroll>{this.renderEditor()}</RenderComponentScroll>
            </div>
          </Form>
        </RenderContent>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  activeNamespaces: activeNamespacesSelector(state)
});

const ExperimentCreateFromFileContainer = connect(mapStateToProps, null)(ExperimentCreateFromFile);

export default ExperimentCreateFromFileContainer;
