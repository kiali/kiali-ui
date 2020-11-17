export interface MeshCluster {
  apiEndpoint: string;
  isKialiHome: boolean;
  name: string;
  secretName: string;
}

export type MeshClusters = MeshCluster[];
