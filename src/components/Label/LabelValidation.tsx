import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { Badge } from '@patternfly/react-core';
import { labelValidation, LabelValidations } from '../../types/Label';
import './LabelValidation.css';
import { serverConfig } from '../../config';
import { PFColors } from '../Pf/PfColors';

interface Props {
  name: string;
  kind: string;
  namespace: string;
  labels: { [key: string]: string };
  smallRender?: boolean;
}

class LabelValidation extends React.Component<Props> {
  renderValidations = (validations: LabelValidations[], hasMissingApp: boolean, hasMissingVersion: boolean) => {
    return (
      <ul style={{ listStyleType: 'none', paddingLeft: 12 }}>
        {hasMissingApp && (
          <li>
            Missing{' '}
            <Badge isRead={true} className={'virtualitem_badge_definition'}>
              app
            </Badge>
            label
          </li>
        )}
        {hasMissingVersion && (
          <li>
            Missing{' '}
            <Badge isRead={true} className={'virtualitem_badge_definition'}>
              version
            </Badge>
            label
          </li>
        )}
        {validations.map(validation => (
          <li>
            {validation.notPresence && (
              <>
                Missing{' '}
                <Badge isRead={true} className={'virtualitem_badge_definition'}>
                  {validation.key}
                </Badge>
                label
              </>
            )}
            {validation.regex && (
              <>
                Label{' '}
                <Badge isRead={true} className={'virtualitem_badge_definition'}>
                  {validation.key}
                </Badge>
                not match the regex
              </>
            )}
          </li>
        ))}
      </ul>
    );
  };

  renderTooltip = (errors: number) => {
    const icon = <ExclamationTriangleIcon style={{ color: PFColors.Warning, marginLeft: '5px' }} />;
    return this.props.smallRender ? (
      <Badge key={'error_validation'} isRead={true} style={{ marginTop: '7px' }}>
        {errors}
        {icon}
      </Badge>
    ) : (
      icon
    );
  };

  render() {
    const isWorkload = 'workload' === this.props.kind;
    const hasMissingApp = isWorkload && !this.props.labels[serverConfig.istioLabels.appLabelName];
    const hasMissingVersion = isWorkload && !this.props.labels[serverConfig.istioLabels.versionLabelName];
    const validations = labelValidation(this.props.name, this.props.kind, this.props.namespace, this.props.labels);
    const errors = validations.length + (hasMissingApp ? 1 : 0) + (hasMissingVersion ? 1 : 0);
    return (
      <>
        {errors > 0 && (
          <>
            {!this.props.smallRender && <>Found {errors} errors validations</>}
            <Tooltip
              content={this.renderValidations(validations, hasMissingApp, hasMissingVersion)}
              className={'label_validation'}
            >
              {this.renderTooltip(errors)}
            </Tooltip>
          </>
        )}
      </>
    );
  }
}

export default LabelValidation;
