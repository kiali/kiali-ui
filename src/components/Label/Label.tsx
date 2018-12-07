import * as React from 'react';
import PropTypes from 'prop-types';
import { Label as PfLabel } from 'patternfly-react';
import './Label.css';
import { isNotObject } from '../../utils/Common';

const Label = ({ name, value }) => {
  if (isNotObject(name) && isNotObject(value)) {
    return (
      <span className="label-pair">
        <PfLabel bsStyle="primary" className="label-key">
          {name}
        </PfLabel>
        <PfLabel bsStyle="primary" className="label-value">
          {value || ''}
        </PfLabel>
      </span>
    );
  } else {
    return <span>This label has an unexpected format</span>;
  }
};

Label.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string
};

export default Label;
