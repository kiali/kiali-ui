import { GraphParamsType } from '../../types/Graph';

export const makeURLFromParams = (params: GraphParamsType) =>
  `/service-graph/${params.namespace.name}?layout=${params.graphLayout.name}&duration=${
    params.graphDuration.value
  }&edges=${params.edgeLabelMode}`;

export const makeOverviewURLFromParams = (params: GraphParamsType) =>
  `/overview-graph?layout=${params.graphLayout.name}&duration=${params.graphDuration.value}&edges=${
    params.edgeLabelMode
  }`;
