export interface MeshCluster {
  apiEndpoint: string;
  isHomeCluster: boolean;
  name: string;
  secretName: string;
}

export type MeshClusters = MeshCluster[];
