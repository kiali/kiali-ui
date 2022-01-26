import * as React from 'react';
import { ObjectValidation, VirtualService } from '../../../types/IstioObjects';

interface VirtualServiceProps {
  namespace: string;
  virtualService: VirtualService;
  validation?: ObjectValidation;
}

class VirtualServiceOverview extends React.Component<VirtualServiceProps> {
  render() {
    return <></>;
  }
}

export default VirtualServiceOverview;
