import * as React from 'react';
import { StarIcon } from '@patternfly/react-icons';
import { cellWidth, sortable, Table, TableBody, TableHeader } from '@patternfly/react-table';

import { RenderContent } from '../../components/Nav/Page';
import { getMeshClusters } from '../../services/Api';
import { MeshClusters } from '../../types/Clustering';

const MeshStructurePage: React.FunctionComponent = () => {
  const [meshClustersList, setMeshClustersList] = React.useState(null as MeshClusters | null);

  const columns = [
    {
      title: 'Cluster Name',
      transforms: [sortable, cellWidth(30)]
    },
    {
      title: 'API Endpoint',
      transforms: [sortable, cellWidth(30)]
    },
    {
      title: 'Secret name',
      transforms: [sortable, cellWidth(30)]
    }
  ];

  const clusterRows = meshClustersList
    ? meshClustersList.map(cluster => ({
        cells: [
          <>
            {cluster.isHomeCluster ? <StarIcon /> : null} {cluster.name}
          </>,
          cluster.apiEndpoint,
          cluster.secretName
        ]
      }))
    : [];

  async function fetchMeshClusters() {
    try {
      const meshClusters = await getMeshClusters();
      setMeshClustersList(meshClusters.data);
    } catch {}
  }

  React.useEffect(() => {
    fetchMeshClusters();
  }, []);

  return (
    <RenderContent>
      <Table aria-label="Sortable Table" cells={columns} onSort={undefined} rows={clusterRows} sortBy={undefined}>
        <TableHeader />
        <TableBody />
      </Table>
    </RenderContent>
  );
};

export default MeshStructurePage;
