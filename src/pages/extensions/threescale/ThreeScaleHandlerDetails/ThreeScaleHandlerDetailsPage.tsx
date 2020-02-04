import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  ActionGroup,
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  Form,
  FormGroup,
  TextInput,
  Title,
  Toolbar,
  ToolbarSection
} from '@patternfly/react-core';
import { style } from 'typestyle';
import { PfColors } from '../../../../components/Pf/PfColors';
import * as API from '../../../../services/Api';
import * as AlertUtils from '../../../../utils/AlertUtils';
import { ThreeScaleHandler, ThreeScaleInfo } from '../../../../types/ThreeScale';
import { RenderContent } from '../../../../components/Nav/Page';
import history from '../../../../app/History';
import RefreshButtonContainer from '../../../../components/Refresh/RefreshButton';

interface Props {
  handlerName: string;
}
interface State {
  isNew: boolean;
  isModified: boolean;
  threeScaleInfo: ThreeScaleInfo;
  handler: ThreeScaleHandler;
  dropdownOpen: boolean;
}

const containerPadding = style({ padding: '20px 20px 20px 20px' });
const containerWhite = style({ backgroundColor: PfColors.White });
const rightToolbar = style({ marginLeft: 'auto' });

const k8sRegExpName = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[-a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

const isValidK8SName = (name: string) => {
  return name === '' ? false : name.search(k8sRegExpName) === 0;
};

// Used only when there is no namespace selector, otherwise use the SecondaryMasthead component

const actionsToolbar = (
  dropdownOpen: boolean,
  onSelect: () => void,
  onToggle: (toggle: boolean) => void,
  onClick: () => void
) => {
  return (
    <Dropdown
      id="actions"
      title="Actions"
      toggle={<DropdownToggle onToggle={onToggle}>Actions</DropdownToggle>}
      onSelect={onSelect}
      position={DropdownPosition.right}
      isOpen={dropdownOpen}
      dropdownItems={[
        <DropdownItem key="createIstioConfig" onClick={onClick}>
          Create New 3scale Handler
        </DropdownItem>
      ]}
    />
  );
};

class ThreeScaleHandlerDetailsPage extends React.Component<RouteComponentProps<Props>, State> {
  constructor(props: RouteComponentProps<Props>) {
    super(props);
    this.state = {
      isNew: true,
      isModified: false,
      threeScaleInfo: {
        enabled: false,
        permissions: {
          create: false,
          update: false,
          delete: false
        }
      },
      handler: {
        name: '',
        serviceId: '',
        systemUrl: '',
        accessToken: ''
      },
      dropdownOpen: false
    };
  }

  // This is a simplified toolbar only using a refresh button, other pages build a Filter/Sorting toolbar
  toolbar = (
    onRefresh: () => void,
    dropdownOpen: boolean,
    onSelect: () => void,
    onToggle: (toggle: boolean) => void,
    onClick: () => void
  ) => {
    return (
      <Toolbar className="pf-l-toolbar pf-u-justify-content-space-between pf-u-mx-xl pf-u-my-md">
        <ToolbarSection aria-label="ToolbarSection">
          <Toolbar className={rightToolbar}>
            <RefreshButtonContainer key={'Refresh'} handleRefresh={onRefresh} />
            {this.canDelete() && actionsToolbar(dropdownOpen, onSelect, onToggle, onClick)}
          </Toolbar>
        </ToolbarSection>
      </Toolbar>
    );
  };

  pageTitle = (title: string) => (
    <div className={`${containerPadding} ${containerWhite}`}>
      <Title headingLevel="h1" size="4xl" style={{ margin: '20px 0 0' }}>
        {title}
      </Title>
      {!this.state.isNew &&
        this.toolbar(
          () => {
            this.fetchInfoHandler(this.props.match.params.handlerName);
          },
          this.state.dropdownOpen,
          () => {
            this.setState({
              dropdownOpen: !this.state.dropdownOpen
            });
          },
          toggle => {
            this.setState({
              dropdownOpen: toggle
            });
          },
          () => {
            this.onDeleteHandler();
          }
        )}
    </div>
  );

  fetchInfoHandler = (handlerName: string | undefined) => {
    API.getThreeScaleInfo()
      .then(result => {
        const threeScaleInfo = result.data;
        if (handlerName) {
          API.getThreeScaleHandlers()
            .then(results => {
              let handler: ThreeScaleHandler | undefined = undefined;
              for (let i = 0; results.data.length; i++) {
                if (results.data[i].name === handlerName) {
                  handler = results.data[i];
                  break;
                }
              }
              if (handler) {
                this.setState({
                  isNew: false,
                  threeScaleInfo: threeScaleInfo,
                  handler: handler
                });
              } else {
                AlertUtils.addError('Could not fetch ThreeScaleHandler ' + handlerName + '.');
              }
            })
            .catch(error => {
              AlertUtils.addError('Could not fetch ThreeScaleHandlers.', error);
            });
        } else {
          this.setState({
            threeScaleInfo: threeScaleInfo
          });
        }
      })
      .catch(error => {
        AlertUtils.addError('Could not fetch ThreeScaleInfo.', error);
      });
  };

  componentDidMount() {
    this.fetchInfoHandler(this.props.match.params.handlerName);
  }

  canCreate = (): boolean => {
    return this.state.threeScaleInfo.enabled && this.state.threeScaleInfo.permissions.create;
  };

  canUpdate = (): boolean => {
    return this.state.threeScaleInfo.enabled && this.state.threeScaleInfo.permissions.update;
  };

  canDelete = (): boolean => {
    return this.state.threeScaleInfo.enabled && this.state.threeScaleInfo.permissions.delete;
  };

  goHandlersPage = () => {
    // Invoke the history object to update and URL and start a routing
    history.push('/extensions/threescale');
  };

  isValid = () => {
    return (
      this.state.handler.name !== '' &&
      this.state.handler.serviceId !== '' &&
      this.state.handler.systemUrl !== '' &&
      this.state.handler.accessToken !== ''
    );
  };

  onChangeHandler = (field: string, value: string) => {
    this.setState(prevState => {
      const newThreeScaleHandler = prevState.handler;
      switch (field) {
        case 'handlerName':
          newThreeScaleHandler.name = value.trim();
          break;
        case 'serviceId':
          newThreeScaleHandler.serviceId = value.trim();
          break;
        case 'accessToken':
          newThreeScaleHandler.accessToken = value.trim();
          break;
        case 'systemUrl':
          newThreeScaleHandler.systemUrl = value.trim();
          break;
        default:
      }
      return {
        isNew: prevState.isNew,
        isModified: true,
        handler: newThreeScaleHandler
      };
    });
  };

  onUpdateHandler = () => {
    if (this.state.isNew) {
      API.createThreeScaleHandler(JSON.stringify(this.state.handler))
        .then(_ => this.goHandlersPage())
        .catch(error => AlertUtils.addError('Could not create ThreeScaleHandlers.', error));
    } else {
      API.updateThreeScaleHandler(this.state.handler.name, JSON.stringify(this.state.handler))
        .then(_ => this.goHandlersPage())
        .catch(error => AlertUtils.addError('Could not update ThreeScaleHandlers.', error));
    }
  };

  onDeleteHandler = () => {
    API.deleteThreeScaleHandler(this.state.handler.name)
      .then(_ => this.goHandlersPage())
      .catch(error => AlertUtils.addError('Could not delete ThreeScaleHandlers.', error));
  };

  render() {
    const title = this.props.match.params.handlerName
      ? '3scale Handler ' + this.props.match.params.handlerName
      : 'Create New 3scale Handler';
    return (
      <>
        {this.pageTitle(title)}
        <RenderContent>
          <div className={containerPadding}>
            <Form isHorizontal={true}>
              <FormGroup
                fieldId="handlerName"
                label="Handler Name:"
                isValid={isValidK8SName(this.state.handler.name)}
                helperTextInvalid="Name must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character."
              >
                <TextInput
                  id="handlerName"
                  value={this.state.handler.name}
                  placeholder="3scale Handler Name"
                  onChange={value => this.onChangeHandler('handlerName', value)}
                  isDisabled={!this.state.isNew}
                />
              </FormGroup>
              <FormGroup
                fieldId="serviceId"
                label="Service Id:"
                isValid={this.state.handler.serviceId !== ''}
                helperTextInvalid="Service Id cannot be empty"
              >
                <TextInput
                  id="serviceId"
                  value={this.state.handler.serviceId}
                  placeholder="3scale ID for API calls"
                  onChange={value => this.onChangeHandler('serviceId', value)}
                />
              </FormGroup>
              <FormGroup
                fieldId="systemUrl"
                label="System Url:"
                isValid={this.state.handler.systemUrl !== ''}
                helperTextInvalid="System Url cannot be empty"
              >
                <TextInput
                  id="systemUrl"
                  value={this.state.handler.systemUrl}
                  placeholder="3scale System Url for API"
                  onChange={value => this.onChangeHandler('systemUrl', value)}
                />
              </FormGroup>
              <FormGroup
                fieldId="accessToken"
                label="Access Token:"
                isValid={this.state.handler.accessToken !== ''}
                helperTextInvalid="Access Token cannot be empty"
              >
                <TextInput
                  id="accessToken"
                  value={this.state.handler.accessToken}
                  placeholder="3scale access token"
                  onChange={value => this.onChangeHandler('accessToken', value)}
                />
              </FormGroup>
              <ActionGroup>
                <span style={{ float: 'left', paddingTop: '10px', paddingBottom: '10px' }}>
                  {this.canUpdate() && (
                    <span style={{ paddingRight: '5px' }}>
                      <Button
                        variant={ButtonVariant.primary}
                        isDisabled={!this.isValid()}
                        onClick={this.onUpdateHandler}
                      >
                        {this.state.isNew ? 'Create' : 'Save'}
                      </Button>
                    </span>
                  )}
                  <span style={{ paddingRight: '5px' }}>
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={() => {
                        this.goHandlersPage();
                      }}
                    >
                      Cancel
                    </Button>
                  </span>
                </span>
              </ActionGroup>
              <>
                Notes:
                <br />
                Changes in a 3scale handler will affect to all linked services.
              </>
            </Form>
          </div>
        </RenderContent>
      </>
    );
  }
}

export default ThreeScaleHandlerDetailsPage;
