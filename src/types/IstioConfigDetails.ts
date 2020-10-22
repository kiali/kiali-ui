import Namespace from './Namespace';
import { ResourcePermissions } from './Permissions';
import {
  AuthorizationPolicy,
  DestinationRule,
  Gateway,
  ServiceEntry,
  VirtualService,
  ObjectValidation,
  Sidecar,
  IstioObject,
  PeerAuthentication,
  RequestAuthentication,
  WorkloadEntry,
  EnvoyFilter
} from './IstioObjects';
import { AceOptions } from 'react-ace/types';

export interface IstioConfigId {
  namespace: string;
  objectType: string;
  objectSubtype: string;
  object: string;
}

export interface IstioConfigDetails {
  namespace: Namespace;
  gateway: Gateway;
  virtualService: VirtualService;
  destinationRule: DestinationRule;
  serviceEntry: ServiceEntry;
  sidecar: Sidecar;
  workloadEntry: WorkloadEntry;
  envoyFilter: EnvoyFilter;
  authorizationPolicy: AuthorizationPolicy;
  peerAuthentication: PeerAuthentication;
  requestAuthentication: RequestAuthentication;
  permissions: ResourcePermissions;
  validation: ObjectValidation;
}

export const aceOptions: AceOptions = {
  showPrintMargin: false,
  autoScrollEditorIntoView: true
};

export const safeDumpOptions = {
  styles: {
    '!!null': 'canonical' // dump null as ~
  }
};

export interface ParsedSearch {
  type?: string;
  name?: string;
}

export interface IstioPermissions {
  [namespace: string]: {
    [type: string]: ResourcePermissions;
  };
}

// Helper function to compare two IstioConfigDetails iterating over its IstioObject children.
// When an IstioObject child has changed (resourceVersion is different) it will return a tuple with
//  boolean: true if resourceVersion has changed in newer version
//  string: IstioObject child
//  string: resourceVersion of newer version
export const compareResourceVersion = (
  oldIstioConfigDetails,
  newIstioConfigDetails: IstioConfigDetails
): [boolean, string, string] => {
  const keys = Object.keys(oldIstioConfigDetails);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const oldIstioObject = oldIstioConfigDetails[key] as IstioObject;
    const newIstioObject = newIstioConfigDetails[key] as IstioObject;
    if (
      oldIstioObject &&
      newIstioObject &&
      oldIstioObject.metadata &&
      newIstioObject.metadata &&
      oldIstioObject.metadata.resourceVersion &&
      newIstioObject.metadata.resourceVersion &&
      oldIstioObject.metadata.resourceVersion !== newIstioObject.metadata.resourceVersion
    ) {
      return [true, key, newIstioObject.metadata.resourceVersion];
    }
  }
  return [false, '', ''];
};
