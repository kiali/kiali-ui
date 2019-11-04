import * as React from 'react';
import { Paths } from '../../config';
import { Link } from 'react-router-dom';
import { Badge, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { IstioTypes } from '../VirtualList/Config';

interface Props {
  name: string;
  namespace: string;
  type: string;
}

const IstioObjectLink = (props: Props) => {
  const { name, namespace, type } = props;
  //const objectType = type.charAt(0).toUpperCase() + type.slice(1);
  const istioType = IstioTypes[type];
  const url = '/namespaces/' + namespace + '/' + Paths.ISTIO + '/' + istioType.slug + '/' + name;
  return (
    <>
      <Tooltip position={TooltipPosition.top} content={<>{istioType.name}</>}>
        <Badge className={'virtualitem_badge_definition'}>{istioType.icon}</Badge>
      </Tooltip>
      <Link to={url}>
        {namespace}/{name}
      </Link>
    </>
  );
};

export default IstioObjectLink;
